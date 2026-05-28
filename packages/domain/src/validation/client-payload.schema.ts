import { z } from "zod";
import { SlideLayout, PresentationMode } from "../enums/index.js";
import { BlockVisibilitySchema } from "../schemas/visibility.schema.js";

/**
 * Client payload: update a slide's title, subtitle, layout.
 */
export const ClientUpdateSlideSchema = z.object({
  slideId: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  layout: z.nativeEnum(SlideLayout).optional()
}).strict();

/**
 * Client payload: update block visibility for a slide or block.
 */
export const ClientUpdateBlockVisibilitySchema = z.object({
  slideId: z.string().min(1),
  blockId: z.string().optional(),
  visibility: BlockVisibilitySchema.partial()
}).strict();

/**
 * Client payload: reorder slides within a presentation.
 */
export const ClientReorderSlidesSchema = z.object({
  slideIds: z.array(z.string().min(1))
}).strict();

/**
 * Client payload: change the theme of a presentation.
 */
export const ClientChangeThemeSchema = z.object({
  themeId: z.string().min(1)
}).strict();

/**
 * Client payload: change the presentation mode.
 */
export const ClientChangeModeSchema = z.object({
  mode: z.nativeEnum(PresentationMode)
}).strict();
