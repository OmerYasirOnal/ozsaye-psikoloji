import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

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

function fileToMeta(file: string): { meta: PostMeta; content: string } | null {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
  const { data, content } = matter(raw);
  if (data.draft === true) return null; // taslaklar yayınlanmaz
  const meta: PostMeta = {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? "Yazı"),
    author: String(data.author ?? "Öz & Saye Psikoloji"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readTime: readTimeFromText(content),
  };
  return { meta, content };
}

export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(fileToMeta)
    .filter((x): x is { meta: PostMeta; content: string } => x !== null)
    .map((x) => x.meta)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post | null {
  const res = fileToMeta(`${slug}.md`);
  if (!res) return null;
  const html = marked.parse(res.content, { async: false }) as string;
  return { ...res.meta, html };
}
