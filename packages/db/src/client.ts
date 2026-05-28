import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadDbEnv } from "@tumbfolio/config";
import * as schema from "./schema.js";

export type TumbfolioDb = ReturnType<typeof createDbClient>["db"];

export function createDbClient(databaseUrl = loadDbEnv().DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client.");
  }

  const queryClient = postgres(databaseUrl, { prepare: false });
  const db = drizzle(queryClient, { schema });

  return {
    db,
    queryClient,
    close: () => queryClient.end()
  };
}
