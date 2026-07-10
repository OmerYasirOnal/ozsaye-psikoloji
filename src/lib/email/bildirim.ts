/**
 * E-posta bildirimleri için SAF yardımcılar (alıcı listesi + hasta onay metni).
 *
 * Yalnız düz string işler — `server-only`/DB/IO YOK. Böylece düz Vitest birim
 * testleri bu dosyayı doğrudan import edebilir (Faz 0 kuralı: `server-only`
 * düz Vitest'te fırlatır). Asıl gönderim (Resend/fetch) `send.ts`'tedir.
 */

/**
 * Kliniğin ortak posta kutusu (Microsoft 365). Uzman bildirimlerinin bir
 * KOPYASI buraya da düşer.
 *
 * Neden `getBildirimAlicilari` (randevu-db.ts) yerine BURADA (gönderim
 * katmanında)? O fonksiyon bilinçli olarak rol-kapsamlıdır (yalnız
 * `role='therapist'`): admin hesapları hasta PII'si içeren bildirimi TASARIM
 * GEREĞİ almaz. Buradaki info@ ise bir "admin hesabı" değil, veri sorumlusunun
 * (kliniğin) KENDİ paylaşımlı kutusudur — kopyayı bu kutuya yönlendirmek veri
 * sorumlusunun kendi tercihidir, rol-kapsamı ihlali değil. Bu yüzden rol
 * filtresine dokunmadan, gönderim katmanında eklenir.
 */
export const KLINIK_KUTU = "info@ozsaye.com";

/**
 * Uzman adreslerine klinik kutusunu (info@) EKLER ve büyük/küçük harf
 * duyarsız TEKİLLEŞTİRİR; giriş sırasını korur (önce uzmanlar, sonra info@) ve
 * bir adresin ilk görülen yazımını saklar.
 *
 * Boş uzman listesi → yalnız [info@]: staff tablosu yanlış yapılandırılmış olsa
 * bile talep bildirimsiz KALMAZ; kliniğin kendi kutusu her hâlükârda haberdar
 * olur. (Uzman listesinin boş olması ayrıca send.ts'te görünür uyarı basar.)
 */
export function bildirimAlicilari(uzmanlar: string[]): string[] {
  const sonuc: string[] = [];
  const gorulen = new Set<string>();
  for (const adres of [...uzmanlar, KLINIK_KUTU]) {
    const anahtar = adres.toLowerCase();
    if (gorulen.has(anahtar)) continue;
    gorulen.add(anahtar);
    sonuc.push(adres);
  }
  return sonuc;
}

/**
 * Hastaya gönderilen "talebiniz alındı" onay e-postasının SAF metni (konu + düz
 * gövde). Selamlamada yalnız İLK AD kullanılır; başka hiçbir hasta verisi
 * yankılanmaz. Telefon/adres gibi site placeholder'ları ([DOLDUR]) bilinçli
 * olarak EKLENMEZ (sızıntı yasak). Pazarlama içeriği yok — yalnız talep-işleme
 * amaçlı işlem bildirimi (KVKK rızası formda zaten alınır).
 */
export function hastaOnayiMetni(ad: string): { subject: string; text: string } {
  const ilkAd = ad.trim().split(/\s+/)[0] ?? "";
  const selam = ilkAd !== "" ? `Merhaba ${ilkAd},` : "Merhaba,";

  const subject = "Randevu talebiniz alındı — Öz & Saye Psikoloji";
  const text =
    `${selam}\n\n` +
    "Randevu talebiniz bize ulaştı. Uzmanlarımız en kısa sürede sizinle " +
    "iletişime geçecek.\n\n" +
    "Bu e-postayı yanıtlayarak dilediğiniz zaman bize ulaşabilirsiniz.\n\n" +
    "Sağlıklı günler dileriz.\n" +
    "Öz & Saye Psikoloji";

  return { subject, text };
}

/**
 * Hastaya gönderilen "randevunuz planlandı" bilgilendirme e-postasının SAF metni
 * (konu + düz gövde). Uzman panelden bir talebi "Planlandı" durumuna + tarihe
 * aldığında (tarih değişince yeniden) tetiklenir. Selamlamada yalnız İLK AD
 * kullanılır; başka hasta verisi, UZMAN ADI/TELEFON/ADRES ve site placeholder'ı
 * ([DOLDUR]) bilinçli olarak EKLENMEZ (sızıntı yasak). `tarihSaatTR` çağıran
 * tarafça İstanbul yereli okunur biçimde (`istanbulTarihSaat`) verilir.
 *
 * KVKK: yalnız talep-işleme amaçlı işlem bildirimidir (rıza formda alınır);
 * pazarlama içeriği yok.
 */
export function hastaPlanlandiMetni(
  ad: string,
  tarihSaatTR: string,
): { subject: string; text: string } {
  const ilkAd = ad.trim().split(/\s+/)[0] ?? "";
  const selam = ilkAd !== "" ? `Merhaba ${ilkAd},` : "Merhaba,";

  const subject = "Randevunuz planlandı — Öz & Saye Psikoloji";
  const text =
    `${selam}\n\n` +
    "Randevunuz planlanmıştır.\n\n" +
    `Tarih ve saat: ${tarihSaatTR}\n\n` +
    "Bir değişiklik gerekirse bu e-postayı yanıtlayarak bize " +
    "bildirebilirsiniz.\n\n" +
    "Sağlıklı günler dileriz.\n" +
    "Öz & Saye Psikoloji";

  return { subject, text };
}
