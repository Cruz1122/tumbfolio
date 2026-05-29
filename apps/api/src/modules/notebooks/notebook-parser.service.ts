import { HttpStatus, Injectable } from "@nestjs/common";
import {
  parseNotebookJson,
  type ParsedNotebookOutput,
} from "@tumbfolio/notebook";
import { randomUUID } from "node:crypto";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type {
  GetNotebookCellsQueryDto,
  NotebookCellAssetRefDto,
  NotebookCellDto,
  NotebookCellsResponseDto,
  NotebookOutputSummaryDto,
  ParseNotebookQueryDto,
  ParseNotebookResponseDto,
} from "./dto/notebook.dto.js";
import { DbService } from "../database/database.service.js";
import { StorageService } from "../storage/storage.service.js";

const PARSER_VERSION = "t09-v1";
const DOWNLOAD_URL_TTL_SECONDS = 600;
const MAX_PERSISTED_TEXT_CHARS = 8000;

@Injectable()
export class NotebookParserService {
  constructor(
    private readonly storage: StorageService,
    private readonly db: DbService,
  ) {}

  async parseNotebook(
    notebookId: string,
    options: ParseNotebookQueryDto,
  ): Promise<ParseNotebookResponseDto> {
    const notebook = await this.db.findSourceNotebookById(notebookId);

    if (!notebook) {
      throw new ApiException(
        ApiErrorCode.NOTEBOOK_NOT_FOUND,
        "Notebook was not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    if (notebook.validationStatus !== "valid") {
      throw new ApiException(
        ApiErrorCode.INVALID_STATE,
        "Notebook must be valid before parsing.",
        HttpStatus.CONFLICT,
      );
    }

    const dependentPresentationCount =
      await this.db.countPresentationsBySourceNotebookId(notebookId);

    if (dependentPresentationCount > 0 && !options.force) {
      throw new ApiException(
        ApiErrorCode.PARSE_HAS_DEPENDENT_PRESENTATIONS,
        "Notebook already has generated presentations. Re-parsing could invalidate derived references.",
        HttpStatus.CONFLICT,
      );
    }

    const rawNotebookJson = await this.storage.getObjectAsText(notebook.storageKey);
    const parsed = parseNotebookJson(rawNotebookJson);
    const parseRunId = randomUUID();
    const previousAssets =
      await this.db.listDerivedNotebookAssetsBySourceNotebookId(notebookId);
    const createdStorageKeys: string[] = [];

    try {
      const result = await this.db.transaction(async (tx) => {
        await tx.updateSourceNotebook(notebookId, {
          processingStatus: "processing",
        });

        await tx.deleteOutputsBySourceNotebookId(notebookId);
        await tx.deleteCellsBySourceNotebookId(notebookId);
        await tx.deleteDerivedNotebookAssetsBySourceNotebookId(notebookId);

        let outputCount = 0;
        let assetCount = 0;

        for (const cell of parsed.cells) {
          const createdCell = await tx.createCell({
            sourceNotebookId: notebookId,
            cellIndex: cell.cell_index,
            cellType: cell.cell_type,
            sourceText: cell.source,
            executionCount: cell.execution_count ?? null,
            classification: cell.classification,
            isNoise: cell.is_noise,
            metadataJson: cell.metadata,
          });

          for (const output of cell.outputs) {
            const createdOutput = await tx.createOutput({
              notebookCellId: createdCell.id,
              outputIndex: output.output_index,
              outputType: output.output_type,
              mimeType: output.mime_type ?? null,
              renderStrategy: toPersistentRenderStrategy(output),
              priority: output.priority,
              isNoise: output.is_noise,
              dataJson: summarizeOutputData(output),
              metadataJson: output.metadata,
            });

            const asset = await this.extractAssetIfNeeded({
              output,
              projectId: notebook.projectId,
              notebookId,
              parseRunId,
              cellId: createdCell.id,
              cellIndex: cell.cell_index,
              outputId: createdOutput.id,
              outputIndex: output.output_index,
            });

            if (asset) {
              createdStorageKeys.push(asset.storageKey);
              assetCount += 1;

              await tx.createAsset({
                id: asset.id,
                projectId: notebook.projectId,
                sourceNotebookId: notebookId,
                sourceCellId: createdCell.id,
                sourceOutputId: createdOutput.id,
                storageKey: asset.storageKey,
                filename: asset.filename,
                mediaType: asset.mediaType,
                assetType: asset.assetType,
                byteSize: asset.byteSize,
                sha256: asset.sha256,
                metadataJson: {
                  parse_run_id: parseRunId,
                  cell_index: cell.cell_index,
                  output_index: output.output_index,
                },
              });
            }

            outputCount += 1;
          }
        }

        await tx.updateSourceNotebook(notebookId, {
          processingStatus: "processed",
          cellCount: parsed.cells.length,
          outputCount,
          metadataJson: {
            ...asRecord(notebook.metadataJson),
            parser: {
              parsed_at: new Date().toISOString(),
              parser_version: PARSER_VERSION,
              strategy: "replace_all",
              cell_count: parsed.cells.length,
              output_count: outputCount,
              asset_count: assetCount,
            },
          },
        });

        return {
          source_notebook_id: notebookId,
          cell_count: parsed.cells.length,
          output_count: outputCount,
          asset_count: assetCount,
          processing_status: "processed",
        } satisfies ParseNotebookResponseDto;
      });

      const cleanupFailures = await cleanupStorageObjects(
        this.storage,
        previousAssets.map((asset) => asset.storageKey),
      );
      await this.recordCleanupStatus(notebookId, {
        baseMetadata: notebook.metadataJson,
        parserStatus: "processed",
        deletedAssetCount: previousAssets.length - cleanupFailures.length,
        failedStorageKeys: cleanupFailures,
      });

      return result;
    } catch (error) {
      const cleanupFailures = await cleanupStorageObjects(
        this.storage,
        createdStorageKeys,
      );
      await this.db.updateSourceNotebook(notebookId, {
        processingStatus: "failed",
        metadataJson: {
          ...asRecord(notebook.metadataJson),
          parser: {
            status: "failed",
            failed_at: new Date().toISOString(),
            parser_version: PARSER_VERSION,
            cleanup: {
              status: cleanupFailures.length > 0 ? "warning" : "completed",
              deleted_asset_count:
                createdStorageKeys.length - cleanupFailures.length,
              failed_storage_keys: cleanupFailures,
              attempted_at: new Date().toISOString(),
            },
          },
        },
      });
      throw error;
    }
  }

  async getCells(
    notebookId: string,
    query: GetNotebookCellsQueryDto,
  ): Promise<NotebookCellsResponseDto> {
    const notebook = await this.db.findSourceNotebookById(notebookId);

    if (!notebook) {
      throw new ApiException(
        ApiErrorCode.NOTEBOOK_NOT_FOUND,
        "Notebook was not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    const allCells = await this.db.listCellsBySourceNotebookId(notebookId);
    const cells = paginate(allCells, query.page, query.page_size);
    const outputs = query.include_outputs
      ? await this.db.listOutputsByNotebookCellIds(cells.map((cell) => cell.id))
      : [];
    const assets = outputs.length
      ? await this.db.listAssetsBySourceOutputIds(outputs.map((output) => output.id))
      : [];

    const assetUrls = new Map<string, { url: string; expiresAt: string }>();

    if (query.include_asset_urls) {
      const now = Date.now();
      const urlEntries = await Promise.all(
        assets.map(async (asset) => [
          asset.id,
          {
            url: await this.storage.getSignedDownloadUrl(asset.storageKey),
            expiresAt: new Date(
              now + DOWNLOAD_URL_TTL_SECONDS * 1000,
            ).toISOString(),
          },
        ] as const),
      );

      for (const [assetId, urlData] of urlEntries) {
        assetUrls.set(assetId, urlData);
      }
    }

    const assetByOutputId = new Map(
      assets
        .filter((asset) => asset.sourceOutputId)
        .map((asset) => [asset.sourceOutputId!, asset]),
    );
    const outputsByCellId = new Map<string, NotebookOutputSummaryDto[]>();

    for (const output of outputs) {
      const summary = mapOutputSummary(
        output,
        assetByOutputId.get(output.id) ?? null,
        assetUrls,
        query.preview_chars,
      );
      const list = outputsByCellId.get(output.notebookCellId) ?? [];
      list.push(summary);
      outputsByCellId.set(output.notebookCellId, list);
    }

    const responseCells: NotebookCellDto[] = cells.map((cell) => ({
      id: cell.id,
      cell_index: cell.cellIndex,
      cell_type: cell.cellType,
      source: cell.source,
      source_preview: buildPreview(cell.source, query.preview_chars).preview,
      execution_count: cell.executionCount,
      classification: cell.classification ?? "unclassified",
      is_noise: cell.isNoise,
      metadata: asRecord(cell.metadataJson),
      outputs: query.include_outputs ? outputsByCellId.get(cell.id) ?? [] : [],
    }));

    return {
      source_notebook_id: notebookId,
      cells: responseCells,
    };
  }

  private async extractAssetIfNeeded(input: {
    output: ParsedNotebookOutput;
    projectId: string;
    notebookId: string;
    parseRunId: string;
    cellId: string;
    cellIndex: number;
    outputId: string;
    outputIndex: number;
  }) {
    const { output } = input;

    if (!output.mime_type) {
      return null;
    }

    if (
      output.mime_type !== "image/png" &&
      output.mime_type !== "image/jpeg" &&
      output.mime_type !== "image/svg+xml"
    ) {
      return null;
    }

    const buffer = decodeOutputAsset(output.data, output.mime_type);
    const extension = extensionForMime(output.mime_type);
    const filename = `cell-${input.cellIndex}-output-${input.outputIndex}.${extension}`;

    const stored = await this.storage.storeBuffer({
      namespace: "assets",
      projectId: input.projectId,
      objectId: `${input.notebookId}-${input.parseRunId}-cell-${input.cellIndex}-output-${input.outputIndex}`,
      buffer,
      fallbackMimeType: output.mime_type,
      metadata: {
        source_notebook_id: input.notebookId,
        source_output_id: input.outputId,
      },
    });

    return {
      id: randomUUID(),
      storageKey: stored.key,
      filename,
      mediaType: stored.mediaType,
      byteSize: stored.sizeBytes,
      sha256: stored.sha256,
      assetType: output.mime_type === "image/svg+xml" ? "output_svg" : "output_image",
    };
  }

  private async recordCleanupStatus(
    notebookId: string,
    input: {
      baseMetadata: unknown;
      parserStatus: "processed" | "failed";
      deletedAssetCount: number;
      failedStorageKeys: string[];
    },
  ) {
    const latest = await this.db.findSourceNotebookById(notebookId);
    const latestMetadata = latest?.metadataJson ?? input.baseMetadata;
    const parserMetadata = asRecord(asRecord(latestMetadata).parser);

    await this.db.updateSourceNotebook(notebookId, {
      metadataJson: {
        ...asRecord(latestMetadata),
        parser: {
          ...parserMetadata,
          status: input.parserStatus,
          cleanup: {
            status:
              input.failedStorageKeys.length > 0 ? "warning" : "completed",
            deleted_asset_count: input.deletedAssetCount,
            failed_storage_keys: input.failedStorageKeys,
            attempted_at: new Date().toISOString(),
          },
        },
      },
    });
  }
}

function summarizeOutputData(output: ParsedNotebookOutput) {
  if (output.render_strategy === "image" || output.render_strategy === "svg") {
    return {};
  }

  const textSource =
    output.text ??
    (typeof output.data === "string" ? output.data : undefined) ??
    (output.traceback ? output.traceback.join("\n") : undefined) ??
    "";
  const persisted = buildPreview(textSource, MAX_PERSISTED_TEXT_CHARS);

  return {
    text_content: persisted.preview,
    truncated: persisted.truncated,
    original_length: textSource.length,
    error:
      output.output_type === "error"
        ? {
            ename: output.ename,
            evalue: output.evalue,
          }
        : undefined,
  };
}

function mapOutputSummary(
  output: {
    id: string;
    outputIndex: number;
    outputType: string;
    mimeType: string | null;
    renderStrategy: string;
    priority: number;
    isNoise: boolean;
    dataJson: unknown;
  },
  asset: {
    id: string;
    assetType: string;
    mediaType: string;
    filename: string | null;
    byteSize: number;
    sha256: string | null;
  } | null,
  assetUrls: Map<string, { url: string; expiresAt: string }>,
  previewChars: number,
): NotebookOutputSummaryDto {
  const data = asRecord(output.dataJson);
  const textContent =
    typeof data.text_content === "string" ? data.text_content : undefined;
  const preview = textContent ? buildPreview(textContent, previewChars) : null;
  const error = asRecord(data.error);
  const assetUrl = asset ? assetUrls.get(asset.id) : undefined;

  return {
    id: output.id,
    output_index: output.outputIndex,
    output_type: output.outputType as NotebookOutputSummaryDto["output_type"],
    render_strategy: toResponseRenderStrategy(
      output.renderStrategy,
      output.mimeType ?? undefined,
    ),
    priority: output.priority,
    is_noise: output.isNoise,
    truncated:
      preview?.truncated ??
      (typeof data.truncated === "boolean" ? data.truncated : false),
    ...(output.mimeType ? { mime_type: output.mimeType } : {}),
    ...(preview?.preview ? { text_preview: preview.preview } : {}),
    ...(asset
      ? {
          asset: {
            asset_id: asset.id,
            kind: assetKindFromMime(asset.mediaType),
            mime_type: asset.mediaType,
            filename: asset.filename,
            size_bytes: asset.byteSize,
            checksum_sha256: asset.sha256,
            download_url: assetUrl?.url ?? null,
            download_url_expires_at: assetUrl?.expiresAt ?? null,
          } satisfies NotebookCellAssetRefDto,
        }
      : {}),
    ...(Object.keys(error).length > 0
      ? {
          error: {
            ...(typeof error.ename === "string" ? { ename: error.ename } : {}),
            ...(typeof error.evalue === "string"
              ? { evalue: error.evalue }
              : {}),
          },
        }
      : {}),
  };
}

function toPersistentRenderStrategy(output: ParsedNotebookOutput): string {
  switch (output.render_strategy) {
    case "html":
      return "html_sanitized";
    case "json":
      return "plain_text";
    default:
      return output.render_strategy;
  }
}

function toResponseRenderStrategy(
  renderStrategy: string,
  mimeType?: string,
): NotebookOutputSummaryDto["render_strategy"] {
  if (mimeType === "application/json") return "json";
  if (renderStrategy === "html_sanitized") return "html";
  if (renderStrategy === "plain_text") return "plain_text";
  if (renderStrategy === "image") return "image";
  if (renderStrategy === "svg") return "svg";
  if (renderStrategy === "stream") return "stream";
  if (renderStrategy === "error") return "error";
  return "unsupported";
}

function buildPreview(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return { preview: text, truncated: false };
  }

  return {
    preview: text.slice(0, maxChars),
    truncated: true,
  };
}

function paginate<T>(items: T[], page?: number, pageSize?: number) {
  if (!page || !pageSize) {
    return items;
  }

  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function decodeOutputAsset(data: unknown, mimeType: string): Buffer {
  if (typeof data !== "string") {
    throw new ApiException(
      ApiErrorCode.INVALID_INPUT,
      `Expected encoded payload for ${mimeType}.`,
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }

  if (mimeType === "image/svg+xml") {
    return Buffer.from(data, "utf8");
  }

  return Buffer.from(data, "base64");
}

function extensionForMime(mimeType: string): "png" | "jpg" | "svg" {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/jpeg") return "jpg";
  return "svg";
}

function assetKindFromMime(
  mimeType: string,
): NotebookCellAssetRefDto["kind"] {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType === "text/html") return "html";
  if (mimeType === "application/json") return "json";
  if (mimeType.startsWith("text/")) return "text";
  return "binary";
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function cleanupStorageObjects(
  storage: StorageService,
  keys: string[],
) {
  const failedKeys: string[] = [];

  await Promise.all(
    keys.map(async (key) => {
      try {
        await storage.deleteObject(key);
      } catch {
        failedKeys.push(key);
      }
    }),
  );

  return failedKeys;
}
