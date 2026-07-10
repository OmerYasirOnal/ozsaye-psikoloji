import { expect, test } from "vitest";
import {
  goreliZaman,
  istanbulGunAnahtari,
  izinliGecis,
  tercihEdilenTarih,
} from "./talepler";

// Sabit "şimdi": 15 Temmuz 2026 14:00 İstanbul (= 11:00 UTC)
const SIMDI = new Date("2026-07-15T11:00:00Z");

test("istanbulGunAnahtari: UTC gece yarısı sınırında İstanbul gününü verir", () => {
  // 14 Tem 22:30 UTC = 15 Tem 01:30 İstanbul
  expect(istanbulGunAnahtari(new Date("2026-07-14T22:30:00Z"))).toBe("2026-07-15");
  expect(istanbulGunAnahtari(new Date("2026-07-14T20:30:00Z"))).toBe("2026-07-14");
});

test("goreliZaman: dakika/saat/dün/gün/kısa-tarih basamakları", () => {
  expect(goreliZaman(new Date("2026-07-15T10:59:30Z"), SIMDI)).toBe("az önce");
  expect(goreliZaman(new Date("2026-07-15T10:20:00Z"), SIMDI)).toBe("40 dakika önce");
  expect(goreliZaman(new Date("2026-07-15T08:00:00Z"), SIMDI)).toBe("3 saat önce");
  // Önceki İstanbul günü → "dün" (saat farkı <24 olsa bile)
  expect(goreliZaman(new Date("2026-07-14T18:00:00Z"), SIMDI)).toBe("dün");
  expect(goreliZaman(new Date("2026-07-12T11:00:00Z"), SIMDI)).toBe("3 gün önce");
  // ≥7 gün → Türkçe kısa tarih
  expect(goreliZaman(new Date("2026-07-01T11:00:00Z"), SIMDI)).toBe("1 Tem");
});

test("tercihEdilenTarih: kendi önekimizden ayrıştırır", () => {
  expect(
    tercihEdilenTarih("Tercih edilen tarih: 2026-07-20\n\nAkşam uygun."),
  ).toBe("20 Tem");
  expect(tercihEdilenTarih("Tercih edilen tarih: belirtilmedi\n\nNot.")).toBeNull();
  expect(tercihEdilenTarih("Serbest metin, önek yok")).toBeNull();
  expect(tercihEdilenTarih(null)).toBeNull();
  // Takvim-geçersiz tarih sessizce elenmeli
  expect(tercihEdilenTarih("Tercih edilen tarih: 2026-02-30\n\n")).toBeNull();
});

test("izinliGecis: yalnız beyaz-listeli geçişler", () => {
  expect(izinliGecis("new", "contacted")).toBe(true);
  expect(izinliGecis("scheduled", "done")).toBe(true);
  expect(izinliGecis("new", "cancelled")).toBe(true);
  expect(izinliGecis("contacted", "cancelled")).toBe(true);
  expect(izinliGecis("scheduled", "cancelled")).toBe(true);
  // Reddedilenler
  expect(izinliGecis("new", "scheduled")).toBe(false); // tarih gerekir → form
  expect(izinliGecis("contacted", "done")).toBe(false);
  expect(izinliGecis("done", "cancelled")).toBe(false);
  expect(izinliGecis("cancelled", "contacted")).toBe(false);
  expect(izinliGecis("new", "new")).toBe(false);
});
