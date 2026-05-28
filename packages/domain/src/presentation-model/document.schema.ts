import { z } from "zod";
import { PRESENTATION_MODEL_VERSION } from "../version.js";
import { PresentationSchema } from "./presentation.schema.js";
import { SlideSchema } from "./slide.schema.js";
import { SlideBlockSchema } from "./slide-block.schema.js";
import { AssetSchema } from "../assets/asset.schema.js";
import { ThemeSchema } from "../themes/theme.schema.js";

/**
 * PresentationDocument is the root aggregate for a complete deck.
 * Used for NBXP serialization, API responses, and fixtures.
 * Separates the relational entities (presentation, slides, blocks)
 * into flat collections rather than nested structures.
 */
export const PresentationDocumentSchema = z.object({
  presentationModelVersion: z.literal(PRESENTATION_MODEL_VERSION).default(PRESENTATION_MODEL_VERSION),
  presentation: PresentationSchema,
  slides: z.array(SlideSchema).default([]),
  blocks: z.array(SlideBlockSchema).default([]),
  assets: z.array(AssetSchema).default([]),
  theme: ThemeSchema.optional()
});

export type PresentationDocument = z.infer<typeof PresentationDocumentSchema>;
