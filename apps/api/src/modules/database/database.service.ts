import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { and, asc, count, eq, inArray } from "drizzle-orm";
import { type PgTransaction } from "drizzle-orm/pg-core";
import {
  createDbClient,
  users,
  projects,
  sourceNotebooks,
  notebookCells,
  notebookOutputs,
  assets,
  presentations,
} from "@tumbfolio/db";
import { randomUUID } from "node:crypto";

type DbExecutor = ReturnType<typeof createDbClient>["db"];

/* ------------------------------------------------------------------ */
/*  Transaction-scoped DAO                                             */
/* ------------------------------------------------------------------ */

class TransactionDb {
  constructor(private readonly tx: DbExecutor) {}

  /* ---- users ---- */

  async findLocalUser() {
    const rows = await this.tx
      .select()
      .from(users)
      .where(eq(users.email, "local@tumbfolio.dev"))
      .limit(1);
    return rows[0] ?? null;
  }

  async createUser(input: { email: string; name: string }) {
    const rows = await this.tx
      .insert(users)
      .values({ id: randomUUID(), email: input.email, name: input.name })
      .returning();
    return rows[0]!;
  }

  /* ---- projects ---- */

  async createProject(input: { userId: string; name: string; status: string }) {
    const rows = await this.tx
      .insert(projects)
      .values({
        id: randomUUID(),
        userId: input.userId,
        name: input.name,
        status: input.status,
      })
      .returning();
    return rows[0]!;
  }

  /* ---- source_notebooks ---- */

  async createSourceNotebook(input: {
    projectId: string;
    filename: string;
    storageKey: string;
    validationStatus: string;
    processingStatus: string;
    fileSizeBytes?: number;
    sha256?: string;
    metadataJson: Record<string, unknown>;
  }) {
    const rows = await this.tx
      .insert(sourceNotebooks)
      .values({
        id: randomUUID(),
        projectId: input.projectId,
        originalFilename: input.filename,
        storageKey: input.storageKey,
        validationStatus: input.validationStatus as never,
        processingStatus: input.processingStatus as never,
        fileSizeBytes: input.fileSizeBytes ?? null,
        sha256: input.sha256 ?? null,
        metadataJson: input.metadataJson,
      })
      .returning();
    return rows[0]!;
  }

