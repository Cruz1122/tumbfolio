import { z } from "zod";
import { PresentationDocumentSchema } from "../presentation-model/document.schema.js";

/**
 * Schema for a PresentationDocument reconstructed from an imported NBXP file.
 * NBXP is an external untrusted format, so validation is strict by default.
 * Unknown keys in the top-level document are rejected.
 * Extensions (future-proofing) are allowed via a controlled passthrough
 * in the metadata field, but not at the document root level.
 */
export const NbxpImportedPresentationDocumentSchema = PresentationDocumentSchema.strict();

export type NbxpImportedPresentationDocument = z.infer<typeof NbxpImportedPresentationDocumentSchema>;

/**
 * Minimal NBXP manifest validation schema for the ZIP metadata layer.
 */
export const NbxpManifestSchema = z.object({
  packageVersion: z.string(),
  parts: z.array(z.object({
    href: z.string().min(1),
    mediaType: z.string().min(1),
    required: z.boolean(),
    sha256: z.string().optional()
  }))
}).strict();

export type NbxpManifest = z.infer<typeof NbxpManifestSchema>;
