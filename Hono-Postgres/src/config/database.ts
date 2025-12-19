/** @notice library imports */
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
/// Local imports
import * as schema from "@/schemas";
import { Environments } from "./environments";

/// Setup client and db instance
export const postgresClient = postgres(Environments.DATABASE_URL);
export const database = drizzle(postgresClient, { schema });
