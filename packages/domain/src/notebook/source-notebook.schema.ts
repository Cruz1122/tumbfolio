import { z } from "zod";
import { uuidSchema, storageKeySchema, sha256Schema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { NotebookValidationStatus, NotebookProcessingStatus } from "../enums/index.js";

export const SourceNotebookSchema = z.object({
  id: uuidSchema,
  projectId: uuidSchema,
  originalFilename: z.string().min(1),
  storageKey: storageKeySchema,
  fileSizeBytes: z.number().int().nonnegative().optional(),
  sha256: sha256Schema.optional(),
  nbformat: z.number().int().nonnegative().optional(),
  nbformatMinor: z.number().int().nonnegative().optional(),
  validationStatus: z.nativeEnum(NotebookValidationStatus).default("pending"),
  validationErrors: z.array(z.string()).default([]),
  validationWarnings: z.array(z.string()).default([]),
  processingStatus: z.nativeEnum(NotebookProcessingStatus).default("idle"),
  cellCount: z.number().int().nonnegative().default(0),
  outputCount: z.number().int().nonnegative().default(0),
  detectedMimeTypes: z.array(z.string()).default([]),
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type SourceNotebook = z.infer<typeof SourceNotebookSchema>;
