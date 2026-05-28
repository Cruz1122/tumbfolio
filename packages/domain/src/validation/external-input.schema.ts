import { z } from "zod";
import { nonEmptyStringSchema } from "../schemas/primitives.schema.js";

/**
 * Schema for metadata extracted from an uploaded .ipynb file.
 * This is the outermost trust boundary — data comes from user upload.
 * Strict validation: no unknown keys allowed.
 */
export const UploadedNotebookMetadataSchema = z.object({
  originalFilename: nonEmptyStringSchema,
  fileSizeBytes: z.number().int().nonnegative(),
  sha256: z.string().optional(),
  nbformat: z.number().int().nonnegative(),
  nbformatMinor: z.number().int().nonnegative()
}).strict();

export type UploadedNotebookMetadata = z.infer<typeof UploadedNotebookMetadataSchema>;
