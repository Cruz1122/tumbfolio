import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();
const emptyObject = sql`'{}'::jsonb`;
const emptyArray = sql`'[]'::jsonb`;

/* ------------------------------------------------------------------ */
/*  Enums (values aligned with packages/domain)                        */
/* ------------------------------------------------------------------ */

export const notebookValidationStatus = pgEnum("notebook_validation_status", [
  "pending",
  "validating",
  "valid",
  "invalid"
]);

export const notebookProcessingStatus = pgEnum("notebook_processing_status", [
  "idle",
  "queued",
  "processing",
  "processed",
  "failed"
]);

export const cellType = pgEnum("cell_type", [
  "markdown",
  "code",
  "raw",
  "unknown"
]);

export const outputType = pgEnum("output_type", [
  "execute_result",
  "display_data",
  "stream",
  "error",
  "unknown"
]);

export const renderStrategy = pgEnum("render_strategy", [
  "markdown",
  "code",
  "plain_text",
  "html_sanitized",
  "html_sandboxed",
  "image",
  "svg",
  "latex",
  "data_frame",
  "stream",
  "error",
  "placeholder",
  "unsupported"
]);

export const presentationStatus = pgEnum("presentation_status", [
  "draft",
  "ready",
  "archived"
]);

export const presentationMode = pgEnum("presentation_mode", [
  "default",
  "executive",
  "teaching",
  "research"
]);

export const slideLayout = pgEnum("slide_layout", [
  "title",
  "section",
  "content",
  "code_output",
  "output_focus",
  "figure_focus",
  "table_focus",
  "comparison",
  "appendix"
]);

export const slideStatus = pgEnum("slide_status", [
  "normal",
  "too_dense",
  "has_unsupported_output",
  "has_hidden_logs",
  "needs_review"
]);

export const blockType = pgEnum("block_type", [
  "markdown",
  "code",
  "output",
  "image",
  "table",
  "html",
  "latex",
  "log",
  "error",
  "ai_summary",
  "placeholder"
]);

export const assetType = pgEnum("asset_type", [
  "source_notebook",
  "output_image",
  "output_svg",
  "output_html",
  "data_frame",
  "thumbnail",
  "export_html",
  "export_zip",
  "export_pdf",
  "export_pptx",
  "export_nbxp",
  "theme_asset",
  "unknown"
]);

export const exportType = pgEnum("export_type", [
  "html",
  "html_zip",
  "pdf",
  "pptx",
  "nbxp"
]);

export const jobStatus = pgEnum("job_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "expired"
]);

export const aiActionType = pgEnum("ai_action_type", [
  "generate_title",
  "improve_title",
  "summarize_slide",
  "generate_speaker_notes",
  "explain_for_teaching",
  "make_executive",
  "suggest_visibility",
  "propose_conclusion"
]);

export const aiSuggestionStatus = pgEnum("ai_suggestion_status", [
  "pending",
  "accepted",
  "edited",
  "rejected",
  "failed"
]);

/* ------------------------------------------------------------------ */
/*  Tables                                                              */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name"),
    createdAt,
    updatedAt
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email)
  })
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").notNull().default("active"),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    userIdx: index("projects_user_id_idx").on(table.userId),
    statusIdx: index("projects_status_idx").on(table.status),
    createdAtIdx: index("projects_created_at_idx").on(table.createdAt),
    userCreatedAtIdx: index("projects_user_id_created_at_idx").on(
      table.userId,
      table.createdAt
    )
  })
);

export const sourceNotebooks = pgTable(
  "source_notebooks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    originalFilename: text("original_filename").notNull(),
    storageKey: text("storage_key").notNull(),
    sha256: text("sha256"),
    fileSizeBytes: integer("file_size_bytes"),
    nbformat: integer("nbformat"),
    nbformatMinor: integer("nbformat_minor"),
    validationStatus: notebookValidationStatus("validation_status")
      .notNull()
      .default("pending"),
    processingStatus: notebookProcessingStatus("processing_status")
      .notNull()
      .default("idle"),
    cellCount: integer("cell_count").notNull().default(0),
    outputCount: integer("output_count").notNull().default(0),
    detectedMimeTypes: jsonb("detected_mime_types").notNull().default(emptyArray),
    validationErrors: jsonb("validation_errors").notNull().default(emptyArray),
    validationWarnings: jsonb("validation_warnings").notNull().default(emptyArray),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("source_notebooks_project_id_idx").on(table.projectId),
    validationStatusIdx: index("source_notebooks_validation_status_idx").on(
      table.validationStatus
    ),
    processingStatusIdx: index("source_notebooks_processing_status_idx").on(
      table.processingStatus
    ),
    createdAtIdx: index("source_notebooks_created_at_idx").on(table.createdAt),
    storageKeyIdx: uniqueIndex("source_notebooks_storage_key_idx").on(table.storageKey),
    sha256Idx: index("source_notebooks_sha256_idx").on(table.sha256),
    projectCreatedAtIdx: index("source_notebooks_project_id_created_at_idx").on(
      table.projectId,
      table.createdAt
    )
  })
);

