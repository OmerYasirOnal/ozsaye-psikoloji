import { afterEach, beforeEach, expect, test, vi } from "vitest";

// DB katmanını MOCK'la. Gerçek @/lib/randevu-db, @/lib/db üzerinden postgres.js'yi
// (ve dolaylı olarak server-only'yi) çeker; server-only düz Vitest'te KOŞULSUZ
// fırlatır. Mock sayesinde test DB'ye/server-only'ye HİÇ dokunmaz ve purge'ün
// çağrılıp çağrılmadığını / hangi argümanla çağrıldığını doğrudan gözler.
// DEFAULT_PURGE_DAYS'i de mock'ta veriyoruz ki route'un varsayılanı (365) korunsun.
vi.mock("@/lib/randevu-db", () => ({
  purgeOldRequests: vi.fn(),
  DEFAULT_PURGE_DAYS: 365,
}));

import { purgeOldRequests } from "@/lib/randevu-db";
import { GET } from "./route";

const purge = vi.mocked(purgeOldRequests);
const SECRET = "test-cron-secret-abc123";

// 500 dalı console.error'a yazar; test çıktısını kirletmesin diye sustur.
vi.spyOn(console, "error").mockImplementation(() => {});

function istek(headers: Record<string, string> = {}): Request {
  return new Request("http://x/api/cron/purge-requests", { headers });
}

// env'i her testte kaydet/geri yükle — testler birbirini kirletmesin
// (ör. .env.local'de CRON_SECRET/PURGE_OLD_REQUESTS_DAYS varsa da bozulmaz).
let onceSecret: string | undefined;
let onceDays: string | undefined;

beforeEach(() => {
  onceSecret = process.env.CRON_SECRET;
  onceDays = process.env.PURGE_OLD_REQUESTS_DAYS;
  purge.mockReset();
});

afterEach(() => {
  if (onceSecret === undefined) delete process.env.CRON_SECRET;
  else process.env.CRON_SECRET = onceSecret;
  if (onceDays === undefined) delete process.env.PURGE_OLD_REQUESTS_DAYS;
  else process.env.PURGE_OLD_REQUESTS_DAYS = onceDays;
});

test("(a) CRON_SECRET tanımlı, auth başlığı YOK → 401 ve purge çağrılmaz", async () => {
  process.env.CRON_SECRET = SECRET;
  delete process.env.PURGE_OLD_REQUESTS_DAYS;

  const res = await GET(istek());

  expect(res.status).toBe(401);
  expect(purge).not.toHaveBeenCalled();
});

test("(b) yanlış bearer → 401 ve purge çağrılmaz", async () => {
  process.env.CRON_SECRET = SECRET;

  const res = await GET(istek({ authorization: "Bearer yanlis-deger" }));

  expect(res.status).toBe(401);
  await expect(res.json()).resolves.toEqual({ error: "unauthorized" });
  expect(purge).not.toHaveBeenCalled();
});

test("(c) doğru bearer, PURGE_OLD_REQUESTS_DAYS yok → 200, purge(365), body doğru", async () => {
  process.env.CRON_SECRET = SECRET;
  delete process.env.PURGE_OLD_REQUESTS_DAYS;
  purge.mockResolvedValue(7);

  const res = await GET(istek({ authorization: `Bearer ${SECRET}` }));

  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toEqual({ ok: true, deleted: 7, days: 365 });
  expect(purge).toHaveBeenCalledTimes(1);
  expect(purge).toHaveBeenCalledWith(365);
});

test("(d) doğru bearer + PURGE_OLD_REQUESTS_DAYS=30 → purge(30)", async () => {
  process.env.CRON_SECRET = SECRET;
  process.env.PURGE_OLD_REQUESTS_DAYS = "30";
  purge.mockResolvedValue(0);

  const res = await GET(istek({ authorization: `Bearer ${SECRET}` }));

  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toEqual({ ok: true, deleted: 0, days: 30 });
  expect(purge).toHaveBeenCalledTimes(1);
  expect(purge).toHaveBeenCalledWith(30);
});

test("(e) CRON_SECRET hiç tanımlı değil + herhangi bir bearer → 401 (fail closed)", async () => {
  delete process.env.CRON_SECRET;

  const res = await GET(istek({ authorization: "Bearer herhangi-bir-sey" }));

  expect(res.status).toBe(401);
  expect(purge).not.toHaveBeenCalled();
});

test("(f) doğru bearer + geçersiz PURGE_OLD_REQUESTS_DAYS → 400 ve purge çağrılmaz", async () => {
  process.env.CRON_SECRET = SECRET;
  process.env.PURGE_OLD_REQUESTS_DAYS = "abc";

  const res = await GET(istek({ authorization: `Bearer ${SECRET}` }));

  expect(res.status).toBe(400);
  await expect(res.json()).resolves.toMatchObject({ ok: false });
  expect(purge).not.toHaveBeenCalled();
});

test("(g) doğru bearer, purgeOldRequests reddederse → 500 {ok:false}", async () => {
  process.env.CRON_SECRET = SECRET;
  delete process.env.PURGE_OLD_REQUESTS_DAYS;
  purge.mockRejectedValue(new Error("DB erişilemiyor"));

  const res = await GET(istek({ authorization: `Bearer ${SECRET}` }));

  expect(res.status).toBe(500);
  await expect(res.json()).resolves.toEqual({ ok: false });
  expect(purge).toHaveBeenCalledTimes(1);
});

test("(h) aynı uzunlukta yanlış bearer → 401 (sabit-zamanlı karşılaştırma döngüsü)", async () => {
  process.env.CRON_SECRET = SECRET;
  // `Bearer ${SECRET}` ile AYNI uzunlukta ama son karakteri farklı: uzunluk
  // kısa-devresini değil, gerçek bayt karşılaştırmasını sınar.
  const beklenen = `Bearer ${SECRET}`;
  const yanlis = beklenen.slice(0, -1) + "X";
  expect(yanlis).toHaveLength(beklenen.length);

  const res = await GET(istek({ authorization: yanlis }));

  expect(res.status).toBe(401);
  expect(purge).not.toHaveBeenCalled();
});
