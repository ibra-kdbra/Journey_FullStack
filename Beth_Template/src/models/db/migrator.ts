import { migrate } from "drizzle-orm/libsql/migrator";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

import path from "path";

import fs from "fs";


// Print the absolute path of the migrations folder
const migrationsFolderPath = path.resolve("src/models/db/migrations");


export const client = createClient({
  url: process.env.TURSO_DB_URL as string,
  authToken: process.env.TURSO_DB_AUTH_TOKEN as string,
});

export const db = drizzle(client);


async function main() {
  try {
    await migrate(db, {
      migrationsFolder: migrationsFolderPath,
    });
    console.log("Tables migrated!");
    process.exit(0);
  } catch (error) {
    console.error("Error performing migration: ", error);
    process.exit(1);
  }
}

main();
