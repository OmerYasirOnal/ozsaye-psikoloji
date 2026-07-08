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
  icerik: z.string().trim().min(1, "İçerik boş olamaz — yazı gövdesi gerekli."),
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

  // 4) Ekle (taslak; yazar oturumdan; etiketler virgülden diziye).
  const tags = etiketler
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  // ensureUniqueSlug SELECT'i ile INSERT arasında TOCTOU yarışı var: iki eşzamanlı
  // gönderim aynı boş adayı görüp INSERT'te DB'nin unique slug kısıtında çarpışır;
  // kaybeden postgres 23505 alır (yakalanmazsa jenerik hata sayfası). Sınırlı
  // yeniden deneme: her turda adayı YENİDEN hesapla (kazananın satırı artık o slug'ı
  // tuttuğu için ensureUniqueSlug bir sonraki soneki seçer) ve tekrar dene.
  let id: string | undefined;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const slug = await ensureUniqueSlug(slugBase);
    try {
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
      id = inserted[0].id;
      break;
    } catch (e) {
      // 23505 = unique_violation (postgres.js PostgresError.code). Slug yarışı —
      // bir sonraki turda yeni aday ile dene. Diğer her hata yukarı fırlatılır.
      if ((e as { code?: string })?.code === "23505") continue;
      throw e;
    }
  }

  if (!id) {
    return {
      hata: "Kayıt sırasında bir çakışma oldu — lütfen tekrar deneyin.",
    };
  }

  // 5) Düzenleme sayfasına yönlendir. redirect() NEXT_REDIRECT fırlatır —
  //    try/catch İÇİNE ALMA (yutulursa yönlendirme çalışmaz).
  redirect(`/panel/blog/${id}/duzenle?kaydedildi=1`);
}
