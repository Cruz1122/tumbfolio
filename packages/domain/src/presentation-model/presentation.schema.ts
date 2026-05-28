import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { PresentationMode, PresentationStatus } from "../enums/index.js";

export const PresentationSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  sourceNotebookId: uuidSchema.optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  themeId: uuidSchema.optional(),
  mode: z.nativeEnum(PresentationMode).default("default"),
  status: z.nativeEnum(PresentationStatus).default("draft"),
  slideCount: z.number().int().nonnegative().default(0),
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type Presentation = z.infer<typeof PresentationSchema>;
