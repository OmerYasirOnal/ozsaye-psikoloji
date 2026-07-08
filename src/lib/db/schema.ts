import {
  pgTable, uuid, text, timestamp, boolean, pgEnum,
} from "drizzle-orm/pg-core";

export const staffRole = pgEnum("staff_role", ["therapist", "admin"]);
export const requestStatus = pgEnum("request_status", [
  "new", "contacted", "scheduled", "done", "cancelled",
]);
export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  expertSlug: text("expert_slug"), // "melek-yildiz" | "sacide-sahin" | null
  role: staffRole("role").notNull().default("therapist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointmentRequests = pgTable("appointment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientEmail: text("patient_email").notNull(),
  expertSlug: text("expert_slug"), // null = "farketmez"
  preferredNote: text("preferred_note"),
  kvkkConsent: boolean("kvkk_consent").notNull().default(false),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentIp: text("consent_ip"),
  status: requestStatus("status").notNull().default("new"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  internalNote: text("internal_note"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  bodyMarkdown: text("body_markdown").notNull(),
  coverImageUrl: text("cover_image_url"),
  authorStaffId: uuid("author_staff_id").references(() => staff.id),
  status: postStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const magicTokens = pgTable("magic_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
