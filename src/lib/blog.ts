import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// Blog/haber yazıları `content/yazilar/` altında markdown dosyaları olarak
// tutulur. Bu dosyalar otomatik içerik sistemi (automation/) tarafından da
// yazılabilir; her dosya tek bir yazıya karşılık gelir. Build sırasında
// (statik export) Server Component'ler bu dosyaları okuyup HTML üretir.

const POSTS_DIR = path.join(process.cwd(), "content", "yazilar");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  formattedDate: string; // "15 Mayıs 2026"
  category: string;
  author?: string;
  tags: string[];
  cover?: string;
  readingTime: string; // "5 dk"
};

export type Post = PostMeta & {
  html: string;
};

const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function formatTrDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function estimateReadingTime(markdown: string): string {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200)); // ~200 kelime/dk
  return `${minutes} dk`;
}

function getPostFiles(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
}

function readPostMeta(file: string): PostMeta {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: String(data.title ?? slug),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    formattedDate: formatTrDate(String(data.date ?? "")),
    category: String(data.category ?? "Genel"),
    author: data.author ? String(data.author) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: data.cover ? String(data.cover) : undefined,
    readingTime: data.readingTime
      ? String(data.readingTime)
      : estimateReadingTime(content),
  };
}

/** Tüm yazıların metadata'sını (içerik HTML'i hariç) tarihe göre yeniden eskiye döndürür. */
export function getAllPosts(): PostMeta[] {
  return getPostFiles()
    .map(readPostMeta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Tek bir yazıyı slug'ına göre (HTML içeriğiyle birlikte) döndürür. */
export function getPostBySlug(slug: string): Post | null {
  const file = `${slug}.md`;
  const fullPath = path.join(POSTS_DIR, file);
  if (!fs.existsSync(fullPath)) return null;

  const meta = readPostMeta(file);
  const { content } = matter(fs.readFileSync(fullPath, "utf8"));
  const html = marked.parse(content, { async: false }) as string;

  return { ...meta, html };
}

/** Statik export için tüm slug'ları döndürür. */
export function getAllSlugs(): string[] {
  return getPostFiles().map((f) => f.replace(/\.md$/, ""));
}
