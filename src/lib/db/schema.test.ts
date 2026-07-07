import { afterAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import { staff } from "./schema";

test("staff tablosuna yazıp okuyabiliyoruz", async () => {
  const email = `test-${Date.now()}@example.com`;
  await db.insert(staff).values({ email, name: "Test", expertSlug: null });
  const rows = await db.select().from(staff).where(sql`email = ${email}`);
  expect(rows.length).toBe(1);
  expect(rows[0].role).toBe("therapist"); // default
  await db.delete(staff).where(sql`email = ${email}`);
});

afterAll(async () => {
  // db/index.ts'in AÇTIĞI gerçek bağlantıyı kapat (yeni bir bağlantı açıp onu
  // kapatmak işe yaramaz — asıl "client" açık kalırsa Vitest process'i asılı kalır).
  await client.end();
});
