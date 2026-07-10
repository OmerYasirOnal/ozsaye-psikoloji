import { afterAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import { staff, expertProfiles } from "./schema";

test("staff tablosuna yazıp okuyabiliyoruz", async () => {
  const email = `test-${Date.now()}@example.com`;
  await db.insert(staff).values({ email, name: "Test", expertSlug: null });
  try {
    const rows = await db.select().from(staff).where(sql`email = ${email}`);
    expect(rows.length).toBe(1);
    expect(rows[0].role).toBe("therapist"); // default
  } finally {
    // Assertion başarısız olsa bile test satırını sil (yetim satır kalmasın).
    await db.delete(staff).where(sql`email = ${email}`);
  }
});

test("expert_profiles: text[] dizileri round-trip döner", async () => {
  const expertSlug = `test-${Date.now()}`;
  await db.insert(expertProfiles).values({
    expertSlug,
    bio: "Test biyografi",
    degrees: ["A", "B"],
    certifications: ["C"],
    areas: [],
  });
  try {
    const rows = await db
      .select()
      .from(expertProfiles)
      .where(sql`expert_slug = ${expertSlug}`);
    expect(rows.length).toBe(1);
    expect(rows[0].degrees).toEqual(["A", "B"]);
    expect(rows[0].certifications).toEqual(["C"]);
    expect(rows[0].areas).toEqual([]);
    expect(rows[0].sameAs).toBeNull(); // yazılmadı → null (public'te gizli)
  } finally {
    // Assertion başarısız olsa bile test satırını sil (yetim satır kalmasın).
    await db.delete(expertProfiles).where(sql`expert_slug = ${expertSlug}`);
  }
});

test("expert_profiles: expertSlug unique ihlali hata fırlatır", async () => {
  const expertSlug = `test-uniq-${Date.now()}`;
  await db.insert(expertProfiles).values({ expertSlug });
  try {
    await expect(
      db.insert(expertProfiles).values({ expertSlug }),
    ).rejects.toThrow();
  } finally {
    // Assertion başarısız olsa bile test satırını sil (yetim satır kalmasın).
    await db.delete(expertProfiles).where(sql`expert_slug = ${expertSlug}`);
  }
});

afterAll(async () => {
  // db/index.ts'in AÇTIĞI gerçek bağlantıyı kapat (yeni bir bağlantı açıp onu
  // kapatmak işe yaramaz — asıl "client" açık kalırsa Vitest process'i asılı kalır).
  await client.end();
});
