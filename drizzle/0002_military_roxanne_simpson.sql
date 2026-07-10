CREATE TABLE "expert_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"expert_slug" text NOT NULL,
	"bio" text,
	"credentials_line" text,
	"university" text,
	"membership" text,
	"degrees" text[],
	"certifications" text[],
	"areas" text[],
	"same_as" text[],
	"image_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "expert_profiles_expert_slug_unique" UNIQUE("expert_slug")
);