export const notebookCells = pgTable(
  "notebook_cells",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceNotebookId: uuid("source_notebook_id")
      .notNull()
      .references(() => sourceNotebooks.id, { onDelete: "cascade" }),
    cellIndex: integer("cell_index").notNull(),
    cellType: cellType("cell_type").notNull(),
    executionCount: integer("execution_count"),
    source: text("source").notNull().default(""),
    classification: text("classification"),
    isNoise: boolean("is_noise").notNull().default(false),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    sourceNotebookIdx: index("notebook_cells_source_notebook_id_idx").on(
      table.sourceNotebookId
    ),
    cellTypeIdx: index("notebook_cells_cell_type_idx").on(table.cellType),
    isNoiseIdx: index("notebook_cells_is_noise_idx").on(table.isNoise),
    sourceNotebookCellIndexIdx: uniqueIndex(
      "notebook_cells_source_notebook_id_cell_index_idx"
    ).on(table.sourceNotebookId, table.cellIndex)
  })
);

export const notebookOutputs = pgTable(
  "notebook_outputs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notebookCellId: uuid("notebook_cell_id")
      .notNull()
      .references(() => notebookCells.id, { onDelete: "cascade" }),
    outputIndex: integer("output_index").notNull(),
    outputType: outputType("output_type").notNull(),
    mimeType: text("mime_type"),
    renderStrategy: renderStrategy("render_strategy")
      .notNull()
      .default("unsupported"),
    priority: integer("priority").notNull().default(0),
    isNoise: boolean("is_noise").notNull().default(false),
    dataJson: jsonb("data_json").notNull().default(emptyObject),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    notebookCellIdx: index("notebook_outputs_notebook_cell_id_idx").on(
      table.notebookCellId
    ),
    outputTypeIdx: index("notebook_outputs_output_type_idx").on(table.outputType),
    renderStrategyIdx: index("notebook_outputs_render_strategy_idx").on(
      table.renderStrategy
    ),
    isNoiseIdx: index("notebook_outputs_is_noise_idx").on(table.isNoise),
    notebookCellOutputIndexIdx: uniqueIndex(
      "notebook_outputs_notebook_cell_id_output_index_idx"
    ).on(table.notebookCellId, table.outputIndex)
  })
);

export const themes = pgTable(
  "themes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    isBuiltin: boolean("is_builtin").notNull().default(true),
    tokensJson: jsonb("tokens_json").notNull().default(emptyObject),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    slugIdx: uniqueIndex("themes_slug_idx").on(table.slug),
    isBuiltinIdx: index("themes_is_builtin_idx").on(table.isBuiltin),
    createdAtIdx: index("themes_created_at_idx").on(table.createdAt)
  })
);

export const presentations = pgTable(
  "presentations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sourceNotebookId: uuid("source_notebook_id").references(
      () => sourceNotebooks.id,
      { onDelete: "set null" }
    ),
    themeId: uuid("theme_id").references(() => themes.id, {
      onDelete: "set null"
    }),
    title: text("title").notNull(),
    mode: presentationMode("mode").notNull().default("default"),
    status: presentationStatus("status").notNull().default("draft"),
    presentationModelVersion: text("presentation_model_version")
      .notNull()
      .default("1.0.0"),
    settingsJson: jsonb("settings_json").notNull().default(emptyObject),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("presentations_project_id_idx").on(table.projectId),
    sourceNotebookIdx: index("presentations_source_notebook_id_idx").on(
      table.sourceNotebookId
    ),
    themeIdx: index("presentations_theme_id_idx").on(table.themeId),
    statusIdx: index("presentations_status_idx").on(table.status),
    modeIdx: index("presentations_mode_idx").on(table.mode),
    createdAtIdx: index("presentations_created_at_idx").on(table.createdAt),
    projectCreatedAtIdx: index("presentations_project_id_created_at_idx").on(
      table.projectId,
      table.createdAt
    )
  })
);

