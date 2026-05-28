import { z } from "zod";
const BooleanFromStringSchema = z
    .enum(["true", "false", "1", "0"])
    .transform((value) => value === "true" || value === "1")
    .default(false);
const PortSchema = z.coerce.number().int().min(1).max(65535);
const NodeEnvSchema = z.enum(["development", "test", "production"]).default("development");
export const WebEnvSchema = z.object({
    NODE_ENV: NodeEnvSchema,
    WEB_PORT: PortSchema.default(3000),
    NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:4000/api")
});
export const ApiEnvSchema = z.object({
    NODE_ENV: NodeEnvSchema,
    API_PORT: PortSchema.default(4000),
    WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    S3_REGION: z.string().default("us-east-1"),
    S3_ENDPOINT: z.string().url().optional(),
    S3_BUCKET: z.string().min(1).default("tumbfolio-local"),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: BooleanFromStringSchema,
    OPENAI_API_KEY: z.string().optional()
});
export const WorkerEnvSchema = z.object({
    NODE_ENV: NodeEnvSchema,
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
    DATABASE_URL: z.string().min(1),
    WORKER_QUEUES_ENABLED: BooleanFromStringSchema,
    S3_REGION: z.string().default("us-east-1"),
    S3_ENDPOINT: z.string().url().optional(),
    S3_BUCKET: z.string().min(1).default("tumbfolio-local"),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),
    S3_FORCE_PATH_STYLE: BooleanFromStringSchema
});
export const DbEnvSchema = z.object({
    DATABASE_URL: z.string().min(1)
});
function parseEnv(schema, env, label) {
    const parsed = schema.safeParse(env);
    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join("; ");
        throw new Error(`Invalid ${label} environment: ${details}`);
    }
    return parsed.data;
}
export function getWebEnv(env = process.env) {
    return parseEnv(WebEnvSchema, env, "web");
}
export function getApiEnv(env = process.env) {
    return parseEnv(ApiEnvSchema, env, "api");
}
export function getWorkerEnv(env = process.env) {
    return parseEnv(WorkerEnvSchema, env, "worker");
}
export function getDbEnv(env = process.env) {
    return parseEnv(DbEnvSchema, env, "db");
}
export function parseRedisUrl(redisUrl) {
    const url = new URL(redisUrl);
    const parsed = {
        host: url.hostname,
        port: Number(url.port || 6379)
    };
    if (url.password) {
        parsed.password = decodeURIComponent(url.password);
    }
    return parsed;
}
//# sourceMappingURL=index.js.map