"use server";

/**
 * Randevu başvuru formu Server Action'ı.
 *
 * Akış: useActionState ile kullanılır (ilk parametre prevState). Zod ile sunucu
 * tarafı doğrulama yapılır, honeypot + basit token-bucket rate-limit uygulanır.
 * KVKK açık rızası + başvuru, DATABASE_URL yapılandırılmışsa kalıcı olarak
 * veritabanına yazılır (src/lib/db.ts) — KVKK m.6 ispat yükümlülüğü için birincil
 * kayıt budur. Ayrıca RESEND_API_KEY varsa bildirim e-postası gönderilir (yoksa
 * dev fallback olarak console.info ile loglanır). Başarıda
 * /randevu/tesekkurler'e redirect edilir.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { site } from "@/lib/site";
import { saveConsentRecord } from "@/lib/db";

/** useActionState ile uyumlu form durumu. */
export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string>;
};

/** Form ilk render edildiğindeki başlangıç durumu. */
export const initialState: ActionState = { status: "idle" };

/**
 * Türk cep telefonu formatına toleranslı regex.
 * Kabul edilen örnekler: "0532 123 45 67", "+90 532 123 45 67",
 * "5321234567", "(0532) 123-45-67". Boşluk, tire, parantez serbest.
 */
const TR_PHONE_REGEX =
  /^(?:\+?90[\s-]?)?(?:\(?0?5\d{2}\)?)[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

const appointmentSchema = z.object({
  ad: z
    .string()
    .trim()
    .min(2, { message: "Lütfen adınızı girin (en az 2 karakter)." }),
  telefon: z
    .string()
    .trim()
    .regex(TR_PHONE_REGEX, {
      message: "Geçerli bir cep telefonu numarası girin.",
    }),
  email: z
    .string()
    .trim()
    .email({ message: "Geçerli bir e-posta adresi girin." }),
  uzman: z.enum(["melek-yildiz", "sacide-sahin", "farketmez"], {
    message: "Lütfen bir uzman seçin.",
  }),
  tarih: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => {
        // Boş/verilmemişse opsiyonel: geçerli kabul et.
        if (!v) return true;
        // Dolu ise katı "YYYY-MM-DD" biçimi ve gerçek bir takvim tarihi olmalı.
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
        const [year, month, day] = v.split("-").map(Number);
        const parsedDate = new Date(year!, month! - 1, day!);
        // Round-trip: ör. "2026-02-30" gibi taşan/geçersiz günleri ele.
        if (
          parsedDate.getFullYear() !== year ||
          parsedDate.getMonth() !== month! - 1 ||
          parsedDate.getDate() !== day
        ) {
          return false;
        }
        // Bugünün tarihini ISO "YYYY-MM-DD" olarak (yerel) hesapla ve karşılaştır.
        const today = new Date();
        const todayIso = `${today.getFullYear()}-${String(
          today.getMonth() + 1,
        ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
        // Bugün veya sonrası olmalı (geçmiş tarihi reddet).
        return v >= todayIso;
      },
      { message: "Lütfen bugün veya sonrası için geçerli bir tarih seçin." },
    ),
  mesaj: z
    .string()
    .trim()
    .max(2000, { message: "Mesaj en fazla 2000 karakter olabilir." })
    .optional(),
  kvkk: z
    .string()
    .refine((v) => v === "on" || v === "true", {
      message: "Devam etmek için KVKK aydınlatma metnini onaylamalısınız.",
    }),
});

/** Uzman slug'ını kullanıcıya gösterilecek Türkçe etikete çevirir. */
function uzmanLabel(slug: string): string {
  if (slug === "farketmez") return "Farketmez";
  const expert = site.experts.find((e) => e.slug === slug);
  return expert ? `${expert.shortTitle} ${expert.name}` : slug;
}

// --- Basit token-bucket rate-limit (modül seviyesi, bellek içi) ---
// Not: Sunucusuz/çok örnekli ortamda örnekler arası paylaşılmaz; yalnızca
// kaba bir koruma sağlar. Kalıcı/dağıtık limit için harici bir store gerekir.
const RATE_LIMIT_WINDOW_MS = 60_000; // 60 saniye
const RATE_LIMIT_MAX = 3; // pencere başına 3 istek
const rateLimitBuckets = new Map<string, number[]>();

/** IP için pencere içindeki istek sayısını kontrol eder; limit aşıldıysa false. */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitBuckets.get(ip) ?? []).filter(
    (t) => t > windowStart,
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitBuckets.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  rateLimitBuckets.set(ip, timestamps);
  return true;
}

/** İstek başlıklarından istemci IP'si ve user-agent'ı çıkarır. */
async function getRequestMeta(): Promise<{ ip: string; userAgent: string }> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor
    ? // İlk değer gerçek istemci IP'sidir (proxy zinciri).
      forwardedFor.split(",")[0]!.trim()
    : headersList.get("x-real-ip")?.trim() || "unknown";
  const userAgent = headersList.get("user-agent")?.slice(0, 500) || "unknown";
  return { ip, userAgent };
}

/**
 * Randevu başvurusunu işler. useActionState imzasına uygun:
 * ilk parametre önceki durum, ikincisi FormData.
 */
export async function submitAppointment(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1) Honeypot: gizli "website" alanı bot tarafından doldurulduysa, gerçek
  // kullanıcı akışıyla AYNI sonucu göster (aynı teşekkür sayfasına yönlendir) ki
  // bot başarılı/başarısız ayrımı yapamasın — ama HİÇBİR e-posta gönderme.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    redirect("/randevu/tesekkurler");
  }

  // 2) Rate-limit kontrolü.
  const { ip, userAgent } = await getRequestMeta();
  if (!checkRateLimit(ip)) {
    return {
      status: "error",
      message:
        "Çok fazla istek gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.",
    };
  }

  // 3) Doğrulama.
  const parsed = appointmentSchema.safeParse({
    ad: formData.get("ad"),
    telefon: formData.get("telefon"),
    email: formData.get("email"),
    uzman: formData.get("uzman"),
    tarih: formData.get("tarih") ?? undefined,
    mesaj: formData.get("mesaj") ?? undefined,
    kvkk: formData.get("kvkk") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Lütfen formdaki işaretli alanları düzeltin.",
      errors: fieldErrors,
    };
  }

  const data = parsed.data;
  const consentTimestamp = new Date().toISOString();

  // 4) KVKK açık rızası + başvuruyu kalıcı sakla (DATABASE_URL yapılandırılmışsa).
  //    İspat yükümlülüğü için birincil kayıt budur; e-posta ikincil kayıttır.
  //    DB yoksa/yazım başarısızsa kullanıcı akışı bloklanmaz.
  const consentSaved = await saveConsentRecord({
    ad: data.ad,
    telefon: data.telefon,
    email: data.email,
    uzman: data.uzman,
    tarih: data.tarih,
    mesaj: data.mesaj,
    kvkkConsent: true,
    consentAt: consentTimestamp,
    ip,
    userAgent,
  });

  // 5) E-posta gövdesini oluştur.
  const subject = `Yeni Randevu Başvurusu — ${data.ad}`;
  const bodyLines = [
    "Yeni randevu başvurusu alındı.",
    "",
    `Ad Soyad: ${data.ad}`,
    `Telefon: ${data.telefon}`,
    `E-posta: ${data.email}`,
    `Tercih edilen uzman: ${uzmanLabel(data.uzman)}`,
    data.tarih ? `Tercih edilen tarih: ${data.tarih}` : "Tercih edilen tarih: belirtilmedi",
    "",
    "Mesaj:",
    data.mesaj && data.mesaj.length > 0 ? data.mesaj : "(mesaj girilmedi)",
    "",
    "—",
    `KVKK aydınlatma metni onayı: evet (${consentTimestamp})`,
    `Başvuru IP: ${ip}`,
    consentSaved
      ? "Kalıcı kayıt: veritabanına yazıldı."
      : "Kalıcı kayıt: veritabanı yapılandırılmadı — bu e-posta ikincil kayıttır.",
  ];
  const textBody = bodyLines.join("\n");

  // 6) Gönderim: RESEND_API_KEY varsa Resend ile e-posta, yoksa dev fallback log.
  if (process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from =
      process.env.RESEND_FROM ?? "Özsaye Psikoloji <onboarding@resend.dev>";
    const to = process.env.APPOINTMENT_TO_EMAIL ?? site.email.address;

    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: data.email,
      subject,
      text: textBody,
    });

    if (error) {
      // E-posta gönderilemezse kullanıcıya bilgi ver (redirect etme).
      console.error("Randevu e-postası gönderilemedi:", error);
      return {
        status: "error",
        message:
          "Başvurunuz alınamadı. Lütfen kısa süre sonra tekrar deneyin veya telefonla iletişime geçin.",
      };
    }
  } else {
    // Dev fallback: e-posta sağlayıcısı yapılandırılmamış, başvuruyu logla.
    console.info("[Randevu başvurusu — dev fallback]\n" + textBody);
  }

  // 7) Başarı: teşekkür sayfasına yönlendir.
  // Not: redirect() bir NEXT_REDIRECT exception fırlatır; bu exception'ın
  // Next.js tarafından yakalanabilmesi için onu kendi try/catch'imizle
  // sarmıyoruz — bu yüzden redirect fonksiyonun en sonunda çağrılır.
  redirect("/randevu/tesekkurler");
}