export const slides = pgTable(
  "slides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    slideOrder: integer("slide_order").notNull(),
    title: text("title"),
    subtitle: text("subtitle"),
    layout: slideLayout("layout").notNull().default("content"),
    status: slideStatus("status").notNull().default("normal"),
    speakerNotes: text("speaker_notes"),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    presentationIdx: index("slides_presentation_id_idx").on(table.presentationId),
    statusIdx: index("slides_status_idx").on(table.status),
    layoutIdx: index("slides_layout_idx").on(table.layout),
    createdAtIdx: index("slides_created_at_idx").on(table.createdAt),
    presentationSlideOrderIdx: uniqueIndex(
      "slides_presentation_id_slide_order_idx"
    ).on(table.presentationId, table.slideOrder)
  })
);

export const assets = pgTable(
  "assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    sourceNotebookId: uuid("source_notebook_id").references(
      () => sourceNotebooks.id,
      { onDelete: "set null" }
    ),
    sourceCellId: uuid("source_cell_id").references(() => notebookCells.id, {
      onDelete: "set null"
    }),
    sourceOutputId: uuid("source_output_id").references(
      () => notebookOutputs.id,
      { onDelete: "set null" }
    ),
    assetType: assetType("asset_type").notNull(),
    storageKey: text("storage_key").notNull(),
    filename: text("filename"),
    mediaType: text("media_type").notNull(),
    byteSize: integer("byte_size").notNull().default(0),
    sha256: text("sha256"),
    width: integer("width"),
    height: integer("height"),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("assets_project_id_idx").on(table.projectId),
    sourceNotebookIdx: index("assets_source_notebook_id_idx").on(
      table.sourceNotebookId
    ),
    sourceCellIdx: index("assets_source_cell_id_idx").on(table.sourceCellId),
    sourceOutputIdx: index("assets_source_output_id_idx").on(
      table.sourceOutputId
    ),
    assetTypeIdx: index("assets_asset_type_idx").on(table.assetType),
    createdAtIdx: index("assets_created_at_idx").on(table.createdAt),
    storageKeyIdx: uniqueIndex("assets_storage_key_idx").on(table.storageKey),
    sha256Idx: index("assets_sha256_idx").on(table.sha256)
  })
);

export const slideBlocks = pgTable(
  "slide_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slideId: uuid("slide_id")
      .notNull()
      .references(() => slides.id, { onDelete: "cascade" }),
    sourceCellId: uuid("source_cell_id").references(() => notebookCells.id, {
      onDelete: "set null"
    }),
    sourceOutputId: uuid("source_output_id").references(
      () => notebookOutputs.id,
      { onDelete: "set null" }
    ),
    assetId: uuid("asset_id").references(() => assets.id, {
      onDelete: "set null"
    }),
    blockOrder: integer("block_order").notNull(),
    blockType: blockType("block_type").notNull(),
    contentJson: jsonb("content_json").notNull().default(emptyObject),
    visibilityJson: jsonb("visibility_json").notNull().default(emptyObject),
    renderConfigJson: jsonb("render_config_json").notNull().default(emptyObject),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    slideIdx: index("slide_blocks_slide_id_idx").on(table.slideId),
    sourceCellIdx: index("slide_blocks_source_cell_id_idx").on(table.sourceCellId),
    sourceOutputIdx: index("slide_blocks_source_output_id_idx").on(
      table.sourceOutputId
    ),
    assetIdx: index("slide_blocks_asset_id_idx").on(table.assetId),
    blockTypeIdx: index("slide_blocks_block_type_idx").on(table.blockType),
    createdAtIdx: index("slide_blocks_created_at_idx").on(table.createdAt),
    slideBlockOrderIdx: uniqueIndex(
      "slide_blocks_slide_id_block_order_idx"
    ).on(table.slideId, table.blockOrder)
  })
);

