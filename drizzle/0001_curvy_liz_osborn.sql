ALTER TABLE "blog_posts" ADD COLUMN "category" text DEFAULT 'Yazı' NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "tags" text[] DEFAULT '{}'::text[] NOT NULL;