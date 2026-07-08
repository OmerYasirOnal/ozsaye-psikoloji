import { desc, eq } from "drizzle-orm";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { blogPosts, staff } from "@/lib/db/schema";

export type PostMeta = {
  slug: string;
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  excerpt: string;
  category: string;
  author: string;
  tags: string[];
  readTime: string; // ör. "5 dk"
};

export type Post = PostMeta & { html: string };

// Türkçe ay adlarıyla okunur tarih (ör. "15 Mayıs 2026")
const MONTHS_TR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
export function formatDateTR(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}

function readTimeFromText(text: string): string {
  const words = text.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} dk`;
}

const DEFAULT_AUTHOR = "Öz & Saye Psikoloji";

type Row = typeof blogPosts.$inferSelect & { authorName: string | null };

function rowToMeta(r: Row): PostMeta {
  return {
    slug: r.slug,
    title: r.title,
    date: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : "",
    excerpt: r.excerpt ?? "",
    category: r.category,
    author: r.authorName ?? DEFAULT_AUTHOR,
    tags: r.tags ?? [],
    readTime: readTimeFromText(r.bodyMarkdown),
  };
}

const baseSelect = () =>
  db
    .select({ post: blogPosts, authorName: staff.name })
    .from(blogPosts)
    .leftJoin(staff, eq(blogPosts.authorStaffId, staff.id));

export async function getAllPosts(): Promise<PostMeta[]> {
  const rows = await baseSelect()
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(({ post, authorName }) => rowToMeta({ ...post, authorName }));
}

/** marked çıktısını süz: staff girdisi güvenilir olsa da panelde stored-XSS'e
 *  karşı savunma katmanı (allowlist; img http(s)/kök-göreli src). Saf fonksiyon,
 *  DB'ye dokunmaz — birim testi bunu içe aktarabilir. */
export function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["https", "http"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await baseSelect().where(eq(blogPosts.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || row.post.status !== "published") return null;
  return {
    ...rowToMeta({ ...row.post, authorName: row.authorName }),
    html: renderMarkdown(row.post.bodyMarkdown),
  };
}
