import "server-only";
import {
  KLINIK_KUTU,
  bildirimAlicilari,
  hastaOnayiMetni,
  hastaPlanlandiMetni,
} from "./bildirim";

const FROM = "Öz & Saye <randevu@bildirim.ozsaye.com>";
// KLINIK_KUTU (info@ozsaye.com) SAF `./bildirim` modülünde tanımlıdır — hem
// alıcı hesaplama (bildirimAlicilari) hem hasta onayı Reply-To'su onu kullanır;
// oraya konması düz Vitest'te (server-only'siz) birim-test edilebilmesi içindir.

export async function sendMagicLink(email: string, url: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  // Dev: anahtar yoksa konsola bas (gerçek e-posta gerekmez)
  if (!key) {
    console.log(`\n[DEV magic-link] ${email} → ${url}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "Öz & Saye panel giriş bağlantınız",
      html: `<p>Panele girmek için (15 dk geçerli):</p>
             <p><a href="${url}">${url}</a></p>
             <p>Bu isteği siz yapmadıysanız yok sayın.</p>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
  }
}

export async function sendAppointmentNotification(
  to: string[],
  replyTo: string,
  ozet: {
    ad: string;
    telefon: string;
    email: string;
    uzmanEtiketi: string;
    tarih: string;
    mesaj: string;
    ip: string;
    tarihDamgasi: string;
  },
): Promise<void> {
  // Uzman adreslerine klinik kutusunu (info@) ekle + tekilleştir. info@ HER
  // ZAMAN eklendiğinden alıcı listesi artık hiçbir zaman boş olmaz (prod'un
  // eski 422'si ortadan kalkar). Ancak uzman listesinin boş gelmesi hâlâ bir
  // yanlış-yapılandırma işaretidir → görünür uyarı bas; kopya yine de info@'ya
  // gider, talep bildirimsiz kalmaz.
  if (to.length === 0) {
    console.error(
      "[randevu] uzman bildirim alıcısı yok — staff tablosunu kontrol edin; kopya yine info@'ya gidiyor",
    );
  }
  const alicilar = bildirimAlicilari(to);

  const key = process.env.RESEND_API_KEY;

  const subject = `Yeni Randevu Başvurusu — ${ozet.ad}`;

  // Gövde: eski PHP işleyicisinin (public/randevu.php) düz-metin şablonu birebir.
  const body =
    "Yeni randevu başvurusu alındı.\n\n" +
    `Ad Soyad: ${ozet.ad}\n` +
    `Telefon: ${ozet.telefon}\n` +
    `E-posta: ${ozet.email}\n` +
    `Tercih edilen uzman: ${ozet.uzmanEtiketi}\n` +
    `Tercih edilen tarih: ${ozet.tarih !== "" ? ozet.tarih : "belirtilmedi"}\n\n` +
    `Mesaj:\n${ozet.mesaj !== "" ? ozet.mesaj : "(mesaj girilmedi)"}\n\n` +
    "—\n" +
    `KVKK aydınlatma metni onayı: evet (${ozet.tarihDamgasi})\n` +
    `Başvuru IP: ${ozet.ip}\n`;

  // Dev: anahtar yoksa konsola bas (gerçek e-posta gerekmez)
  if (!key) {
    console.log(
      `\n[DEV randevu-bildirim] → ${alicilar.join(", ")}\n${subject}\n${body}\n`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: alicilar,
      reply_to: replyTo,
      subject,
      // Düz metin: enjeksiyon yüzeyi bırakmamak için html değil text.
      text: body,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
  }
}

/**
 * Hastaya "randevu talebiniz alındı" onay e-postası. Reply-To = klinik kutusu
 * (info@) → hastanın yanıtı paylaşımlı kutuya düşer. İçerik SAF
 * `hastaOnayiMetni`'nden gelir: ilk ad dışında hasta verisi yankılanmaz,
 * telefon/adres ([DOLDUR]) sızdırılmaz.
 *
 * KVKK: yalnız talep-işleme amaçlı işlem bildirimidir (rıza formda alınıyor);
 * pazarlama içeriği eklenmez.
 */
export async function sendHastaOnayi(
  hastaEmail: string,
  hastaAd: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const { subject, text } = hastaOnayiMetni(hastaAd);

  // Dev: anahtar yoksa konsola bas (gerçek e-posta gerekmez)
  if (!key) {
    console.log(
      `\n[DEV randevu-hasta-onayi] → ${hastaEmail}\n${subject}\n${text}\n`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: hastaEmail,
      // Yanıtlar kliniğin ortak kutusuna (info@) düşsün.
      reply_to: KLINIK_KUTU,
      subject,
      // Düz metin: enjeksiyon yüzeyi bırakmamak için html değil text.
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
  }
}

/**
 * Hastaya "randevunuz planlandı" bilgilendirme e-postası — uzman panelden bir
 * talebi "Planlandı" durumuna + tarihe aldığında gönderilir (tarih değişince
 * yeniden). `sendHastaOnayi` aynası: Reply-To = klinik kutusu (info@), düz metin,
 * dev'de RESEND_API_KEY boşken konsol yedeği. İçerik SAF `hastaPlanlandiMetni`'nden
 * gelir: yalnız ilk ad + verilen tarih-saat; uzman adı/telefon/adres yankılanmaz,
 * [DOLDUR] sızdırılmaz.
 *
 * KVKK: yalnız talep-işleme amaçlı işlem bildirimidir (rıza formda alınır);
 * pazarlama içeriği yok.
 */
export async function sendHastaPlanlandi(
  hastaEmail: string,
  hastaAd: string,
  tarihSaatTR: string,
): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const { subject, text } = hastaPlanlandiMetni(hastaAd, tarihSaatTR);

  // Dev: anahtar yoksa konsola bas (gerçek e-posta gerekmez)
  if (!key) {
    console.log(
      `\n[DEV randevu-planlandi] → ${hastaEmail}\n${subject}\n${text}\n`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: hastaEmail,
      // Yanıtlar kliniğin ortak kutusuna (info@) düşsün.
      reply_to: KLINIK_KUTU,
      subject,
      // Düz metin: enjeksiyon yüzeyi bırakmamak için html değil text.
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
  }
}
