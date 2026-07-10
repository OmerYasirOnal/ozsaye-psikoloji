import { afterAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { appointmentRequests } from "@/lib/db/schema";
import {
  whatsappNumarasi,
  maskeliTelefon,
  uzmanEtiketi,
  planlananaCevir,
  type RandevuDurum,
} from "./talepler";
import {
  getTalep,
  listTalepler,
  listPlanliTakvim,
  updateTalep,
  talepSayilari,
} from "./talepler-db";

// ── Saf yardımcılar (DB'siz) ────────────────────────────────────────────────

test("whatsappNumarasi: TR numara biçimlerini 90… biçimine normalize eder", () => {
  expect(whatsappNumarasi("0555 123 45 67")).toBe("905551234567"); // 0 + 10 hane
  expect(whatsappNumarasi("5551234567")).toBe("905551234567"); // 10 hane, 5XX
  expect(whatsappNumarasi("905551234567")).toBe("905551234567"); // zaten 90…
  expect(whatsappNumarasi("+90 555 123 45 67")).toBe("905551234567"); // + ve boşluk elenir
  expect(whatsappNumarasi("123")).toBeNull(); // çözümlenemez
  expect(whatsappNumarasi("0212 000 00")).toBeNull(); // 9 hane, kural yok
});

test("maskeliTelefon: baş 4 + son 2 rakam görünür, gerisi maskeli", () => {
  expect(maskeliTelefon("0555 123 45 67")).toBe("0555 ••• •• 67");
  expect(maskeliTelefon("123")).toBe("•••"); // 6 rakamdan kısa
});

test("planlananaCevir: boş → null, biçim bozuk → gecersiz, geçerli → doğru an", () => {
  expect(planlananaCevir("")).toBeNull();
  expect(planlananaCevir("yarın öğlen")).toBe("gecersiz"); // biçim değil
  expect(planlananaCevir("2026-13-01T10:00")).toBe("gecersiz"); // 13. ay yok
  const d = planlananaCevir("2026-03-15T14:30");
  expect(d).toBeInstanceOf(Date);
  // İstanbul 14:30 (UTC+3) → UTC 11:30
  expect((d as Date).toISOString()).toBe("2026-03-15T11:30:00.000Z");
});

test("planlananaCevir: takvim-geçersiz gün (30 Şubat) sessizce taşınmaz — reddedilir", () => {
  // Regresyon: Number.isNaN bunu yakalamaz (JS Date 30 Şubat'ı 2 Mart'a
  // taşır); round-trip kontrolü olmadan bu talep sessizce yanlış bir güne
  // planlanırdı.
  expect(planlananaCevir("2026-02-30T10:00")).toBe("gecersiz");
  expect(planlananaCevir("2026-04-31T10:00")).toBe("gecersiz"); // Nisan 30 gün çeker
});

test("uzmanEtiketi: slug → ad, null → Farketmez, bilinmeyen → slug", () => {
  expect(uzmanEtiketi(null)).toBe("Farketmez");
  expect(uzmanEtiketi("melek-yildiz")).toBe("Psk. Dan. Melek Yıldız");
  expect(uzmanEtiketi("bilinmeyen-slug")).toBe("bilinmeyen-slug");
});

// ── DB katmanı (self-seeding, CI-güvenli: her test kendi sentetik satırını
//    ekler + finally'de siler; benzersiz slug ile seed/başka satırlardan izole) ─

async function ekleTalep(v: {
  slug: string | null;
  durum?: RandevuDurum;
  scheduledAt?: Date;
}): Promise<string> {
  const [row] = await db
    .insert(appointmentRequests)
    .values({
      patientName: "Sentetik Hasta",
      patientPhone: "0555 000 00 00",
      patientEmail: "sentetik@example.com",
      expertSlug: v.slug,
      preferredNote: "test",
      status: v.durum ?? "new",
      scheduledAt: v.scheduledAt ?? null,
    })
    .returning({ id: appointmentRequests.id });
  return row.id;
}

test("getTalep: kapsam (IDOR) — uzman yalnız kendi + farketmez taleplerini görür", async () => {
  const ts = Date.now();
  const slugA = `talep-a-${ts}`;
  const slugB = `talep-b-${ts}`;
  const idA = await ekleTalep({ slug: slugA });
  const idFark = await ekleTalep({ slug: null }); // farketmez havuzu
  const idB = await ekleTalep({ slug: slugB });
  try {
    // A kendi talebini + farketmez havuzunu görür
    expect((await getTalep(idA, slugA, false))?.id).toBe(idA);
    expect((await getTalep(idFark, slugA, false))?.id).toBe(idFark);
    // A, B'nin talebini GÖREMEZ (id tahmini işe yaramaz) — IDOR koruması
    expect(await getTalep(idB, slugA, false)).toBeNull();
    expect(await getTalep(idA, slugB, false)).toBeNull();
    // slug'sız staff yalnız farketmez görür
    expect((await getTalep(idFark, null, false))?.id).toBe(idFark);
    expect(await getTalep(idA, null, false)).toBeNull();
  } finally {
    for (const id of [idA, idFark, idB]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

test("getTalep: isAdmin true — kapsam bypass, uzmana atanmış her talep görülür", async () => {
  const ts = Date.now();
  const slugA = `admin-talep-a-${ts}`;
  const slugB = `admin-talep-b-${ts}`;
  const idA = await ekleTalep({ slug: slugA });
  const idB = await ekleTalep({ slug: slugB });
  const idFark = await ekleTalep({ slug: null });
  try {
    // expertSlug=null + isAdmin=true geçilse bile (info@ gibi genel bir hesap)
    // HER talep görülür — expertSlug parametresi admin'de dikkate alınmaz.
    expect((await getTalep(idA, null, true))?.id).toBe(idA);
    expect((await getTalep(idB, null, true))?.id).toBe(idB);
    expect((await getTalep(idFark, null, true))?.id).toBe(idFark);
  } finally {
    for (const id of [idA, idB, idFark]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

test("listTalepler: kapsam + durum filtresi (containment; seed'e bağımsız)", async () => {
  const ts = Date.now();
  const slugA = `list-a-${ts}`;
  const slugB = `list-b-${ts}`;
  const idA = await ekleTalep({ slug: slugA, durum: "new" });
  const idFark = await ekleTalep({ slug: null, durum: "contacted" });
  const idB = await ekleTalep({ slug: slugB, durum: "new" });
  try {
    const idler = (await listTalepler(slugA, false)).map((t) => t.id);
    expect(idler).toContain(idA); // kendi
    expect(idler).toContain(idFark); // farketmez havuzu
    expect(idler).not.toContain(idB); // başka uzman — IDOR

    const yeniIdler = (await listTalepler(slugA, false, "new")).map(
      (t) => t.id,
    );
    expect(yeniIdler).toContain(idA);
    expect(yeniIdler).not.toContain(idFark); // "contacted" filtre dışında
    expect(yeniIdler).not.toContain(idB);

    const farkIdler = (await listTalepler(null, false)).map((t) => t.id);
    expect(farkIdler).toContain(idFark);
    expect(farkIdler).not.toContain(idA);
    expect(farkIdler).not.toContain(idB);

    // isAdmin true: expertSlug ne olursa olsun (burada null geçiliyor) HEPSİ.
    const adminIdler = (await listTalepler(null, true)).map((t) => t.id);
    expect(adminIdler).toContain(idA);
    expect(adminIdler).toContain(idFark);
    expect(adminIdler).toContain(idB);
  } finally {
    for (const id of [idA, idFark, idB]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

test("updateTalep: yalnız kapsam içindeki satırı günceller (IDOR); updatedAt tazelenir", async () => {
  const ts = Date.now();
  const slugA = `upd-a-${ts}`;
  const slugB = `upd-b-${ts}`;
  await expect(
    db.transaction(async (tx) => {
      const [a] = await tx
        .insert(appointmentRequests)
        .values({
          patientName: "A",
          patientPhone: "0555 000 00 01",
          patientEmail: `a-${ts}@example.com`,
          expertSlug: slugA,
          preferredNote: "t",
          status: "new",
          updatedAt: new Date(Date.now() - 60_000), // 1 dk eski
        })
        .returning({
          id: appointmentRequests.id,
          updatedAt: appointmentRequests.updatedAt,
        });

      // Kapsam içi güncelleme başarılı
      const guncel = await updateTalep(
        a.id,
        slugA,
        false,
        { status: "contacted", internalNote: "arandı, mesaj bırakıldı" },
        tx,
      );
      expect(guncel).not.toBeNull();
      if (guncel) {
        expect(guncel.status).toBe("contacted");
        expect(guncel.internalNote).toBe("arandı, mesaj bırakıldı");
        expect(guncel.updatedAt.getTime()).toBeGreaterThan(a.updatedAt.getTime());
      }

      // Kapsam dışı (B) güncelleme null döner ve satırı DEĞİŞTİRMEZ
      const yetkisiz = await updateTalep(
        a.id,
        slugB,
        false,
        { status: "cancelled" },
        tx,
      );
      expect(yetkisiz).toBeNull();
      const [tekrar] = await tx
        .select({ status: appointmentRequests.status })
        .from(appointmentRequests)
        .where(eq(appointmentRequests.id, a.id));
      expect(tekrar.status).toBe("contacted"); // B'nin denemesi etkisiz

      // isAdmin true: slugB (kapsam dışı) geçilse bile güncelleme BAŞARILI —
      // admin herhangi bir talebi id ile günceller.
      const adminGuncel = await updateTalep(
        a.id,
        slugB,
        true,
        { status: "scheduled" },
        tx,
      );
      expect(adminGuncel).not.toBeNull();
      expect(adminGuncel?.status).toBe("scheduled");

      throw new Error("ROLLBACK_UPDATE_TEST");
    }),
  ).rejects.toThrow("ROLLBACK_UPDATE_TEST");
});

test("talepSayilari: durum başına kapsamlı sayı (delta ile; seed'e bağımsız)", async () => {
  const ts = Date.now();
  const slugA = `say-a-${ts}`;
  const once = await talepSayilari(slugA, false);
  const onceAdmin = await talepSayilari(slugA, true); // admin'de expertSlug göz ardı edilir
  const idNew1 = await ekleTalep({ slug: slugA, durum: "new" });
  const idNew2 = await ekleTalep({ slug: slugA, durum: "new" });
  const idFark = await ekleTalep({ slug: null, durum: "contacted" });
  const idBaska = await ekleTalep({ slug: `say-b-${ts}`, durum: "new" }); // kapsam dışı (yalnız non-admin için)
  try {
    const sonra = await talepSayilari(slugA, false);
    // slugA'nın 2 yeni talebi — başka uzmanın (idBaska) "new" talebi delta'ya girmez
    expect(sonra.new - once.new).toBe(2);
    // farketmez havuzu kapsamda: contacted +1
    expect(sonra.contacted - once.contacted).toBe(1);

    // isAdmin true: idBaska da dahil — 3 yeni "new" (idNew1, idNew2, idBaska).
    const sonraAdmin = await talepSayilari(slugA, true);
    expect(sonraAdmin.new - onceAdmin.new).toBe(3);
    expect(sonraAdmin.contacted - onceAdmin.contacted).toBe(1);
  } finally {
    for (const id of [idNew1, idNew2, idFark, idBaska]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

test("listPlanliTakvim: yalnız scheduled + aralık içi + kapsam", async () => {
  const ts = Date.now();
  const slugA = `tak-a-${ts}`;
  const slugB = `tak-b-${ts}`;
  const icinde = new Date("2026-07-15T11:00:00Z"); // 15 Tem İstanbul
  const disinda = new Date("2026-08-02T11:00:00Z");
  const idPlanli = await ekleTalep({ slug: slugA, durum: "scheduled", scheduledAt: icinde });
  const idFarkPlanli = await ekleTalep({ slug: null, durum: "scheduled", scheduledAt: icinde });
  const idBaskaUzman = await ekleTalep({ slug: slugB, durum: "scheduled", scheduledAt: icinde });
  const idAralikDisi = await ekleTalep({ slug: slugA, durum: "scheduled", scheduledAt: disinda });
  const idPlansiz = await ekleTalep({ slug: slugA, durum: "new" }); // scheduledAt null
  try {
    const bas = new Date("2026-06-30T21:00:00Z"); // 1 Tem 00:00 İstanbul
    const bit = new Date("2026-07-31T21:00:00Z");
    const idler = (await listPlanliTakvim(slugA, false, bas, bit)).map((r) => r.id);
    expect(idler).toContain(idPlanli);
    expect(idler).toContain(idFarkPlanli); // farketmez havuzu kapsamda
    expect(idler).not.toContain(idBaskaUzman); // IDOR
    expect(idler).not.toContain(idAralikDisi);
    expect(idler).not.toContain(idPlansiz);
    // Admin: başka uzmanınki de görünür
    const adminIdler = (await listPlanliTakvim(null, true, bas, bit)).map((r) => r.id);
    expect(adminIdler).toContain(idBaskaUzman);
  } finally {
    for (const id of [idPlanli, idFarkPlanli, idBaskaUzman, idAralikDisi, idPlansiz]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

afterAll(async () => {
  // db/index.ts'in açtığı bağlantıyı kapat, Vitest asılı kalmasın.
  await client.end();
});
