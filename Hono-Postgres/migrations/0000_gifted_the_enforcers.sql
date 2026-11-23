CREATE TABLE "todos" (
	"id" serial NOT NULL,
	"description" text,
	"isCompleted" boolean DEFAULT false
);
