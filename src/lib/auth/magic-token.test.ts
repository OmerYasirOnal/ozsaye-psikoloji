import { afterAll, expect, test } from "vitest";
import { client } from "@/lib/db";
import {
  createMagicToken,
  consumeMagicToken,
  isMagicLinkRateLimited,
} from "./magic-token";

test("token bir kez tüketilir", async () => {
  const raw = await createMagicToken("melek@example.com");
  expect(await consumeMagicToken(raw)).toBe("melek@example.com");
  // ikinci kez geçersiz (tek kullanımlık)
  expect(await consumeMagicToken(raw)).toBeNull();
});

test("geçersiz token null", async () => {
  expect(await consumeMagicToken("olmayan-token")).toBeNull();
});

test("aynı e-posta 15 dk içinde 3 istekten sonra hız-limitli olur", async () => {
  const email = `limit-${Date.now()}@example.com`;
  // Taze e-posta: henüz istek yok → limitsiz
  expect(await isMagicLinkRateLimited(email)).toBe(false);
  // 3 token üret → pencere içinde eşik dolar (>= 3)
  await createMagicToken(email);
  await createMagicToken(email);
  await createMagicToken(email);
  expect(await isMagicLinkRateLimited(email)).toBe(true);
  // Farklı taze e-posta hâlâ limitsiz
  expect(
    await isMagicLinkRateLimited(`baska-${Date.now()}@example.com`),
  ).toBe(false);
});

afterAll(async () => {
  await client.end();
});
