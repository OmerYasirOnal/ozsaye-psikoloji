import { afterAll, expect, test } from "vitest";
import { eq } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { appointmentRequests } from "@/lib/db/schema";
import {
  whatsappNumarasi,
  maskeliTelefon,
  uzmanEtiketi,
  type RandevuDurum,
} from "./talepler";
import { getTalep, listTalepler, updateTalep, talepSayilari } from "./talepler-db";

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
    expect((await getTalep(idA, slugA))?.id).toBe(idA);
    expect((await getTalep(idFark, slugA))?.id).toBe(idFark);
    // A, B'nin talebini GÖREMEZ (id tahmini işe yaramaz) — IDOR koruması
    expect(await getTalep(idB, slugA)).toBeNull();
    expect(await getTalep(idA, slugB)).toBeNull();
    // slug'sız staff yalnız farketmez görür
    expect((await getTalep(idFark, null))?.id).toBe(idFark);
    expect(await getTalep(idA, null)).toBeNull();
  } finally {
    for (const id of [idA, idFark, idB]) {
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
    const idler = (await listTalepler(slugA)).map((t) => t.id);
    expect(idler).toContain(idA); // kendi
    expect(idler).toContain(idFark); // farketmez havuzu
    expect(idler).not.toContain(idB); // başka uzman — IDOR

    const yeniIdler = (await listTalepler(slugA, "new")).map((t) => t.id);
    expect(yeniIdler).toContain(idA);
    expect(yeniIdler).not.toContain(idFark); // "contacted" filtre dışında
    expect(yeniIdler).not.toContain(idB);

    const farkIdler = (await listTalepler(null)).map((t) => t.id);
    expect(farkIdler).toContain(idFark);
    expect(farkIdler).not.toContain(idA);
    expect(farkIdler).not.toContain(idB);
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
      const yetkisiz = await updateTalep(a.id, slugB, { status: "cancelled" }, tx);
      expect(yetkisiz).toBeNull();
      const [tekrar] = await tx
        .select({ status: appointmentRequests.status })
        .from(appointmentRequests)
        .where(eq(appointmentRequests.id, a.id));
      expect(tekrar.status).toBe("contacted"); // B'nin denemesi etkisiz

      throw new Error("ROLLBACK_UPDATE_TEST");
    }),
  ).rejects.toThrow("ROLLBACK_UPDATE_TEST");
});

test("talepSayilari: durum başına kapsamlı sayı (delta ile; seed'e bağımsız)", async () => {
  const ts = Date.now();
  const slugA = `say-a-${ts}`;
  const once = await talepSayilari(slugA);
  const idNew1 = await ekleTalep({ slug: slugA, durum: "new" });
  const idNew2 = await ekleTalep({ slug: slugA, durum: "new" });
  const idFark = await ekleTalep({ slug: null, durum: "contacted" });
  const idBaska = await ekleTalep({ slug: `say-b-${ts}`, durum: "new" }); // kapsam dışı
  try {
    const sonra = await talepSayilari(slugA);
    // slugA'nın 2 yeni talebi — başka uzmanın (idBaska) "new" talebi delta'ya girmez
    expect(sonra.new - once.new).toBe(2);
    // farketmez havuzu kapsamda: contacted +1
    expect(sonra.contacted - once.contacted).toBe(1);
  } finally {
    for (const id of [idNew1, idNew2, idFark, idBaska]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});

afterAll(async () => {
  // db/index.ts'in açtığı bağlantıyı kapat, Vitest asılı kalmasın.
  await client.end();
});
