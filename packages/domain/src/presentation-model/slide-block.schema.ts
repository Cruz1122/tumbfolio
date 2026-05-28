import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { BlockVisibilitySchema } from "../schemas/visibility.schema.js";
import { SlideBlockType } from "../enums/index.js";

/* ------------------------------------------------------------------ */
/*  Shared base fields used by every block variant                     */
/* ------------------------------------------------------------------ */
const baseBlockFields = {
  id: uuidSchema,
  slideId: uuidSchema,
  blockOrder: z.number().int().nonnegative(),
  sourceCellId: uuidSchema.optional(),
  sourceOutputId: uuidSchema.optional(),
  assetId: uuidSchema.optional(),
  visibility: BlockVisibilitySchema,
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
} satisfies Record<string, z.ZodTypeAny>;

/* ------------------------------------------------------------------ */
/*  Variant schemas (discriminated by blockType)                       */
/* ------------------------------------------------------------------ */

export const MarkdownBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Markdown),
  content: z.object({ markdown: z.string() })
});

export const CodeBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Code),
  content: z.object({
    code: z.string(),
    language: z.string().optional()
  })
}).refine(
  (b) => b.sourceCellId !== undefined,
  { message: "CodeBlock must reference a sourceCellId" }
);

export const OutputBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Output),
  content: z.object({
    outputId: z.string().min(1),
    mimeType: z.string().optional(),
    fallbackText: z.string().optional()
  })
}).refine(
  (b) => b.sourceOutputId !== undefined || b.assetId !== undefined,
  { message: "OutputBlock must reference sourceOutputId or assetId" }
);

export const ImageBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Image),
  content: z.object({
    assetId: z.string().min(1),
    alt: z.string().optional(),
    caption: z.string().optional()
  })
}).refine(
  (b) => b.assetId !== undefined || b.content.assetId !== undefined,
  { message: "ImageBlock must reference an assetId" }
);

export const TableBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Table),
  content: z.object({
    assetId: z.string().optional(),
    html: z.string().optional(),
    columns: z.array(z.string()).optional(),
    rowCount: z.number().int().nonnegative().optional(),
    truncated: z.boolean().default(false)
  })
}).refine(
  (b) => b.assetId !== undefined || b.content.html !== undefined,
  { message: "TableBlock must reference assetId or provide html" }
);

export const HtmlBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Html),
  content: z.object({
    assetId: z.string().optional(),
    html: z.string().optional(),
    sandboxRequired: z.boolean()
  })
}).refine(
  (b) => b.assetId !== undefined || b.content.html !== undefined,
  { message: "HtmlBlock must reference assetId or provide html" }
);

export const LatexBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Latex),
  content: z.object({
    latex: z.string(),
    displayMode: z.boolean().default(false)
  })
});

export const LogBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Log),
  content: z.object({
    stream: z.enum(["stdout", "stderr"]),
    text: z.string()
  })
});

export const ErrorBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Error),
  content: z.object({
    errorName: z.string().optional(),
    errorValue: z.string().optional(),
    traceback: z.array(z.string()).optional()
  })
});

export const AiSummaryBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.AiSummary),
  content: z.object({
    text: z.string(),
    aiSuggestionId: z.string().optional()
  })
});

export const PlaceholderBlockSchema = z.object({
  ...baseBlockFields,
  blockType: z.literal(SlideBlockType.Placeholder),
  content: z.object({
    reasonCode: z.string(),
    message: z.string()
  })
});

/* ------------------------------------------------------------------ */
/*  Discriminated union                                                */
/* ------------------------------------------------------------------ */

export const SlideBlockSchema = z.discriminatedUnion("blockType", [
  MarkdownBlockSchema,
  CodeBlockSchema,
  OutputBlockSchema,
  ImageBlockSchema,
  TableBlockSchema,
  HtmlBlockSchema,
  LatexBlockSchema,
  LogBlockSchema,
  ErrorBlockSchema,
  AiSummaryBlockSchema,
  PlaceholderBlockSchema
]);

export type SlideBlock = z.infer<typeof SlideBlockSchema>;

// Individual variant types for ergonomic type exports
export type MarkdownBlock = z.infer<typeof MarkdownBlockSchema>;
export type CodeBlock = z.infer<typeof CodeBlockSchema>;
export type OutputBlock = z.infer<typeof OutputBlockSchema>;
export type ImageBlock = z.infer<typeof ImageBlockSchema>;
export type TableBlock = z.infer<typeof TableBlockSchema>;
export type HtmlBlock = z.infer<typeof HtmlBlockSchema>;
export type LatexBlock = z.infer<typeof LatexBlockSchema>;
export type LogBlock = z.infer<typeof LogBlockSchema>;
export type ErrorBlock = z.infer<typeof ErrorBlockSchema>;
export type AiSummaryBlock = z.infer<typeof AiSummaryBlockSchema>;
export type PlaceholderBlock = z.infer<typeof PlaceholderBlockSchema>;
