/**
 * Yayınlanan blog yazılarını DB'den okur (postgres.js ile doğrudan; proje TS'i
 * import edilmez). Kanonik kaynak artık `blog_posts` tablosudur; yalnız
 * status='published' herkese açıktır. `content/blog/*.md` artık kullanılmaz.
 */
"use strict";
const postgres = require("postgres");

/**
 * @param {{databaseUrl:string, slug?:string|null}} opts
 * @returns {Promise<Array<{slug,title,excerpt,category,tags,publishedAt}>>}
 */
async function readPublishedPosts({ databaseUrl, slug = null }) {
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL tanımlı değil. tools/icerik-uretici/.env.local veya proje kökü .env.local dosyasına ekleyin.",
    );
  }
  const sql = postgres(databaseUrl, { max: 1, idle_timeout: 5, connect_timeout: 10 });
  try {
    const rows = slug
      ? await sql`
          SELECT slug, title, excerpt, category, tags, published_at
          FROM blog_posts
          WHERE status = 'published' AND slug = ${slug}
          ORDER BY published_at DESC NULLS LAST`
      : await sql`
          SELECT slug, title, excerpt, category, tags, published_at
          FROM blog_posts
          WHERE status = 'published'
          ORDER BY published_at DESC NULLS LAST`;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt ?? "",
      category: r.category ?? "Yazı",
      tags: Array.isArray(r.tags) ? r.tags : [],
      publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
    }));
  } finally {
    await sql.end({ timeout: 5 });
  }
}

module.exports = { readPublishedPosts };
