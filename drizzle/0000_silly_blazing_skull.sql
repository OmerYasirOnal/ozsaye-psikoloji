CREATE TYPE "public"."post_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'contacted', 'scheduled', 'done', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('therapist', 'admin');--> statement-breakpoint
CREATE TABLE "appointment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"patient_name" text NOT NULL,
	"patient_phone" text NOT NULL,
	"patient_email" text NOT NULL,
	"expert_slug" text,
	"preferred_note" text,
	"kvkk_consent" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp with time zone,
	"consent_ip" text,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"scheduled_at" timestamp with time zone,
	"internal_note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body_markdown" text NOT NULL,
	"cover_image_url" text,
	"author_staff_id" uuid,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "magic_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_tokens_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"expert_slug" text,
	"role" "staff_role" DEFAULT 'therapist' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "staff_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_staff_id_staff_id_fk" FOREIGN KEY ("author_staff_id") REFERENCES "public"."staff"("id") ON DELETE no action ON UPDATE no action;