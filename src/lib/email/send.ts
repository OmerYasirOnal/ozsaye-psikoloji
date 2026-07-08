import "server-only";

const FROM = "Öz & Saye <randevu@bildirim.ozsaye.com>";

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
  // Alıcı yoksa gönderilecek bir şey yok: prod yolu 422 döndürürdü, dev konsol
  // yolu ise kimseye "başarılı" gibi görünen satır basardı. Erken dön + görünür
  // uyarı bas ki hata dev loglarında da fark edilsin (staff tablosu boş vb.).
  if (to.length === 0) {
    console.error(
      "[randevu] bildirim alıcısı yok — staff tablosunu kontrol edin",
    );
    return;
  }

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
      `\n[DEV randevu-bildirim] → ${to.join(", ")}\n${subject}\n${body}\n`,
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
      to,
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
