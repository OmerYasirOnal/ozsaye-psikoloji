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
