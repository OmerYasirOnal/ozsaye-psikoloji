import { beforeEach, expect, test, vi } from "vitest";
import { appointmentRequests } from "@/lib/db/schema";

/**
 * talebiGuncelle AKIŞ testleri — auth/DB/e-posta/Next katmanları mock'lanır
 * (gerçek modüller `server-only`/DB import eder ve düz Vitest'te fırlatır; mock
 * sayesinde hiç yüklenmez). zod şeması (action içinde) ve `@/lib/talepler` saf
 * yardımcıları (`planlananaCevir`, `istanbulTarihSaat`) GERÇEK bırakılır.
 *
 * Odak: durum "Planlandı" (scheduled) + tarih olduğunda hastaya bilgilendirme
 * e-postasının DOĞRU koşullarda — ve yalnız gerçek bir DEĞİŞİKLİKTE — gitmesi;
 * mail düşse bile DB güncellemesinin ayakta kalıp uzmana sakin uyarı dönmesi.
 */

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/auth/dal", () => ({
  verifySession: vi.fn(async () => ({ email: "melek@x.com" })),
}));

vi.mock("@/lib/auth/staff", () => ({
  getStaffByEmail: vi.fn(),
}));

vi.mock("@/lib/talepler-db", () => ({
  getTalep: vi.fn(),
  updateTalep: vi.fn(),
}));

vi.mock("@/lib/email/send", () => ({
  sendHastaPlanlandi: vi.fn(),
}));

import { getStaffByEmail } from "@/lib/auth/staff";
import { getTalep, updateTalep } from "@/lib/talepler-db";
import { sendHastaPlanlandi } from "@/lib/email/send";
import { istanbulTarihSaat, planlananaCevir } from "@/lib/talepler";
import { talebiGuncelle } from "./actions";

const staff = vi.mocked(getStaffByEmail);
const oku = vi.mocked(getTalep);
const guncelle = vi.mocked(updateTalep);
const planlandiMail = vi.mocked(sendHastaPlanlandi);

type Talep = typeof appointmentRequests.$inferSelect;

// Geçerli v4 UUID (zod `z.uuid()` sürüm/varyant bitlerini de doğrular).
const ID = "3f2504e0-4f89-41d3-9a0c-0305e82c3301";

const STAFF = {
  id: "s1",
  email: "melek@x.com",
  name: "Melek",
  role: "therapist" as const,
  expertSlug: "melek-yildiz",
};

// Tam appointment_requests satırı (getTalep/updateTalep döndürür); testler yalnız
// ilgili alanları (status/scheduledAt/patientName/patientEmail) override eder.
function talepSatiri(over: Partial<Talep> = {}): Talep {
  return {
    id: ID,
    createdAt: new Date("2026-07-01T09:00:00Z"),
    patientName: "Ayşe Yılmaz",
    patientPhone: "0555 123 45 67",
    patientEmail: "ayse@example.com",
    expertSlug: "melek-yildiz",
    preferredNote: "Pazartesi öğleden sonra olabilir",
    kvkkConsent: true,
    consentAt: new Date("2026-07-01T09:00:00Z"),
    consentIp: "1.2.3.4",
    status: "new",
    scheduledAt: null,
    internalNote: null,
    updatedAt: new Date("2026-07-01T09:00:00Z"),
    ...over,
  };
}

// scheduled + tarih içeren varsayılan form (mutlu yol). Alanlar override edilebilir.
function fd(over: Record<string, string> = {}): FormData {
  const f = new FormData();
  f.set("id", ID);
  f.set("durum", "scheduled");
  f.set("planlanan", "2026-07-15T14:30");
  f.set("icNot", "");
  for (const [k, v] of Object.entries(over)) f.set(k, v);
  return f;
}

beforeEach(() => {
  vi.clearAllMocks();
  staff.mockResolvedValue(STAFF);
  planlandiMail.mockResolvedValue(undefined);
  // updateTalep başarılı: null-değil bir satır döndür (action yalnız null-lığını
  // kontrol eder). Kapsam-dışı testte null'a çevrilir.
  guncelle.mockResolvedValue(talepSatiri({ status: "scheduled" }));
});

