import { defineConfig } from "drizzle-kit";

const url = process.env["DATABASE_URL"] ?? "postgresql://apothecary:apothecary@localhost:5440/apothecary";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
