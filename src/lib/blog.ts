import fs from "fs";
import path from "path";

/**
 * Blog (Yazılar) — içerik src/content/yazilar/*.mdx dosyalarından gelir.
 * Her .mdx dosyası `export const metadata` ile künyesini taşır; gövdesi MDX'tir.
 * Slug = dosya adı (uzantısız). Liste/künye için fs ile dizin okunur (yalnızca
 * sunucu/derleme zamanı); gövde, sayfa tarafında dinamik import ile render edilir.
 */

const POSTS_DIR = path.join(process.cwd(), "src", "content", "yazilar");

export interface PostMeta {
  slug: string;
  title: string;
  description: string;
  /** Kart/özet için kısa tanıtım. */
  excerpt: string;
  category: string;
  /** Yayın tarihi "YYYY-MM-DD" (ISO). */
  date: string;
  /** Tahmini okuma süresi (dakika). */
  readingMinutes: number;
  /** Yazar uzmanın slug'ı (site.experts ile eşleşir). */
  authorSlug: string;
}

/** İçerik dizinindeki tüm yazı slug'ları (generateStaticParams için). */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""));
}

/** Tek bir yazının künyesini döndürür (yoksa null). */
export async function getPostMeta(slug: string): Promise<PostMeta | null> {
  try {
    const mod = await import(`@/content/yazilar/${slug}.mdx`);
    const metadata = mod.metadata as Omit<PostMeta, "slug"> | undefined;
    if (!metadata) return null;
    return { slug, ...metadata };
  } catch {
    return null;
  }
}

/** Tüm yazıların künyesi, tarihe göre (yeni → eski) sıralı. */
export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = getPostSlugs();
  const posts = await Promise.all(slugs.map((slug) => getPostMeta(slug)));
  return posts
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** "2026-06-01" → "1 Haziran 2026" (locale'e bağımlı değil, deterministik). */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d || m < 1 || m > 12) return iso;
  return `${d} ${AYLAR[m - 1]} ${y}`;
}
