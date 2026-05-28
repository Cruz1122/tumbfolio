import { z } from "zod";
import { uuidSchema, isoDateTimeSchema } from "../schemas/index.js";
import { ThemeTokensSchema } from "./theme-tokens.schema.js";

export const ThemeSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1),
  slug: z.string().min(1),
  tokens: ThemeTokensSchema,
  isBuiltin: z.boolean().default(false),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema
});

export type Theme = z.infer<typeof ThemeSchema>;