export const exportJobs = pgTable(
  "export_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    requestedByUserId: uuid("requested_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    resultAssetId: uuid("result_asset_id").references(() => assets.id, {
      onDelete: "set null"
    }),
    exportType: exportType("export_type").notNull(),
    status: jobStatus("status").notNull().default("queued"),
    progress: integer("progress").notNull().default(0),
    attempts: integer("attempts").notNull().default(0),
    configJson: jsonb("config_json").notNull().default(emptyObject),
    errorJson: jsonb("error_json").notNull().default(emptyObject),
    queuedAt: timestamp("queued_at", { withTimezone: true }).notNull().defaultNow(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("export_jobs_project_id_idx").on(table.projectId),
    presentationIdx: index("export_jobs_presentation_id_idx").on(
      table.presentationId
    ),
    requestedByUserIdx: index("export_jobs_requested_by_user_id_idx").on(
      table.requestedByUserId
    ),
    resultAssetIdx: index("export_jobs_result_asset_id_idx").on(table.resultAssetId),
    statusIdx: index("export_jobs_status_idx").on(table.status),
    exportTypeIdx: index("export_jobs_export_type_idx").on(table.exportType),
    createdAtIdx: index("export_jobs_created_at_idx").on(table.createdAt),
    presentationStatusCreatedAtIdx: index(
      "export_jobs_presentation_id_status_created_at_idx"
    ).on(table.presentationId, table.status, table.createdAt)
  })
);

export const aiSuggestions = pgTable(
  "ai_suggestions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    slideId: uuid("slide_id").references(() => slides.id, {
      onDelete: "set null"
    }),
    requestedByUserId: uuid("requested_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    actionType: aiActionType("action_type").notNull(),
    status: aiSuggestionStatus("status").notNull().default("pending"),
    inputContextJson: jsonb("input_context_json").notNull().default(emptyObject),
    suggestionJson: jsonb("suggestion_json").notNull().default(emptyObject),
    appliedPatchJson: jsonb("applied_patch_json").notNull().default(emptyObject),
    errorJson: jsonb("error_json").notNull().default(emptyObject),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("ai_suggestions_project_id_idx").on(table.projectId),
    presentationIdx: index("ai_suggestions_presentation_id_idx").on(
      table.presentationId
    ),
    slideIdx: index("ai_suggestions_slide_id_idx").on(table.slideId),
    requestedByUserIdx: index("ai_suggestions_requested_by_user_id_idx").on(
      table.requestedByUserId
    ),
    actionTypeIdx: index("ai_suggestions_action_type_idx").on(table.actionType),
    statusIdx: index("ai_suggestions_status_idx").on(table.status),
    createdAtIdx: index("ai_suggestions_created_at_idx").on(table.createdAt)
  })
);

export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    presentationId: uuid("presentation_id")
      .notNull()
      .references(() => presentations.id, { onDelete: "cascade" }),
    createdByUserId: uuid("created_by_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    tokenHash: text("token_hash").notNull(),
    permissionsJson: jsonb("permissions_json").notNull().default(emptyObject),
    isRevoked: boolean("is_revoked").notNull().default(false),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    createdAt,
    updatedAt
  },
  (table) => ({
    projectIdx: index("share_links_project_id_idx").on(table.projectId),
    presentationIdx: index("share_links_presentation_id_idx").on(
      table.presentationId
    ),
    createdByUserIdx: index("share_links_created_by_user_id_idx").on(
      table.createdByUserId
    ),
    tokenHashIdx: uniqueIndex("share_links_token_hash_idx").on(table.tokenHash),
    isRevokedIdx: index("share_links_is_revoked_idx").on(table.isRevoked),
    createdAtIdx: index("share_links_created_at_idx").on(table.createdAt),
    presentationRevokedIdx: index(
      "share_links_presentation_id_is_revoked_idx"
    ).on(table.presentationId, table.isRevoked)
  })
);

export const activityEvents = pgTable(
  "activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "cascade"
    }),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null"
    }),
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    eventType: text("event_type").notNull(),
    metadataJson: jsonb("metadata_json").notNull().default(emptyObject),
    createdAt
  },
  (table) => ({
    projectIdx: index("activity_events_project_id_idx").on(table.projectId),
    actorUserIdx: index("activity_events_actor_user_id_idx").on(table.actorUserId),
    entityIdx: index("activity_events_entity_type_entity_id_idx").on(
      table.entityType,
      table.entityId
    ),
    eventTypeIdx: index("activity_events_event_type_idx").on(table.eventType),
    createdAtIdx: index("activity_events_created_at_idx").on(table.createdAt),
    projectCreatedAtIdx: index("activity_events_project_id_created_at_idx").on(
      table.projectId,
      table.createdAt
    )
  })
);
