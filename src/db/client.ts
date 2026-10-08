import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export function databaseConfigured() {
  return Boolean(process.env["DATABASE_URL"]);
}

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cached: Database | null = null;

export function getDb() {
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set.");
  if (!cached) {
    const client = postgres(url, { max: 10 });
    cached = drizzle(client, { schema });
  }
  return cached;
}
