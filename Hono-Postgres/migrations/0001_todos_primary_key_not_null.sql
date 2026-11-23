-- Backfill legacy rows so the NOT NULL constraints below can be applied.
UPDATE "todos" SET "description" = '' WHERE "description" IS NULL;--> statement-breakpoint
UPDATE "todos" SET "isCompleted" = false WHERE "isCompleted" IS NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ALTER COLUMN "isCompleted" SET NOT NULL;
