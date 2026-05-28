import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.enum(["web", "api", "worker"]),
  timestamp: z.string().datetime(),
  version: z.string().default("0.0.0")
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
