import { z } from "zod";
export const UUIDSchema = z.string().uuid();
export const CellTypeSchema = z.enum(["markdown", "code", "raw", "unknown"]);
export const OutputTypeSchema = z.enum(["execute_result", "display_data", "stream", "error", "unknown"]);
export const RenderStrategySchema = z.enum([
    "markdown",
    "code",
    "plain_text",
    "html_sanitized",
    "html_iframe",
    "image",
    "svg",
    "latex",
    "dataframe",
    "stream",
    "error",
    "unsupported"
]);
export const SlideLayoutSchema = z.enum([
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
export const SlideStatusSchema = z.enum([
    "normal",
    "too_dense",
    "has_unsupported_output",
    "has_hidden_logs",
    "needs_review"
]);
export const PresentationModeSchema = z.enum(["default", "executive", "teaching", "research"]);
export const ExportTypeSchema = z.enum(["html", "html_zip", "pdf", "pptx", "nbxp"]);
export const AssetTypeSchema = z.enum([
    "source_notebook",
    "image",
    "svg",
    "html",
    "table",
    "thumbnail",
    "export",
    "nbxp"
]);
export const VisibilitySchema = z.object({
    showCode: z.boolean().default(false),
    showOutput: z.boolean().default(true),
    showMarkdown: z.boolean().default(true),
    collapseCode: z.boolean().default(true),
    collapseLogs: z.boolean().default(true),
    includeInExport: z.boolean().default(true)
}).default({
    showCode: false,
    showOutput: true,
    showMarkdown: true,
    collapseCode: true,
    collapseLogs: true,
    includeInExport: true
});
export const SourceNotebookSchema = z.object({
    id: UUIDSchema,
    projectId: UUIDSchema,
    filename: z.string().min(1),
    storageKey: z.string().min(1),
    validationStatus: z.enum(["uploaded", "validating", "valid", "invalid", "failed"]),
    processingStatus: z.enum(["pending", "processing", "processed", "failed"]),
    metadata: z.record(z.string(), z.unknown()).default({})
});
export const NotebookCellSchema = z.object({
    id: UUIDSchema,
    sourceNotebookId: UUIDSchema,
    cellIndex: z.number().int().nonnegative(),
    cellType: CellTypeSchema,
    source: z.string(),
    classification: z.string().optional(),
    isNoise: z.boolean().default(false),
    metadata: z.record(z.string(), z.unknown()).default({})
});
export const NormalizedOutputSchema = z.object({
    id: UUIDSchema,
    sourceCellId: UUIDSchema,
    outputIndex: z.number().int().nonnegative(),
    outputType: OutputTypeSchema,
    mimeType: z.string().optional(),
    data: z.unknown(),
    metadata: z.record(z.string(), z.unknown()).default({}),
    priority: z.number().int().default(0),
    isNoise: z.boolean().default(false),
    renderStrategy: RenderStrategySchema
});
export const SlideBlockSchema = z.object({
    id: UUIDSchema,
    slideId: UUIDSchema,
    sourceCellId: UUIDSchema.optional(),
    sourceOutputId: UUIDSchema.optional(),
    assetId: UUIDSchema.optional(),
    order: z.number().int().nonnegative(),
    blockType: z.enum(["markdown", "code", "output", "image", "table", "html", "latex", "log", "ai_summary"]),
    content: z.record(z.string(), z.unknown()).default({}),
    visibility: VisibilitySchema
});
export const SlideSchema = z.object({
    id: UUIDSchema,
    presentationId: UUIDSchema,
    order: z.number().int().nonnegative(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    layout: SlideLayoutSchema,
    status: SlideStatusSchema.default("normal"),
    sourceCellIds: z.array(UUIDSchema).default([]),
    blocks: z.array(SlideBlockSchema).default([])
});
export const ThemeSchema = z.object({
    id: UUIDSchema,
    name: z.string().min(1),
    slug: z.string().min(1),
    tokens: z.record(z.string(), z.unknown()).default({})
});
export const PresentationSchema = z.object({
    id: UUIDSchema,
    projectId: UUIDSchema,
    sourceNotebookId: UUIDSchema.optional(),
    title: z.string().min(1),
    themeId: UUIDSchema.optional(),
    mode: PresentationModeSchema.default("default"),
    status: z.enum(["draft", "ready", "archived"]).default("draft"),
    slides: z.array(SlideSchema).default([]),
    metadata: z.record(z.string(), z.unknown()).default({}),
    presentationModelVersion: z.literal("1.0.0").default("1.0.0")
});
export const AssetSchema = z.object({
    id: UUIDSchema,
    projectId: UUIDSchema,
    storageKey: z.string().min(1),
    mediaType: z.string().min(1),
    assetType: AssetTypeSchema,
    sha256: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).default({})
});
export const ExportJobSchema = z.object({
    id: UUIDSchema,
    presentationId: UUIDSchema,
    exportType: ExportTypeSchema,
    status: z.enum(["queued", "running", "completed", "failed", "expired"]),
    resultAssetId: UUIDSchema.optional(),
    config: z.record(z.string(), z.unknown()).default({}),
    errorCode: z.string().optional(),
    errorMessage: z.string().optional()
});
export const AiSuggestionSchema = z.object({
    id: UUIDSchema,
    presentationId: UUIDSchema,
    slideId: UUIDSchema.optional(),
    actionType: z.string().min(1),
    status: z.enum(["pending", "accepted", "edited", "rejected"]),
    suggestion: z.record(z.string(), z.unknown()).default({})
});
export const HealthResponseSchema = z.object({
    status: z.literal("ok"),
    service: z.enum(["web", "api", "worker"]),
    timestamp: z.string().datetime(),
    version: z.string().default("0.0.0")
});
//# sourceMappingURL=index.js.map