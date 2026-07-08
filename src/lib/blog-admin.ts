import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";

// Panel sorgu katmanı: kamuya açık blog.ts'in aksine TASLAKLAR DAHİL tüm yazılar.
// Paylaşımlı yetki (spec kararı): staff filtresi YOK — her uzman her yazıyı görür/düzenler.

/** Liste sayfası için hafif kolon seti; en son güncellenen üstte. */
export async function listPostsAdmin() {
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      status: blogPosts.status,
      category: blogPosts.category,
      updatedAt: blogPosts.updatedAt,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt));
}

/** Düzenleme için tam satır; bulunamazsa null. */
export async function getPostByIdAdmin(
  id: string,
): Promise<typeof blogPosts.$inferSelect | null> {
  const rows = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  return rows[0] ?? null;
}
