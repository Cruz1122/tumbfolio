import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { CellType, CellClassification } from "../enums/index.js";

export const NotebookCellSchema = z.object({
  id: uuidSchema,
  sourceNotebookId: uuidSchema,
  cellIndex: z.number().int().nonnegative(),
  cellType: z.nativeEnum(CellType),
  source: z.string(),
  language: z.string().optional(),
  executionCount: z.number().int().nonnegative().optional(),
  classification: z.nativeEnum(CellClassification).optional(),
  isNoise: z.boolean().default(false),
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type NotebookCell = z.infer<typeof NotebookCellSchema>;
