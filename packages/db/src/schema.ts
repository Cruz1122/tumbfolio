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

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const notebookValidationStatus = pgEnum("notebook_validation_status", [
  "uploaded",
  "validating",
  "valid",
  "invalid",
  "failed"
]);

export const notebookProcessingStatus = pgEnum("notebook_processing_status", [
  "pending",
  "processing",
  "processed",
  "failed"
]);

export const presentationStatus = pgEnum("presentation_status", ["draft", "ready", "archived"]);
export const exportJobStatus = pgEnum("export_job_status", [
  "queued",
  "running",
  "completed",
  "failed",
  "expired"
]);
export const exportType = pgEnum("export_type", ["html", "html_zip", "pdf", "pptx", "nbxp"]);
export const aiSuggestionStatus = pgEnum("ai_suggestion_status", [
  "pending",
  "accepted",
  "edited",
  "rejected"
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  name: text("name"),
  ...timestamps
}, (table) => [uniqueIndex("users_email_idx").on(table.email)]);

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  name: text("name").notNull(),
  status: text("status").notNull().default("active"),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [index("projects_user_id_idx").on(table.userId)]);

export const sourceNotebooks = pgTable("source_notebooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  storageKey: text("storage_key").notNull(),
  sha256: text("sha256"),
  fileSizeBytes: integer("file_size_bytes"),
  validationStatus: notebookValidationStatus("validation_status").notNull().default("uploaded"),
  processingStatus: notebookProcessingStatus("processing_status").notNull().default("pending"),
  validationErrors: jsonb("validation_errors").$type<string[]>().notNull().default([]),
  validationWarnings: jsonb("validation_warnings").$type<string[]>().notNull().default([]),
  detectedMimeTypes: jsonb("detected_mime_types").$type<string[]>().notNull().default([]),
  cellCount: integer("cell_count").notNull().default(0),
  outputCount: integer("output_count").notNull().default(0),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("source_notebooks_project_id_idx").on(table.projectId),
  index("source_notebooks_validation_status_idx").on(table.validationStatus)
]);

export const notebookCells = pgTable("notebook_cells", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceNotebookId: uuid("source_notebook_id").notNull().references(() => sourceNotebooks.id, { onDelete: "cascade" }),
  cellIndex: integer("cell_index").notNull(),
  cellType: text("cell_type").notNull(),
  source: text("source").notNull().default(""),
  classification: text("classification"),
  isNoise: boolean("is_noise").notNull().default(false),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("notebook_cells_source_notebook_id_idx").on(table.sourceNotebookId),
  uniqueIndex("notebook_cells_order_idx").on(table.sourceNotebookId, table.cellIndex)
]);

export const notebookOutputs = pgTable("notebook_outputs", {
  id: uuid("id").primaryKey().defaultRandom(),
  notebookCellId: uuid("notebook_cell_id").notNull().references(() => notebookCells.id, { onDelete: "cascade" }),
  outputIndex: integer("output_index").notNull(),
  outputType: text("output_type").notNull(),
  mimeType: text("mime_type"),
  renderStrategy: text("render_strategy").notNull().default("unsupported"),
  priority: integer("priority").notNull().default(0),
  isNoise: boolean("is_noise").notNull().default(false),
  dataJson: jsonb("data_json").$type<unknown>(),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("notebook_outputs_cell_id_idx").on(table.notebookCellId),
  uniqueIndex("notebook_outputs_order_idx").on(table.notebookCellId, table.outputIndex)
]);

export const themes = pgTable("themes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  tokensJson: jsonb("tokens_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [uniqueIndex("themes_slug_idx").on(table.slug)]);

export const presentations = pgTable("presentations", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  sourceNotebookId: uuid("source_notebook_id").references(() => sourceNotebooks.id),
  title: text("title").notNull(),
  themeId: uuid("theme_id").references(() => themes.id),
  mode: text("mode").notNull().default("default"),
  status: presentationStatus("status").notNull().default("draft"),
  presentationModelVersion: text("presentation_model_version").notNull().default("1.0.0"),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("presentations_project_id_idx").on(table.projectId),
  index("presentations_source_notebook_id_idx").on(table.sourceNotebookId)
]);

export const slides = pgTable("slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  slideOrder: integer("slide_order").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  layout: text("layout").notNull(),
  status: text("status").notNull().default("normal"),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("slides_presentation_id_idx").on(table.presentationId),
  uniqueIndex("slides_order_idx").on(table.presentationId, table.slideOrder)
]);

export const assets = pgTable("assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  storageKey: text("storage_key").notNull(),
  mediaType: text("media_type").notNull(),
  assetType: text("asset_type").notNull(),
  sha256: text("sha256"),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("assets_project_id_idx").on(table.projectId),
  uniqueIndex("assets_storage_key_idx").on(table.storageKey)
]);

export const slideBlocks = pgTable("slide_blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  slideId: uuid("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  sourceCellId: uuid("source_cell_id").references(() => notebookCells.id),
  sourceOutputId: uuid("source_output_id").references(() => notebookOutputs.id),
  assetId: uuid("asset_id").references(() => assets.id),
  blockOrder: integer("block_order").notNull(),
  blockType: text("block_type").notNull(),
  contentJson: jsonb("content_json").$type<Record<string, unknown>>().notNull().default({}),
  visibilityJson: jsonb("visibility_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("slide_blocks_slide_id_idx").on(table.slideId),
  index("slide_blocks_source_cell_id_idx").on(table.sourceCellId),
  index("slide_blocks_source_output_id_idx").on(table.sourceOutputId),
  uniqueIndex("slide_blocks_order_idx").on(table.slideId, table.blockOrder)
]);

export const exportJobs = pgTable("export_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  exportType: exportType("export_type").notNull(),
  status: exportJobStatus("status").notNull().default("queued"),
  resultAssetId: uuid("result_asset_id").references(() => assets.id),
  configJson: jsonb("config_json").$type<Record<string, unknown>>().notNull().default({}),
  errorCode: text("error_code"),
  errorMessage: text("error_message"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...timestamps
}, (table) => [
  index("export_jobs_presentation_id_idx").on(table.presentationId),
  index("export_jobs_status_idx").on(table.status)
]);

export const aiSuggestions = pgTable("ai_suggestions", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  slideId: uuid("slide_id").references(() => slides.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),
  status: aiSuggestionStatus("status").notNull().default("pending"),
  contextJson: jsonb("context_json").$type<Record<string, unknown>>().notNull().default({}),
  suggestionJson: jsonb("suggestion_json").$type<Record<string, unknown>>().notNull().default({}),
  ...timestamps
}, (table) => [
  index("ai_suggestions_presentation_id_idx").on(table.presentationId),
  index("ai_suggestions_slide_id_idx").on(table.slideId)
]);

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  presentationId: uuid("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  permission: text("permission").notNull().default("view_only"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps
}, (table) => [
  index("share_links_presentation_id_idx").on(table.presentationId),
  uniqueIndex("share_links_token_hash_idx").on(table.tokenHash)
]);

export const activityEvents = pgTable("activity_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  eventType: text("event_type").notNull(),
  payloadJson: jsonb("payload_json").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
}, (table) => [
  index("activity_events_project_id_idx").on(table.projectId),
  index("activity_events_entity_idx").on(table.entityType, table.entityId)
]);
