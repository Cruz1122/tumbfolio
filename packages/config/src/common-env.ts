import { z } from "zod";

/* ----------------------------------------------------------------------- */
/*  Shared Zod schemas                                                     */
/* ----------------------------------------------------------------------- */

const BooleanFromStringSchema = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1")
  .default(false);

const PortSchema = z.coerce.number().int().min(1).max(65535);

const NodeEnvSchema = z
  .enum(["development", "test", "production"])
  .default("development");

/* ----------------------------------------------------------------------- */
/*  Generic parse helper (crashes on missing/invalid)                      */
/* ----------------------------------------------------------------------- */

function parseEnv<T>(
  schema: z.ZodType<T>,
  env: NodeJS.ProcessEnv,
  label: string,
): T {
  const parsed = schema.safeParse(env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid ${label} environment: ${details}`);
  }

  return parsed.data;
}

/* ----------------------------------------------------------------------- */
/*  parseRedisUrl — shared utility                                         */
/* ----------------------------------------------------------------------- */

export function parseRedisUrl(
  redisUrl: string,
): { host: string; port: number; password?: string } {
  const url = new URL(redisUrl);
  const parsed: { host: string; port: number; password?: string } = {
    host: url.hostname,
    port: Number(url.port || 6379),
  };

  if (url.password) {
    parsed.password = decodeURIComponent(url.password);
  }

  return parsed;
}

/* ----------------------------------------------------------------------- */
/*  DbEnv — used by packages/db for focused DATABASE_URL validation        */
/* ----------------------------------------------------------------------- */

export const DbEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
});
export type DbEnv = z.infer<typeof DbEnvSchema>;

export function loadDbEnv(
  env: NodeJS.ProcessEnv = process.env,
): DbEnv {
  return parseEnv(DbEnvSchema, env, "db");
}

/* ----------------------------------------------------------------------- */
/*  Re-export shared schemas (internal use by web-env / api-env / worker)  */
/* ----------------------------------------------------------------------- */

export { BooleanFromStringSchema, PortSchema, NodeEnvSchema, parseEnv };
