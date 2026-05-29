import { z } from "zod";
import {
  NodeEnvSchema,
  PortSchema,
  parseEnv,
  resolveEnv,
} from "./common-env.js";

/* ----------------------------------------------------------------------- */
/*  WebEnv — validated environment for the Next.js frontend                */
/*                                                                         */
/*  NEVER put secrets here. Only NEXT_PUBLIC_* and dev-only ports.         */
/* ----------------------------------------------------------------------- */

export const WebEnvSchema = z.object({
  NODE_ENV: NodeEnvSchema,
  WEB_PORT: PortSchema.default(3000),
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url()
    .default("http://localhost:4000/api"),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;

export function loadWebEnv(
  env: NodeJS.ProcessEnv = process.env,
): WebEnv {
  return parseEnv(WebEnvSchema, resolveEnv(env), "web");
}
