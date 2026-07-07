import { afterAll, expect, test } from "vitest";
import { client } from "@/lib/db";
import { createMagicToken, consumeMagicToken } from "./magic-token";

test("token bir kez tüketilir", async () => {
  const raw = await createMagicToken("melek@example.com");
  expect(await consumeMagicToken(raw)).toBe("melek@example.com");
  // ikinci kez geçersiz (tek kullanımlık)
  expect(await consumeMagicToken(raw)).toBeNull();
});

test("geçersiz token null", async () => {
  expect(await consumeMagicToken("olmayan-token")).toBeNull();
});

afterAll(async () => {
  await client.end();
});
