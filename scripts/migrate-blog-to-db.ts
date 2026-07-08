import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { db, client } from "../src/lib/db";
import { blogPosts } from "../src/lib/db/schema";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

(async () => {
  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
    : [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const { data, content } = matter(
      fs.readFileSync(path.join(BLOG_DIR, file), "utf8"),
    );
    const published = data.draft !== true;
    const inserted = await db
      .insert(blogPosts)
      .values({
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        bodyMarkdown: content.trim(),
        category: String(data.category ?? "Yazı"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        status: published ? "published" : "draft",
        publishedAt: published && data.date ? new Date(String(data.date)) : null,
        // authorStaffId null bırakılır: md yazıları kurum imzalı; görünen ad
        // blog.ts'te "Öz & Saye Psikoloji" fallback'inden gelir.
      })
      .onConflictDoNothing({ target: blogPosts.slug })
      .returning({ slug: blogPosts.slug });
    console.log(inserted.length ? `taşındı: ${slug}` : `atlandı (mevcut): ${slug}`);
  }
  await client.end();
  console.log("Göç tamam.");
})();
