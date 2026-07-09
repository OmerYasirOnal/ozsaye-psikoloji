import { beforeEach, expect, test, vi } from "vitest";

/**
 * randevuTalebiGonder AKIŞ testleri — DB/e-posta/Next katmanları mock'lanır
 * (gerçek `send.ts` `server-only` import eder ve düz Vitest'te fırlatır; mock
 * sayesinde hiç yüklenmez). zod şeması (`@/lib/randevu`) GERÇEK bırakılır ki
 * doğrulama entegrasyonu da sınansın. Sınanan davranışlar:
 *   - sıra: önce DB yazımı, sonra bildirimler, en son redirect (DB-first ilkesi)
 *   - başarısızlık yalıtımı: mail düşse de akış bozulmaz, diğer mail YİNE gider
 *   - honeypot: hiçbir yan etki olmadan redirect (bota mail/DB yok)
 *   - hız limiti: dostça hata döner, hiçbir yan etki üretmez
 */

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers({ "x-forwarded-for": "1.2.3.4" })),
}));

// redirect gerçek Next davranışını taklit eder: fırlatır (NEXT_REDIRECT gibi),
// böylece "redirect'ten sonra kod çalışmaz" varsayımı testte de geçerli olur.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/randevu-db", () => ({
  createAppointmentRequest: vi.fn(),
  isRandevuRateLimited: vi.fn(),
  getBildirimAlicilari: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendAppointmentNotification: vi.fn(),
  sendHastaOnayi: vi.fn(),
}));

import { redirect } from "next/navigation";
import {
  createAppointmentRequest,
  getBildirimAlicilari,
  isRandevuRateLimited,
} from "@/lib/randevu-db";
import { sendAppointmentNotification, sendHastaOnayi } from "@/lib/email/send";
import { randevuTalebiGonder } from "./actions";

const db = vi.mocked(createAppointmentRequest);
const limitli = vi.mocked(isRandevuRateLimited);
const alicilar = vi.mocked(getBildirimAlicilari);
const uzmanMail = vi.mocked(sendAppointmentNotification);
const hastaMail = vi.mocked(sendHastaOnayi);
const yonlendir = vi.mocked(redirect);

function gecerliFd(ekstra: Record<string, string> = {}): FormData {
  const fd = new FormData();
  fd.set("website", ""); // honeypot boş = insan
  fd.set("ad", "Ayşe Yılmaz");
  fd.set("telefon", "0555 123 45 67");
  fd.set("email", "ayse@example.com");
  fd.set("uzman", "farketmez");
  fd.set("tarih", "");
  fd.set("mesaj", "Merhaba, randevu almak istiyorum.");
  fd.set("kvkk", "on");
  for (const [k, v] of Object.entries(ekstra)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  vi.clearAllMocks();
  limitli.mockResolvedValue(false);
  alicilar.mockResolvedValue(["m@x.com", "s@x.com"]);
  db.mockResolvedValue(undefined as never);
  uzmanMail.mockResolvedValue(undefined);
  hastaMail.mockResolvedValue(undefined);
});

test("mutlu yol: DB → (uzman + hasta maili) → teşekkürler redirect'i; sıra korunur", async () => {
  await expect(randevuTalebiGonder({}, gecerliFd())).rejects.toThrow(
    "REDIRECT:/randevu/tesekkurler/",
  );

  expect(db).toHaveBeenCalledTimes(1);
  expect(uzmanMail).toHaveBeenCalledTimes(1);
  expect(hastaMail).toHaveBeenCalledTimes(1);
  expect(hastaMail).toHaveBeenCalledWith("ayse@example.com", "Ayşe Yılmaz");

  // DB-first ilkesi: DB yazımı her iki mail çağrısından ÖNCE.
  const dbSira = db.mock.invocationCallOrder[0];
  expect(dbSira).toBeLessThan(uzmanMail.mock.invocationCallOrder[0]);
  expect(dbSira).toBeLessThan(hastaMail.mock.invocationCallOrder[0]);
});

test("hasta onay maili düşerse: akış bozulmaz, uzman bildirimi YİNE tek sefer, redirect çalışır", async () => {
  hastaMail.mockRejectedValue(new Error("Resend 500"));
  const hata = vi.spyOn(console, "error").mockImplementation(() => {});

  await expect(randevuTalebiGonder({}, gecerliFd())).rejects.toThrow(
    "REDIRECT:/randevu/tesekkurler/",
  );

  expect(db).toHaveBeenCalledTimes(1);
  expect(uzmanMail).toHaveBeenCalledTimes(1); // yinelenme YOK
  expect(hata).toHaveBeenCalledWith(
    "[randevu] hasta onay e-postası gönderilemedi:",
    expect.any(Error),
  );
  hata.mockRestore();
});

test("uzman bildirimi düşerse: hasta onayı YİNE gönderilir, redirect çalışır", async () => {
  uzmanMail.mockRejectedValue(new Error("Resend 500"));
  const hata = vi.spyOn(console, "error").mockImplementation(() => {});

  await expect(randevuTalebiGonder({}, gecerliFd())).rejects.toThrow(
    "REDIRECT:/randevu/tesekkurler/",
  );

  expect(hastaMail).toHaveBeenCalledTimes(1);
  expect(hata).toHaveBeenCalledWith(
    "[randevu] bildirim gönderilemedi:",
    expect.any(Error),
  );
  hata.mockRestore();
});

test("honeypot dolu (bot): hiçbir yan etki YOK — DB/hız-limiti/mail çağrılmaz, sessiz redirect", async () => {
  await expect(
    randevuTalebiGonder({}, gecerliFd({ website: "http://spam.example" })),
  ).rejects.toThrow("REDIRECT:/randevu/tesekkurler/");

  expect(limitli).not.toHaveBeenCalled();
  expect(db).not.toHaveBeenCalled();
  expect(uzmanMail).not.toHaveBeenCalled();
  expect(hastaMail).not.toHaveBeenCalled();
});

test("hız limiti: dostça Türkçe hata döner; DB/mail/redirect YOK", async () => {
  limitli.mockResolvedValue(true);

  const sonuc = await randevuTalebiGonder({}, gecerliFd());

  expect(sonuc.hata).toContain("Çok sayıda deneme");
  expect(db).not.toHaveBeenCalled();
  expect(uzmanMail).not.toHaveBeenCalled();
  expect(hastaMail).not.toHaveBeenCalled();
  expect(yonlendir).not.toHaveBeenCalled();
});

test("geçersiz form (zod GERÇEK): alanın Türkçe mesajı döner, yan etki YOK", async () => {
  const sonuc = await randevuTalebiGonder({}, gecerliFd({ email: "gecersiz" }));

  expect(sonuc.hata).toBe("Lütfen geçerli bir e-posta adresi girin.");
  expect(db).not.toHaveBeenCalled();
  expect(uzmanMail).not.toHaveBeenCalled();
  expect(hastaMail).not.toHaveBeenCalled();
});
