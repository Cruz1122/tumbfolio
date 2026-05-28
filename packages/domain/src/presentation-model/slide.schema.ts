import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { SlideLayout, SlideStatus } from "../enums/index.js";

export const SlideSchema = z.object({
  id: uuidSchema,
  presentationId: uuidSchema,
  slideOrder: z.number().int().nonnegative(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  layout: z.nativeEnum(SlideLayout),
  status: z.nativeEnum(SlideStatus).default("normal"),
  sourceCellIds: z.array(uuidSchema).default([]),
  speakerNotes: z.string().optional(),
  metadata: JsonObjectSchema.default({}),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type Slide = z.infer<typeof SlideSchema>;