  async findSourceNotebookById(id: string) {
    const rows = await this.tx
      .select()
      .from(sourceNotebooks)
      .where(eq(sourceNotebooks.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async countPresentationsBySourceNotebookId(sourceNotebookId: string) {
    const rows = await this.tx
      .select({ count: count() })
      .from(presentations)
      .where(eq(presentations.sourceNotebookId, sourceNotebookId));

    return rows[0]?.count ?? 0;
  }

  async updateSourceNotebook(
    id: string,
    input: Partial<{
      nbformat: number;
      nbformatMinor: number;
      validationStatus: string;
      processingStatus: string;
      cellCount: number;
      outputCount: number;
      detectedMimeTypes: string[];
      validationErrors: unknown[];
      validationWarnings: unknown[];
      metadataJson: Record<string, unknown>;
    }>,
  ) {
    const values: Record<string, unknown> = {};
    if (input.nbformat !== undefined) values.nbformat = input.nbformat;
    if (input.nbformatMinor !== undefined)
      values.nbformatMinor = input.nbformatMinor;
    if (input.validationStatus !== undefined)
      values.validationStatus = input.validationStatus;
    if (input.processingStatus !== undefined)
      values.processingStatus = input.processingStatus;
    if (input.cellCount !== undefined) values.cellCount = input.cellCount;
    if (input.outputCount !== undefined) values.outputCount = input.outputCount;
    if (input.detectedMimeTypes !== undefined)
      values.detectedMimeTypes = input.detectedMimeTypes;
    if (input.validationErrors !== undefined)
      values.validationErrors = input.validationErrors;
    if (input.validationWarnings !== undefined)
      values.validationWarnings = input.validationWarnings;
    if (input.metadataJson !== undefined)
      values.metadataJson = input.metadataJson;

    const rows = await this.tx
      .update(sourceNotebooks)
      .set(values)
      .where(eq(sourceNotebooks.id, id))
      .returning();
    return rows[0] ?? null;
  }

  /* ---- notebook_cells ---- */

  async deleteCellsBySourceNotebookId(sourceNotebookId: string) {
    await this.tx
      .delete(notebookCells)
      .where(eq(notebookCells.sourceNotebookId, sourceNotebookId));
  }

  async createCell(input: {
    sourceNotebookId: string;
    cellIndex: number;
    cellType: string;
    sourceText: string;
    executionCount: number | null;
    classification: string | null;
    isNoise: boolean;
    metadataJson: Record<string, unknown>;
  }) {
    const rows = await this.tx
      .insert(notebookCells)
      .values({
        id: randomUUID(),
        sourceNotebookId: input.sourceNotebookId,
        cellIndex: input.cellIndex,
        cellType: input.cellType as never,
        source: input.sourceText,
        executionCount: input.executionCount,
        classification: input.classification,
        isNoise: input.isNoise,
        metadataJson: input.metadataJson,
      })
      .returning();
    return rows[0]!;
  }

  /* ---- notebook_outputs ---- */

  async deleteOutputsBySourceNotebookId(sourceNotebookId: string) {
    // Cascade delete via cells — first find cell ids
    const cells = await this.tx
      .select({ id: notebookCells.id })
      .from(notebookCells)
      .where(eq(notebookCells.sourceNotebookId, sourceNotebookId));

    if (cells.length > 0) {
      await this.tx
        .delete(notebookOutputs)
        .where(
          inArray(
            notebookOutputs.notebookCellId,
            cells.map((c) => c.id),
          ),
        );
    }
  }

  async createOutput(input: {
    notebookCellId: string;
    outputIndex: number;
    outputType: string;
    mimeType: string | null;
    renderStrategy: string;
    priority: number;
    isNoise: boolean;
    dataJson: unknown;
    metadataJson: Record<string, unknown>;
  }) {
    const rows = await this.tx
      .insert(notebookOutputs)
      .values({
        id: randomUUID(),
        notebookCellId: input.notebookCellId,
        outputIndex: input.outputIndex,
        outputType: input.outputType as never,
        mimeType: input.mimeType,
        renderStrategy: input.renderStrategy as never,
        priority: input.priority,
        isNoise: input.isNoise,
        dataJson: input.dataJson ?? {},
        metadataJson: input.metadataJson,
      })
      .returning();
    return rows[0]!;
  }

  async listCellsBySourceNotebookId(sourceNotebookId: string) {
    return this.tx
      .select()
      .from(notebookCells)
      .where(eq(notebookCells.sourceNotebookId, sourceNotebookId))
      .orderBy(asc(notebookCells.cellIndex));
  }

  async listOutputsByNotebookCellIds(notebookCellIds: string[]) {
    if (notebookCellIds.length === 0) {
      return [];
    }

    return this.tx
      .select()
      .from(notebookOutputs)
      .where(inArray(notebookOutputs.notebookCellId, notebookCellIds))
      .orderBy(asc(notebookOutputs.outputIndex));
  }

  /* ---- assets ---- */

  async createAsset(input: {
    id: string;
    projectId: string;
    sourceNotebookId?: string | null;
    sourceCellId?: string | null;
    sourceOutputId?: string | null;
    storageKey: string;
    filename?: string | null;
    mediaType: string;
    assetType: string;
    byteSize?: number;
    sha256: string;
    width?: number | null;
    height?: number | null;
    metadataJson: Record<string, unknown>;
  }) {
    const rows = await this.tx
      .insert(assets)
      .values({
        id: input.id,
        projectId: input.projectId,
        sourceNotebookId: input.sourceNotebookId ?? null,
        sourceCellId: input.sourceCellId ?? null,
        sourceOutputId: input.sourceOutputId ?? null,
        storageKey: input.storageKey,
        filename: input.filename ?? null,
        mediaType: input.mediaType,
        assetType: input.assetType as never,
        sha256: input.sha256,
        byteSize: input.byteSize ?? 0,
        width: input.width ?? null,
        height: input.height ?? null,
        metadataJson: input.metadataJson,
      })
      .returning();
    return rows[0]!;
  }

  async listDerivedNotebookAssetsBySourceNotebookId(sourceNotebookId: string) {
    return this.tx
      .select()
      .from(assets)
      .where(
        and(
          eq(assets.sourceNotebookId, sourceNotebookId),
          inArray(assets.assetType, ["output_image", "output_svg"]),
        ),
      );
  }

  async deleteDerivedNotebookAssetsBySourceNotebookId(sourceNotebookId: string) {
    await this.tx
      .delete(assets)
      .where(
        and(
          eq(assets.sourceNotebookId, sourceNotebookId),
          inArray(assets.assetType, ["output_image", "output_svg"]),
        ),
      );
  }

  async listAssetsBySourceOutputIds(sourceOutputIds: string[]) {
    if (sourceOutputIds.length === 0) {
      return [];
    }

    return this.tx
      .select()
      .from(assets)
      .where(inArray(assets.sourceOutputId, sourceOutputIds));
  }
}

/* ------------------------------------------------------------------ */
/*  DbService — root service (no-transaction + transaction)            */
/* ------------------------------------------------------------------ */

@Injectable()
export class DbService implements OnModuleDestroy {
  private client: ReturnType<typeof createDbClient>;

  constructor() {
    this.client = createDbClient();
  }

  onModuleDestroy() {
    this.client.close();
  }

  /* ---- non-transactional helpers ---- */

  async findSourceNotebookById(id: string) {
    const tx = new TransactionDb(this.client.db);
    return tx.findSourceNotebookById(id);
  }

  async updateSourceNotebook(
    id: string,
    input: Parameters<TransactionDb["updateSourceNotebook"]>[1],
  ) {
    const tx = new TransactionDb(this.client.db);
    return tx.updateSourceNotebook(id, input);
  }

  async countPresentationsBySourceNotebookId(sourceNotebookId: string) {
    const tx = new TransactionDb(this.client.db);
    return tx.countPresentationsBySourceNotebookId(sourceNotebookId);
  }

  async listCellsBySourceNotebookId(sourceNotebookId: string) {
    const tx = new TransactionDb(this.client.db);
    return tx.listCellsBySourceNotebookId(sourceNotebookId);
  }

  async listOutputsByNotebookCellIds(notebookCellIds: string[]) {
    const tx = new TransactionDb(this.client.db);
    return tx.listOutputsByNotebookCellIds(notebookCellIds);
  }

  async listAssetsBySourceOutputIds(sourceOutputIds: string[]) {
    const tx = new TransactionDb(this.client.db);
    return tx.listAssetsBySourceOutputIds(sourceOutputIds);
  }

  async listDerivedNotebookAssetsBySourceNotebookId(sourceNotebookId: string) {
    const tx = new TransactionDb(this.client.db);
    return tx.listDerivedNotebookAssetsBySourceNotebookId(sourceNotebookId);
  }

  /* ---- transaction ---- */

  async transaction<T>(
    fn: (tx: TransactionDb) => Promise<T>,
  ): Promise<T> {
    return this.client.db.transaction(async (drizzleTx) => {
      const dao = new TransactionDb(drizzleTx as unknown as DbExecutor);
      return fn(dao);
    });
  }
}
