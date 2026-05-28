import { z } from "zod";
import {
  BooleanFromStringSchema,
  NodeEnvSchema,
  parseEnv,
} from "./common-env.js";

/* ----------------------------------------------------------------------- */
/*  WorkerEnv — validated environment for the NestJS/BullMQ worker         */
/*                                                                         */
/*  DATABASE_URL and REDIS_URL are mandatory — crashes if missing.         */
/*  WORKER_QUEUES_ENABLED controls whether real queue processors start.    */
/* ----------------------------------------------------------------------- */

export const WorkerEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url(),
  WORKER_QUEUES_ENABLED: BooleanFromStringSchema,
  S3_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().min(1).default("tumbfolio-local"),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: BooleanFromStringSchema,
});

export type WorkerEnv = z.infer<typeof WorkerEnvSchema>;

export function loadWorkerEnv(
  env: NodeJS.ProcessEnv = process.env,
): WorkerEnv {
  return parseEnv(WorkerEnvSchema, env, "worker");
}
