"use server";

/**
 * Randevu talebi — KAMUSAL (hasta-yüzü) Server Action.
 *
 * Bu action bilinçli olarak `verifySession` KULLANMAZ: randevu formu herkese
 * açıktır. Koruma katmanları = honeypot (gizli `website` alanı) + zod doğrulama
 * + IP tabanlı hız limiti. (Statik dönemin `public/randevu.php` korumalarının
 * birebir devamı; hiçbiri panel oturumu gerektirmez.)
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { randevuSchema, UZMAN_SECENEKLERI } from "@/lib/randevu";
import {
  createAppointmentRequest,
  getBildirimAlicilari,
  isRandevuRateLimited,
} from "@/lib/randevu-db";
import { sendAppointmentNotification, sendHastaOnayi } from "@/lib/email/send";

export type RandevuFormState = { hata?: string };

export async function randevuTalebiGonder(
  _prev: RandevuFormState,
  fd: FormData,
): Promise<RandevuFormState> {
  // 1. Honeypot: bot doldurursa hiçbir yan etki OLMADAN (DB/e-posta/hız limiti
  //    tüketimi yok) başarı sandığı teşekkür sayfasına yönlendir. PHP davranışı:
  //    değer trim'lenip boş değilse bot kabul edilir.
  const website = fd.get("website");
  if (typeof website === "string" && website.trim() !== "") {
    redirect("/randevu/tesekkurler/");
  }

  // 2. zod doğrulama — alan sırasına göre ilk hata mesajını döndür. Şema
  //    metinleri üretim Türkçe kopyasıdır (public/randevu.php'den birebir).
  //
  // FormData.get() eksik alanda null döner; şema saf string bekler. null → ""
  // normalize edilir ki tip hatası yerine alanın KENDİ Türkçe mesajı tetiklensin
  // (tarih/mesaj için "" zaten geçerli boş değerdir).
  const metin = (k: string): string => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  const parsed = randevuSchema.safeParse({
    ad: metin("ad"),
    telefon: metin("telefon"),
    email: metin("email"),
    uzman: metin("uzman"),
    tarih: metin("tarih"),
    mesaj: metin("mesaj"),
    // kvkk HAM bırakılır: null yolu zaten doğru Türkçe onay mesajını üretir.
    kvkk: fd.get("kvkk"),
  });
  if (!parsed.success) {
    return { hata: parsed.error.issues[0].message };
  }
  const girdi = parsed.data;

  // 3. IP (Next 16: headers() bir Promise).
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "bilinmiyor";

  // 4. Hız limiti — SESSİZ DÜŞÜRME YOK; gerçek hastayı kaybetmemek için dostça
  //    mesajla geri bildir.
  if (await isRandevuRateLimited(ip)) {
    return {
      hata: "Çok sayıda deneme algılandı. Lütfen bir süre sonra tekrar deneyin ya da bizi telefonla arayın.",
    };
  }

  // 5. Talebi DB'ye yaz.
  await createAppointmentRequest(girdi, ip);

  // 6. Uzman(lar)a bildirim — try/catch İÇİNDE. E-posta başarısız olsa bile
  //    talep DB'de kalıcıdır; hastaya asla başarısızmış gibi görünmemeli.
  //    `tarih`/`mesaj` HAM geçilir (belirtilmedi/(mesaj girilmedi) fallback'leri
  //    sendAppointmentNotification içinde uygulanır).
  try {
    const expertSlug = girdi.uzman === "farketmez" ? null : girdi.uzman;
    const alicilar = await getBildirimAlicilari(expertSlug);
    await sendAppointmentNotification(alicilar, girdi.email, {
      ad: girdi.ad,
      telefon: girdi.telefon,
      email: girdi.email,
      uzmanEtiketi: UZMAN_SECENEKLERI[girdi.uzman],
      tarih: girdi.tarih ?? "",
      mesaj: girdi.mesaj ?? "",
      ip,
      tarihDamgasi: new Date().toISOString(),
    });
  } catch (e) {
    console.error("[randevu] bildirim gönderilemedi:", e);
  }

  // 6b. Hastaya "talebiniz alındı" onay e-postası — KENDİ try/catch'i. Uzman
  //     bildiriminden BAĞIMSIZ ve ONDAN SONRA: onay maili başarısız olsa bile
  //     (a) talep DB'de kalıcıdır, (b) uzman bildirimi zaten gönderildi,
  //     (c) akış bozulmaz ve uzman bildirimi YİNELENMEZ. KVKK: bu yalnız
  //     talep-işleme amaçlı işlem bildirimidir (rıza formda alınıyor);
  //     pazarlama içeriği yok. (Honeypot dalı 1. adımda döndüğünden bota mail
  //     gitmez.)
  try {
    await sendHastaOnayi(girdi.email, girdi.ad);
  } catch (e) {
    console.error("[randevu] hasta onay e-postası gönderilemedi:", e);
  }

  // 7. Teşekkür sayfasına yönlendir — ASLA try/catch içinde değil
  //    (NEXT_REDIRECT fırlatır; yakalanırsa yönlendirme çalışmaz).
  redirect("/randevu/tesekkurler/");
}
