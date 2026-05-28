import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDbEnv } from "@tumbfolio/config";
import * as schema from "./schema.js";

export function createDbClient(databaseUrl = getDbEnv().DATABASE_URL) {
  const client = postgres(databaseUrl, { prepare: false });
  const db = drizzle(client, { schema });

  return { client, db };
}

export type DbClient = ReturnType<typeof createDbClient>["db"];
