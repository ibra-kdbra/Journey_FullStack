/** @notice library imports */
import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";

/// Core todos table
export const todos = pgTable("todos", {
  id: serial().primaryKey(),
  description: text().notNull(),
  isCompleted: boolean().notNull().default(false),
});
