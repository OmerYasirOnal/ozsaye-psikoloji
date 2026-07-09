import { expect, test } from "vitest";
import { KLINIK_KUTU, bildirimAlicilari, hastaOnayiMetni } from "./bildirim";

// --- bildirimAlicilari (saf; server-only/IO YOK, düz Vitest'te koşar) ---

test("bildirimAlicilari: uzman adreslerine info@ ekler, sırayı korur", () => {
  expect(bildirimAlicilari(["a@x.com", "b@x.com"])).toEqual([
    "a@x.com",
    "b@x.com",
    KLINIK_KUTU,
  ]);
  // Emniyet: klinik kutusunun ne olduğunu da sabitle (regresyon koruması).
  expect(KLINIK_KUTU).toBe("info@ozsaye.com");
});

test("bildirimAlicilari: boş uzman listesinde yalnız info@ döner", () => {
  // Kararlı davranış: staff tablosu boş/yanlış olsa bile klinik kutusu haberdar
  // olur → talep bildirimsiz kalmaz.
  expect(bildirimAlicilari([])).toEqual([KLINIK_KUTU]);
});

test("bildirimAlicilari: büyük/küçük harf duyarsız tekilleştirir, ilk yazımı korur", () => {
  // info@ zaten uzman listesinde farklı yazımla varsa iki kez EKLENMEZ; ilk
  // görülen yazım (uzmanınki) korunur.
  expect(bildirimAlicilari(["Info@Ozsaye.com"])).toEqual(["Info@Ozsaye.com"]);
  // Uzmanlar arası tekrar da tekilleşir; sıra + ilk yazım korunur, sonra info@.
  expect(bildirimAlicilari(["A@x.com", "a@X.com"])).toEqual([
    "A@x.com",
    KLINIK_KUTU,
  ]);
});

// --- hastaOnayiMetni (saf) ---

test("hastaOnayiMetni: konu + sakin gövde; yalnız İLK AD selamlanır", () => {
  const { subject, text } = hastaOnayiMetni("Ayşe Yılmaz");
  expect(subject).toBe("Randevu talebiniz alındı — Öz & Saye Psikoloji");
  expect(text).toContain("Merhaba Ayşe,");
  // Soyadı (fazladan hasta verisi) yankılanmaz — yalnız ilk ad.
  expect(text).not.toContain("Yılmaz");
  // Marka imzası + "yanıtlayarak ulaşın" yönlendirmesi var.
  expect(text).toContain("Öz & Saye Psikoloji");
  expect(text).toContain("yanıtlayarak");
});

test("hastaOnayiMetni: placeholder ([DOLDUR]) ya da telefon/adres SIZDIRMAZ", () => {
  const { subject, text } = hastaOnayiMetni("Mehmet");
  expect(subject).not.toContain("[DOLDUR]");
  expect(text).not.toContain("[DOLDUR]");
  // Telefon/adres numarası öbeği bulunmamalı (kaba ama etkili kontrol).
  expect(text).not.toMatch(/\d{3,}/);
});

test("hastaOnayiMetni: ad boş/boşluk ise isim yankılamadan nazik selam", () => {
  const { text } = hastaOnayiMetni("   ");
  expect(text).toContain("Merhaba,");
  // Boş ad "Merhaba ," (fazladan boşluk) üretmemeli.
  expect(text).not.toContain("Merhaba ,");
});
