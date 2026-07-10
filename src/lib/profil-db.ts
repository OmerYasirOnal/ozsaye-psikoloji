import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { expertProfiles } from "@/lib/db/schema";
import type { ProfilIcerik } from "@/lib/ekip";

/**
 * Ekip profili içeriğinin DB katmanı.
 *
 * Saf `ekip.ts` (birleştirme/çeviriciler) ile `db` (drizzle) arasındaki ince
 * köprü. Bilinçli olarak `server-only` İÇERMEZ: düz Vitest birim testleri bu
 * dosyayı doğrudan import eder (repo kuralı: `server-only` düz Vitest'te
 * fırlatır).
 */

// `ProfilIcerik`'in 9 içerik kolonu — SELECT şekli tipe birebir eşlenir.
// Kimlik (id) ve `updatedAt` bilinçli olarak dışarıda: dönen nesneye sızmaz.
const icerikKolonlari = {
  bio: expertProfiles.bio,
  credentialsLine: expertProfiles.credentialsLine,
  university: expertProfiles.university,
  membership: expertProfiles.membership,
  degrees: expertProfiles.degrees,
  certifications: expertProfiles.certifications,
  areas: expertProfiles.areas,
  sameAs: expertProfiles.sameAs,
  imageUrl: expertProfiles.imageUrl,
} as const;

/**
 * Tek uzmanın içerik satırını döndürür; satır yoksa `null` (henüz içerik
 * girilmemiş = kamuda gizli, eski isReady davranışının DB karşılığı).
 */
export async function getProfilIcerik(
  slug: string,
): Promise<ProfilIcerik | null> {
  const rows = await db
    .select(icerikKolonlari)
    .from(expertProfiles)
    .where(eq(expertProfiles.expertSlug, slug))
    .limit(1);
  return rows[0] ?? null;
}

/**
 * İçeriği `expertSlug` üzerinden ekler veya günceller (upsert). Satır varsa
 * `onConflictDoUpdate` ile tüm içerik alanlarını + `updatedAt`'i yeniler;
 * yoksa yeni satır ekler. Panel formunun tek yazma yolu.
 */
export async function upsertProfilIcerik(
  slug: string,
  icerik: ProfilIcerik,
): Promise<void> {
  await db
    .insert(expertProfiles)
    .values({ expertSlug: slug, ...icerik })
    .onConflictDoUpdate({
      target: expertProfiles.expertSlug,
      set: { ...icerik, updatedAt: new Date() },
    });
}

/**
 * Tüm profil içeriklerini tek SELECT ile çekip `slug → ProfilIcerik` map'i
 * döndürür. Kamu liste/JsonLd tarafı için N+1 sorgu yerine tek tur.
 */
export async function getTumProfiller(): Promise<Map<string, ProfilIcerik>> {
  const rows = await db
    .select({ expertSlug: expertProfiles.expertSlug, ...icerikKolonlari })
    .from(expertProfiles);

  const map = new Map<string, ProfilIcerik>();
  for (const { expertSlug, ...icerik } of rows) {
    map.set(expertSlug, icerik);
  }
  return map;
}
