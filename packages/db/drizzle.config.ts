import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load .env file manually since drizzle-kit doesn't auto-load it.
 * Only reads the DATABASE_URL key to keep the config focused.
 */
function loadDatabaseUrl(): string | undefined {
  // Priority: explicit env > .env file
  if (process.env["DATABASE_URL"]) {
    return process.env["DATABASE_URL"];
  }

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const envPath = resolve(__dirname, "../../.env");

  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("DATABASE_URL=")) {
        const value = trimmed.slice("DATABASE_URL=".length);
        // Strip optional quotes
        return value.replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    // .env file not found, will throw below
  }

  return undefined;
}

const databaseUrl = loadDatabaseUrl();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is required to run Drizzle commands. " +
    "Set it as an environment variable or add it to .env"
  );
}

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl
  },
  strict: true,
  verbose: true
});
