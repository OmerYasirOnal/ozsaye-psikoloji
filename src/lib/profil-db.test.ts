import { afterAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { expertProfiles } from "@/lib/db/schema";
import type { ProfilIcerik } from "@/lib/ekip";
import {
  getProfilIcerik,
  upsertProfilIcerik,
  getTumProfiller,
} from "./profil-db";

// Tam dolu bir içerik (diziler dahil). Testler ilgili alanı değiştirir
// (randevu-db.test.ts sentetik-taban deseni). Slug'lar benzersiz +
// finally'de silinir; hiçbir test önceden var olan veri varsaymaz.
function tamIcerik(): ProfilIcerik {
  return {
    bio: "Uzun biyografi metni.",
    credentialsLine: "Kl. Psk.",
    university: "İstanbul Üniversitesi",
    membership: "Türk Psikologlar Derneği",
    degrees: ["Lisans — Psikoloji", "Yüksek Lisans — Klinik Psikoloji"],
    certifications: ["BDT Sertifikası", "EMDR Level 1"],
    areas: ["Kaygı", "Depresyon", "İlişki"],
    sameAs: ["https://example.com/profil", "https://instagram.com/ornek"],
    imageUrl: "https://blob.example.com/uzman.jpg",
  };
}

test("upsert → get round-trip: diziler dahil tüm alanlar aynen döner", async () => {
  const slug = `profil-test-${Date.now()}`;
  const icerik = tamIcerik();
  try {
    await upsertProfilIcerik(slug, icerik);
    const okunan = await getProfilIcerik(slug);
    // Dönen şekil ProfilIcerik'e birebir eşit olmalı (id/updatedAt sızmamalı).
    expect(okunan).toEqual(icerik);
  } finally {
    // Assertion başarısız olsa bile yetim satır bırakma.
    await db.delete(expertProfiles).where(eq(expertProfiles.expertSlug, slug));
  }
});

test("ikinci upsert satırı GÜNCELLER (insert değil): tek satır kalır, içerik yenilenir", async () => {
  const slug = `profil-test-${Date.now()}`;
  try {
    await upsertProfilIcerik(slug, tamIcerik());
    const guncel: ProfilIcerik = {
      ...tamIcerik(),
      bio: "Güncellenmiş biyografi.",
      areas: ["Travma", "Yas"],
      imageUrl: null,
    };
    await upsertProfilIcerik(slug, guncel);

    // onConflictDoUpdate: tek satır kalmalı (yeni insert olsaydı unique ihlali
    // ya da ikinci satır olurdu).
    const rows = await db
      .select()
      .from(expertProfiles)
      .where(eq(expertProfiles.expertSlug, slug));
    expect(rows.length).toBe(1);

    // İçerik ikinci upsert'e göre yenilenmeli.
    const okunan = await getProfilIcerik(slug);
    expect(okunan).toEqual(guncel);
  } finally {
    await db.delete(expertProfiles).where(eq(expertProfiles.expertSlug, slug));
  }
});

test("getProfilIcerik: olmayan slug için null döner", async () => {
  const okunan = await getProfilIcerik(`profil-yok-${Date.now()}`);
  expect(okunan).toBeNull();
});

test("getTumProfiller: eklenen slug map'te bulunur, değeri içerikle eşleşir", async () => {
  const slug = `profil-test-${Date.now()}`;
  const icerik = tamIcerik();
  try {
    await upsertProfilIcerik(slug, icerik);
    const map = await getTumProfiller();
    // Containment: yerelde ekstra satırlar olabilir, CI'da yok — ikisinde de geçer.
    expect(map.has(slug)).toBe(true);
    expect(map.get(slug)).toEqual(icerik);
  } finally {
    await db.delete(expertProfiles).where(eq(expertProfiles.expertSlug, slug));
  }
});

afterAll(async () => {
  // db/index.ts'in açtığı gerçek bağlantıyı kapat, Vitest asılı kalmasın.
  await client.end();
});
