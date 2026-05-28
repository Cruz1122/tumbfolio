import { defineConfig } from "drizzle-kit";
import { getDbEnv } from "@tumbfolio/config";

const env = getDbEnv();

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL
  },
  strict: true,
  verbose: true
});
