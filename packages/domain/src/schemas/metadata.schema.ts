import { z } from "zod";

export const JsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null()
]);

export type JsonPrimitive = z.infer<typeof JsonPrimitiveSchema>;

export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export const JsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    JsonPrimitiveSchema,
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema)
  ])
);

/** Convenience: schema for a controlled JSON object (record of JsonValue). */
export const JsonObjectSchema = z.record(z.string(), JsonValueSchema);
