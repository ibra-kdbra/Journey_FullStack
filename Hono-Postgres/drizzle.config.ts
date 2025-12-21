/** @notice library imports */
import { defineConfig } from "drizzle-kit";
/// Local imports
import {
  Environments,
  DATABASE_MIGRATIONS_PATH,
} from "./src/config/environments";

export default defineConfig({
  dialect: "postgresql",
  out: DATABASE_MIGRATIONS_PATH,
  schema: "./src/schemas/index.ts",
  dbCredentials: {
    url: Environments.DATABASE_URL,
  },
});
