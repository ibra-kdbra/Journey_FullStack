DROP INDEX "user_publicId_unique";--> statement-breakpoint
DROP INDEX "user_email_unique";--> statement-breakpoint
DROP INDEX "user_googleId_unique";--> statement-breakpoint
DROP INDEX "token_key_unique";--> statement-breakpoint
DROP INDEX "token_userId_unique";--> statement-breakpoint
DROP INDEX "team_publicId_unique";--> statement-breakpoint
DROP INDEX "invite_token_unique";--> statement-breakpoint
DROP INDEX "invites_team_id";--> statement-breakpoint
DROP INDEX "invites_email";--> statement-breakpoint
ALTER TABLE `user` ALTER COLUMN "google_id" TO "google_id" text;--> statement-breakpoint
CREATE UNIQUE INDEX `user_publicId_unique` ON `user` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_googleId_unique` ON `user` (`google_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `token_key_unique` ON `token` (`key`);--> statement-breakpoint
CREATE UNIQUE INDEX `token_userId_unique` ON `token` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_publicId_unique` ON `team` (`public_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invite_token_unique` ON `invite` (`token`);--> statement-breakpoint
CREATE INDEX `invites_team_id` ON `invite` (`team_id`);--> statement-breakpoint
CREATE INDEX `invites_email` ON `invite` (`email`);