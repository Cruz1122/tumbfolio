import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonValueSchema, JsonObjectSchema } from "../schemas/index.js";
import { OutputType, RenderStrategy } from "../enums/index.js";

export const NormalizedOutputSchema = z.object({
  id: uuidSchema,
  sourceNotebookId: uuidSchema,
  sourceCellId: uuidSchema,
  outputIndex: z.number().int().nonnegative(),
  outputType: z.nativeEnum(OutputType),
  mimeType: z.string().optional(),
  availableMimeTypes: z.array(z.string()).default([]),
  data: JsonValueSchema.optional(),
  text: z.string().optional(),
  metadata: JsonObjectSchema.default({}),
  priority: z.number().int().default(0),
  isNoise: z.boolean().default(false),
  renderStrategy: z.nativeEnum(RenderStrategy),
  assetId: uuidSchema.optional(),
  errorName: z.string().optional(),
  errorValue: z.string().optional(),
  traceback: z.array(z.string()).optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type NormalizedOutput = z.infer<typeof NormalizedOutputSchema>;
