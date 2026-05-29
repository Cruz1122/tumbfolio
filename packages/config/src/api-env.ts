import { z } from "zod";
import {
  BooleanFromStringSchema,
  NodeEnvSchema,
  PortSchema,
  parseEnv,
  resolveEnv,
} from "./common-env.js";

/* ----------------------------------------------------------------------- */
/*  ApiEnv — validated environment for the NestJS API backend              */
/*                                                                         */
/*  DATABASE_URL and REDIS_URL are mandatory — crashes if missing.         */
/*  S3 credentials are optional (local MinIO allows anonymous).            */
/*  OPENAI_API_KEY is optional (not yet wired).                            */
/* ----------------------------------------------------------------------- */

export const ApiEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  API_PORT: PortSchema.default(4000),
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().min(1).default("tumbfolio-local"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: BooleanFromStringSchema,
  OPENAI_API_KEY: z.string().optional(),
});

export type ApiEnv = z.infer<typeof ApiEnvSchema>;

export function loadApiEnv(
  env: NodeJS.ProcessEnv = process.env,
): ApiEnv {
  return parseEnv(ApiEnvSchema, resolveEnv(env), "api");
}
