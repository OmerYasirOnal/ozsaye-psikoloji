import { afterAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { appointmentRequests, staff } from "@/lib/db/schema";
import type { RandevuGirdisi } from "@/lib/randevu";
import {
  createAppointmentRequest,
  isRandevuRateLimited,
  getBildirimAlicilari,
  purgeOldRequests,
} from "./randevu-db";

// randevuSchema.parse çıktısı şeklinde tam geçerli bir taban girdi. Testler
// yalnız ilgili alanı değiştirir (magic-token.test.ts sentetik-değer deseni).
function gecerliGirdi(): RandevuGirdisi {
  return {
    ad: "Ayşe Yılmaz",
    telefon: "0555 123 45 67",
    email: "ayse@example.com",
    uzman: "melek-yildiz",
    tarih: "2026-07-15",
    mesaj: "Merhaba, randevu almak istiyorum.",
    kvkk: "on",
  };
}

test("createAppointmentRequest satırı doğru alanlarla yazar (farketmez → null)", async () => {
  const ip = `create-${Date.now()}`;
  const { id } = await createAppointmentRequest(
    { ...gecerliGirdi(), uzman: "farketmez" },
    ip,
  );
  try {
    const rows = await db
      .select()
      .from(appointmentRequests)
      .where(eq(appointmentRequests.id, id));
    expect(rows.length).toBe(1);
    const row = rows[0];
    expect(row.patientName).toBe("Ayşe Yılmaz");
    expect(row.patientPhone).toBe("0555 123 45 67");
    expect(row.patientEmail).toBe("ayse@example.com");
    expect(row.expertSlug).toBeNull(); // "farketmez" → null
    expect(row.kvkkConsent).toBe(true);
    expect(row.consentIp).toBe(ip);
    expect(row.consentAt).not.toBeNull();
    expect(row.status).toBe("new"); // şema default'u
    // preferredNote kompozisyonu (eski PHP gövdesinin aynası)
    expect(row.preferredNote).toBe(
      "Tercih edilen tarih: 2026-07-15\n\nMesaj:\nMerhaba, randevu almak istiyorum.",
    );
  } finally {
    // Assertion başarısız olsa bile yetim satır bırakma.
    await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
  }
});

test("isRandevuRateLimited: aynı IP ile 30 dk içinde 5 kayıttan sonra true", async () => {
  const ip = `limit-${Date.now()}`;
  // Taze IP: henüz kayıt yok → limitsiz
  expect(await isRandevuRateLimited(ip)).toBe(false);
  const ids: string[] = [];
  try {
    for (let i = 0; i < 5; i++) {
      const { id } = await createAppointmentRequest(gecerliGirdi(), ip);
      ids.push(id);
    }
    // 5 kayıt → eşik dolar (>= 5)
    expect(await isRandevuRateLimited(ip)).toBe(true);
    // Farklı taze IP hâlâ limitsiz
    expect(await isRandevuRateLimited(`baska-${Date.now()}`)).toBe(false);
  } finally {
    for (const id of ids) {
      await db
        .delete(appointmentRequests)
        .where(eq(appointmentRequests.id, id));
    }
  }
});

test("getBildirimAlicilari(slug): yalnız o uzmanın adresini döndürür", async () => {
  // Sentetik terapist + benzersiz slug: yerel dev seed'ine (melek/sacide) bağlı
  // DEĞİL. Slug benzersiz olduğundan tam-eşitlik hem yerelde hem boş CI DB'sinde
  // geçerlidir — başka hiçbir satır bu slug ile eşleşemez. (staff.test.ts deseni:
  // sentetik satırı ekle, finally'de sil; hiçbir test önceden var olan veri varsaymaz.)
  const ts = Date.now();
  const email = `terapist-${ts}@example.com`;
  const slug = `test-terapist-${ts}`;
  await db
    .insert(staff)
    .values({ name: "Sentetik Terapist", email, expertSlug: slug, role: "therapist" });
  try {
    expect(await getBildirimAlicilari(slug)).toEqual([email]);
  } finally {
    // Assertion başarısız olsa bile sentetik satırı bırakma.
    await db.delete(staff).where(eq(staff.email, email));
  }
});

test("getBildirimAlicilari(null): terapistleri içerir, admin rolünü hariç tutar", async () => {
  // Sentetik iki terapist + bir admin. null ("farketmez") dalı yalnız
  // role='therapist' staff'ı döndürmeli; klinisyen olmayan admin hasta verisi
  // içeren bu bildirimi ALMAMALI. Containment assertion'ları kullanılır: yerel
  // DB'de ekstra (seed) satırlar olabilir, CI'da hiç yok — ikisinde de geçer.
  // Tam-eşitlik veya seed e-postalarına bağımlılık YOK.
  const ts = Date.now();
  const terapistA = `terapist-a-${ts}@example.com`;
  const terapistB = `terapist-b-${ts}@example.com`;
  const adminEmail = `sentetik-admin-${ts}@example.com`;
  await db.insert(staff).values([
    { name: "Sentetik Terapist A", email: terapistA, role: "therapist" },
    { name: "Sentetik Terapist B", email: terapistB, role: "therapist" },
    { name: "Sentetik Admin", email: adminEmail, role: "admin" },
  ]);
  try {
    const alicilar = await getBildirimAlicilari(null);
    // Her iki sentetik terapist dahil (regresyon koruması)
    expect(alicilar).toContain(terapistA);
    expect(alicilar).toContain(terapistB);
    // Admin dışarıda (role='therapist' filtresinin kanıtı)
    expect(alicilar).not.toContain(adminEmail);
  } finally {
    // Assertion başarısız olsa bile sentetik satırları bırakma.
    await db.delete(staff).where(eq(staff.email, terapistA));
    await db.delete(staff).where(eq(staff.email, terapistB));
    await db.delete(staff).where(eq(staff.email, adminEmail));
  }
});

test("getBildirimAlicilari(slug): eşleşme yoksa tüm terapistlere düşer", async () => {
  const ts = Date.now();
  const terapistA = `fallback-terapist-a-${ts}@example.com`;
  const terapistB = `fallback-terapist-b-${ts}@example.com`;
  const adminEmail = `fallback-admin-${ts}@example.com`;
  await db.insert(staff).values([
    { name: "Fallback Terapist A", email: terapistA, role: "therapist" },
    { name: "Fallback Terapist B", email: terapistB, role: "therapist" },
    { name: "Fallback Admin", email: adminEmail, role: "admin" },
  ]);
  try {
    const alicilar = await getBildirimAlicilari(`olmayan-slug-${ts}`);
    expect(alicilar).toContain(terapistA);
    expect(alicilar).toContain(terapistB);
    expect(alicilar).not.toContain(adminEmail);
  } finally {
    await db.delete(staff).where(eq(staff.email, terapistA));
    await db.delete(staff).where(eq(staff.email, terapistB));
    await db.delete(staff).where(eq(staff.email, adminEmail));
  }
});

test("getBildirimAlicilari(slug): admin slug eşleşmesini alıcı yapmaz", async () => {
  const ts = Date.now();
  const slug = `admin-slug-${ts}`;
  const terapist = `admin-fallback-terapist-${ts}@example.com`;
  const adminEmail = `admin-with-slug-${ts}@example.com`;
  await db.insert(staff).values([
    { name: "Admin Fallback Terapist", email: terapist, role: "therapist" },
    { name: "Slug Sahibi Admin", email: adminEmail, expertSlug: slug, role: "admin" },
  ]);
  try {
    const alicilar = await getBildirimAlicilari(slug);
    expect(alicilar).toContain(terapist);
    expect(alicilar).not.toContain(adminEmail);
  } finally {
    await db.delete(staff).where(eq(staff.email, terapist));
    await db.delete(staff).where(eq(staff.email, adminEmail));
  }
});

test("purgeOldRequests: yalnız eşikten eski randevu taleplerini siler", async () => {
  const ts = Date.now();
  const eskiIp = `purge-old-${ts}`;
  const yeniIp = `purge-new-${ts}`;
  await expect(
    db.transaction(async (tx) => {
      const eski = await tx
        .insert(appointmentRequests)
        .values({
          patientName: "Eski Kayıt",
          patientPhone: "0555 111 22 33",
          patientEmail: `eski-${ts}@example.com`,
          preferredNote: "test",
          kvkkConsent: true,
          consentAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
          consentIp: eskiIp,
          createdAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
        })
        .returning({ id: appointmentRequests.id });
      const yeni = await tx
        .insert(appointmentRequests)
        .values({
          patientName: "Yeni Kayıt",
          patientPhone: "0555 111 22 44",
          patientEmail: `yeni-${ts}@example.com`,
          preferredNote: "test",
          kvkkConsent: true,
          consentAt: new Date(),
          consentIp: yeniIp,
        })
        .returning({ id: appointmentRequests.id });

      expect(await purgeOldRequests(365, tx)).toBeGreaterThanOrEqual(1);

      const eskiRows = await tx
        .select({ id: appointmentRequests.id })
        .from(appointmentRequests)
        .where(eq(appointmentRequests.id, eski[0].id));
      const yeniRows = await tx
        .select({ id: appointmentRequests.id })
        .from(appointmentRequests)
        .where(eq(appointmentRequests.id, yeni[0].id));

      expect(eskiRows).toEqual([]);
      expect(yeniRows).toEqual([{ id: yeni[0].id }]);
      throw new Error("ROLLBACK_PURGE_TEST");
    }),
  ).rejects.toThrow("ROLLBACK_PURGE_TEST");
});

afterAll(async () => {
  // db/index.ts'in açtığı gerçek bağlantıyı kapat, Vitest asılı kalmasın.
  await client.end();
});
