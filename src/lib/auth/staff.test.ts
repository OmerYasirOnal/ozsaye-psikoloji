import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { getStaffByEmail, isStaffEmail } from "./staff";

const EMAIL = `staff-${Date.now()}@example.com`;

beforeAll(async () => {
  await db.insert(staff).values({ email: EMAIL, name: "Dal Test", expertSlug: "x" });
});

test("kayıtlı e-posta bulunur (büyük/küçük harf duyarsız)", async () => {
  const s = await getStaffByEmail(EMAIL.toUpperCase());
  expect(s?.email).toBe(EMAIL);
  expect(await isStaffEmail(EMAIL)).toBe(true);
});

test("kayıtsız e-posta null / false", async () => {
  expect(await getStaffByEmail("yok@example.com")).toBeNull();
  expect(await isStaffEmail("yok@example.com")).toBe(false);
});

afterAll(async () => {
  await db.delete(staff).where(sql`email = ${EMAIL}`);
  await client.end();
});
