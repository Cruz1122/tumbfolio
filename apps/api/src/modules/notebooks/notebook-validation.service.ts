import { HttpStatus, Injectable } from "@nestjs/common";
import { analyzeNotebookJson } from "@tumbfolio/notebook";
import { ApiErrorCode } from "../../common/errors/api-error-code.js";
import { ApiException } from "../../common/errors/api.exception.js";
import type { DbService } from "../database/database.service.js";
import type { StorageService } from "../storage/storage.service.js";
import type { NotebookSummaryDto } from "./dto/notebook.dto.js";

const MAX_NOTEBOOK_SIZE_BYTES = 50 * 1024 * 1024;

@Injectable()
export class NotebookValidationService {
  constructor(
    private readonly storage: StorageService,
    private readonly db: DbService,
  ) {}

  async validateNotebook(notebookId: string): Promise<NotebookSummaryDto> {
    const notebook = await this.db.findSourceNotebookById(notebookId);

    if (!notebook) {
      throw new ApiException(
        ApiErrorCode.NOTEBOOK_NOT_FOUND,
        "Notebook was not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    await this.db.updateSourceNotebook(notebookId, {
      validationStatus: "validating",
    });

    const raw = await this.storage.getObjectAsText(notebook.storageKey);
    const analysis = analyzeNotebookJson(raw, {
      maxFileSizeBytes: MAX_NOTEBOOK_SIZE_BYTES,
    });
    const validationStatus = analysis.valid ? "valid" : "invalid";

    const updated = await this.db.updateSourceNotebook(notebookId, {
      validationStatus,
      cellCount: analysis.cellCount,
      outputCount: analysis.outputCount,
      detectedMimeTypes: analysis.detectedMimeTypes,
      validationErrors: analysis.errors,
      validationWarnings: analysis.warnings,
      metadataJson: {
        ...(isRecord(notebook.metadataJson) ? notebook.metadataJson : {}),
        validation: {
          status: validationStatus,
          errors: analysis.errors,
          warnings: analysis.warnings,
          validated_at: new Date().toISOString(),
        },
      },
      ...(analysis.nbformat !== null ? { nbformat: analysis.nbformat } : {}),
      ...(analysis.nbformatMinor !== undefined
        ? { nbformatMinor: analysis.nbformatMinor }
        : {}),
    });

    if (!updated) {
      throw new ApiException(
        ApiErrorCode.NOTEBOOK_NOT_FOUND,
        "Notebook was not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    return mapNotebookSummary(updated);
  }

  async getSummary(notebookId: string): Promise<NotebookSummaryDto> {
    const notebook = await this.db.findSourceNotebookById(notebookId);

    if (!notebook) {
      throw new ApiException(
        ApiErrorCode.NOTEBOOK_NOT_FOUND,
        "Notebook was not found.",
        HttpStatus.NOT_FOUND,
      );
    }

    return mapNotebookSummary(notebook);
  }
}

function mapNotebookSummary(notebook: {
  id: string;
  projectId: string;
  originalFilename: string;
  processingStatus: string;
  validationStatus: string;
  cellCount: number;
  outputCount: number;
  detectedMimeTypes: unknown;
  validationErrors: unknown;
  validationWarnings: unknown;
}): NotebookSummaryDto {
  return {
    id: notebook.id,
    project_id: notebook.projectId,
    original_filename: notebook.originalFilename,
    processing_status: notebook.processingStatus,
    validation_status: notebook.validationStatus,
    cell_count: notebook.cellCount,
    output_count: notebook.outputCount,
    detected_mime_types: asStringArray(notebook.detectedMimeTypes),
    validation_errors: asUnknownArray(notebook.validationErrors),
    validation_warnings: asUnknownArray(notebook.validationWarnings),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
