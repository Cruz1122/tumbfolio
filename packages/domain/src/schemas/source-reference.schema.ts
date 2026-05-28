import { z } from "zod";
import { idSchema } from "./primitives.schema.js";

export const SourceReferenceSchema = z.object({
  sourceCellId: idSchema.optional(),
  sourceOutputId: idSchema.optional(),
  assetId: idSchema.optional()
});

export type SourceReference = z.infer<typeof SourceReferenceSchema>;

/**
 * Refined version ensuring at least one source reference is provided.
 * Used by blocks that must trace back to an original output or asset.
 */
export const AtLeastOneSourceReferenceSchema = SourceReferenceSchema.refine(
  (ref) => ref.sourceCellId !== undefined || ref.sourceOutputId !== undefined || ref.assetId !== undefined,
  { message: "At least one source reference (sourceCellId, sourceOutputId, or assetId) is required" }
);