test("(a) taslak → scheduled + tarih: hastaya planlandı maili 1 kez, doğru argümanlarla", async () => {
  oku.mockResolvedValue(talepSatiri({ status: "new", scheduledAt: null }));

  const sonuc = await talebiGuncelle({}, fd());

  expect(sonuc).toEqual({ ok: true });
  expect(guncelle).toHaveBeenCalledTimes(1);
  expect(planlandiMail).toHaveBeenCalledTimes(1);
  expect(planlandiMail).toHaveBeenCalledWith(
    "ayse@example.com",
    "Ayşe Yılmaz",
    // Action tam olarak bunu üretir: parse edilmiş anın İstanbul yereli metni.
    istanbulTarihSaat(planlananaCevir("2026-07-15T14:30") as Date),
  );
});

test("(b) zaten scheduled + aynı tarih, yalnız iç not değişti: mail YOK", async () => {
  const ayniAn = planlananaCevir("2026-07-15T14:30") as Date;
  oku.mockResolvedValue(
    talepSatiri({ status: "scheduled", scheduledAt: ayniAn }),
  );

  const sonuc = await talebiGuncelle({}, fd({ icNot: "hasta arandı, teyit" }));

  expect(sonuc).toEqual({ ok: true });
  expect(guncelle).toHaveBeenCalledTimes(1);
  expect(planlandiMail).not.toHaveBeenCalled();
});

test("(c) scheduled kalıp TARİH değişti: mail VAR, yeni tarihle", async () => {
  const eskiAn = planlananaCevir("2026-07-15T14:30") as Date;
  oku.mockResolvedValue(
    talepSatiri({ status: "scheduled", scheduledAt: eskiAn }),
  );

  const yeni = "2026-07-20T10:00";
  const sonuc = await talebiGuncelle({}, fd({ planlanan: yeni }));

  expect(sonuc).toEqual({ ok: true });
  expect(planlandiMail).toHaveBeenCalledTimes(1);
  expect(planlandiMail).toHaveBeenCalledWith(
    "ayse@example.com",
    "Ayşe Yılmaz",
    istanbulTarihSaat(planlananaCevir(yeni) as Date),
  );
});

test("(d) scheduled'a geçiş ama tarih boş: mail YOK", async () => {
  oku.mockResolvedValue(talepSatiri({ status: "new", scheduledAt: null }));

  const sonuc = await talebiGuncelle({}, fd({ planlanan: "" }));

  expect(sonuc).toEqual({ ok: true });
  expect(guncelle).toHaveBeenCalledTimes(1);
  expect(planlandiMail).not.toHaveBeenCalled();
});

test("(e) mail reddi: ok:true + uyari döner, DB güncellemesi ayakta (update çağrıldı)", async () => {
  oku.mockResolvedValue(talepSatiri({ status: "new", scheduledAt: null }));
  planlandiMail.mockRejectedValue(new Error("Resend 500"));
  const hata = vi.spyOn(console, "error").mockImplementation(() => {});

  const sonuc = await talebiGuncelle({}, fd());

  expect(guncelle).toHaveBeenCalledTimes(1); // güncelleme mail'den ÖNCE yapıldı
  expect(sonuc.ok).toBe(true);
  expect(sonuc.hata).toBeUndefined();
  expect(sonuc.uyari).toContain("bilgilendirme e-postası gönderilemedi");
  expect(hata).toHaveBeenCalledWith(
    "[panel] hastaya planlandı bildirimi gönderilemedi:",
    expect.any(Error),
  );
  hata.mockRestore();
});

test("(f) kapsam dışı (getTalep null): mevcut hata yolu döner; update ve mail YOK", async () => {
  oku.mockResolvedValue(null);

  const sonuc = await talebiGuncelle({}, fd());

  expect(sonuc.hata).toBe("Bu talep bulunamadı veya erişim yetkiniz yok.");
  expect(guncelle).not.toHaveBeenCalled();
  expect(planlandiMail).not.toHaveBeenCalled();
});

test("(g) updateTalep null (yarış/kapsam): hata yolu döner, mail YOK", async () => {
  // Savunmacı dal: getTalep satır döndürse de updateTalep null dönerse
  // (eşzamanlı kapsam değişimi) hata döner, hastaya mail GİTMEZ.
  oku.mockResolvedValue(talepSatiri({ status: "new", scheduledAt: null }));
  guncelle.mockResolvedValue(null);

  const sonuc = await talebiGuncelle({}, fd());

  expect(sonuc.hata).toBe("Bu talep bulunamadı veya erişim yetkiniz yok.");
  expect(planlandiMail).not.toHaveBeenCalled();
});
