import { z } from "zod";

// ── Base config fields shared by all export types ──

const ExportConfigBase = {
  includeSpeakerNotes: z.boolean().default(false),
  includeAppendix: z.boolean().default(true),
  includeHiddenBlocks: z.boolean().default(false),
  includeCode: z.boolean().default(true),
  themeId: z.string().optional()
};

// ── Export-type specific configs ──

export const HtmlExportConfigSchema = z.object({
  ...ExportConfigBase,
  exportType: z.literal("html")
});

export const HtmlZipExportConfigSchema = z.object({
  ...ExportConfigBase,
  exportType: z.literal("html_zip")
});

export const PdfExportConfigSchema = z.object({
  ...ExportConfigBase,
  exportType: z.literal("pdf"),
  pageSize: z.string().default("A4"),
  printBackground: z.boolean().default(true)
});

export const PptxExportConfigSchema = z.object({
  ...ExportConfigBase,
  exportType: z.literal("pptx"),
  rasterizeComplexHtml: z.boolean().default(true)
});

export const NbxpExportConfigSchema = z.object({
  ...ExportConfigBase,
  exportType: z.literal("nbxp"),
  embedSourceNotebook: z.boolean().default(false),
  includeThumbnails: z.boolean().default(true)
});

export const ExportConfigSchema = z.discriminatedUnion("exportType", [
  HtmlExportConfigSchema,
  HtmlZipExportConfigSchema,
  PdfExportConfigSchema,
  PptxExportConfigSchema,
  NbxpExportConfigSchema
]);

export type ExportConfig = z.infer<typeof ExportConfigSchema>;
