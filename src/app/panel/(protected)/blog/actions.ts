"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { blogPosts } from "@/lib/db/schema";
import { slugify } from "@/lib/slug";

export type FormState = { hata?: string };

// URL slug biçimi: küçük harf/rakam grupları, tek tirelerle bağlı.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const schema = z.object({
  baslik: z.string().trim().min(3, "Başlık en az 3 karakter olmalı."),
  slug: z.string().trim(),
  kategori: z.string().trim(),
  etiketler: z.string(),
  ozet: z.string().trim().max(300, "Özet en fazla 300 karakter olabilir."),
  icerik: z.string().min(1, "İçerik boş olamaz — yazı gövdesi gerekli."),
});

// Benzersiz slug: taban DB'de zaten varsa "-2", "-3"… ekleyerek boş bir slot bul.
// ilike/desen değil, eq (tam eşleşme) ile döngü — deterministik ve indeks dostu.
async function ensureUniqueSlug(base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  // Pratikte 1-2 tur; çakışma olmadıkça ilk adayı döndürür.
  for (;;) {
    const rows = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, candidate))
      .limit(1);
    if (rows.length === 0) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  // 1) Kimlik doğrulama HER ZAMAN ilk sırada (yetkisiz yazma yok).
  const session = await verifySession();

  // 2) Doğrulama (Türkçe, alan adı belirten mesajlar).
  const parsed = schema.safeParse({
    baslik: formData.get("baslik"),
    slug: formData.get("slug"),
    kategori: formData.get("kategori"),
    etiketler: formData.get("etiketler"),
    ozet: formData.get("ozet"),
    icerik: formData.get("icerik"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { hata: first?.message ?? "Form geçersiz — alanları kontrol edin." };
  }
  const { baslik, kategori, etiketler, ozet, icerik } = parsed.data;

  // 3) Slug: boşsa başlıktan türet; SONRA biçim kontrolü.
  const slugBase = parsed.data.slug ? parsed.data.slug : slugify(baslik);
  if (!SLUG_RE.test(slugBase)) {
    return {
      hata:
        "Slug yalnızca küçük harf, rakam ve tire içerebilir (ör. kaygi-ile-basa-cikma).",
    };
  }

  // 4) Benzersizleştir.
  const slug = await ensureUniqueSlug(slugBase);

  // 5) Ekle (taslak; yazar oturumdan; etiketler virgülden diziye).
  const tags = etiketler
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const inserted = await db
    .insert(blogPosts)
    .values({
      slug,
      title: baslik,
      excerpt: ozet || null,
      bodyMarkdown: icerik,
      authorStaffId: session.staffId,
      status: "draft",
      category: kategori || "Yazı",
      tags,
    })
    .returning({ id: blogPosts.id });

  const id = inserted[0].id;

  // 6) Düzenleme sayfasına yönlendir. redirect() NEXT_REDIRECT fırlatır —
  //    try/catch İÇİNE ALMA (yutulursa yönlendirme çalışmaz).
  redirect(`/panel/blog/${id}/duzenle?kaydedildi=1`);
}
