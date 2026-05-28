import { z } from "zod";
import { CellType, OutputType, NotebookValidationStatus } from "../enums/index.js";

export const NotebookAnalysisSummarySchema = z.object({
  sourceNotebookId: z.string().min(1),
  validationStatus: z.nativeEnum(NotebookValidationStatus),
  cellCount: z.number().int().nonnegative(),
  outputCount: z.number().int().nonnegative(),
  cellsByType: z.record(z.nativeEnum(CellType), z.number().int().nonnegative()),
  outputsByType: z.record(z.nativeEnum(OutputType), z.number().int().nonnegative()),
  detectedMimeTypes: z.array(z.string()),
  unsupportedMimeTypes: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  errors: z.array(z.string()).default([])
});

export type NotebookAnalysisSummary = z.infer<typeof NotebookAnalysisSummarySchema>;
