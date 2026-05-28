import { z } from "zod";
import { uuidSchema, isoDateTimeSchema, JsonObjectSchema } from "../schemas/index.js";
import { AiActionType, AiSuggestionStatus } from "../enums/index.js";

export const AiSuggestionSchema = z.object({
  id: uuidSchema,
  presentationId: uuidSchema,
  slideId: uuidSchema.optional(),
  targetBlockId: uuidSchema.optional(),
  actionType: z.nativeEnum(AiActionType),
  status: z.nativeEnum(AiSuggestionStatus).default("pending"),
  inputContext: JsonObjectSchema.default({}),
  suggestion: JsonObjectSchema.default({}),
  acceptedPayload: JsonObjectSchema.optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type AiSuggestion = z.infer<typeof AiSuggestionSchema>;
