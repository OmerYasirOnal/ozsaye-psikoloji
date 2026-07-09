import { timingSafeEqual } from "node:crypto";
import { purgeOldRequests, DEFAULT_PURGE_DAYS } from "@/lib/randevu-db";

/**
 * KVKK saklama-süresi temizliği — Vercel Cron uç noktası.
 *
 * Bu bir MAKİNE uç noktasıdır (panel oturumu DEĞİL): Vercel Cron her gün
 * çağırır ve `purgeOldRequests` ile saklama eşiğinden eski `appointment_requests`
 * satırlarını siler. `verifySession` KULLANMAZ — çerez/oturum yoktur; koruma
 * Vercel Cron'un otomatik `Authorization: Bearer ${CRON_SECRET}` başlığıdır.
 *
 * Env okuyup istek anında DB'ye yazdığı için asla statik üretilmemeli.
 *
 * DİKKAT: `vercel.json`'daki cron path'i sondaki `/` ile yazılır çünkü
 * `next.config.ts` `trailingSlash: true` kullanır — slash'sız `/api/cron/...`
 * 308 redirect'e düşer ve Vercel Cron redirect izlemediğinden temizlik hiç
 * çalışmaz. Path ile bu route'un kanonik URL'i birebir aynı olmalı.
 */
export const dynamic = "force-dynamic";

/**
 * Uzunluk-korumalı sabit-zamanlı karşılaştırma. `node:crypto.timingSafeEqual`
 * eşit uzunlukta Buffer ister (aksi halde fırlatır); bu yüzden önce uzunluğu
 * kontrol ederiz. Erken uzunluk kısa-devresi yalnız uzunluğu sızdırır
 * (yüksek-entropili secret için önemsiz), gizli değeri değil.
 */
function guvenliEsit(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  // FAIL CLOSED: CRON_SECRET yoksa/boşsa uç nokta ASLA korumasız çalışmaz.
  // (Yanlış yapılandırmada sessizce açık kalıp herkese silme yaptırmaktansa
  // 401 döndürüp temizliği hiç yapmamak güvenli tarafta kalır.)
  if (!secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  if (!guvenliEsit(authorization, `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // Gün kaynağı: PURGE_OLD_REQUESTS_DAYS; boş/tanımsızsa DEFAULT_PURGE_DAYS.
  // purgeOldRequests da pozitif-tamsayı guard'ı taşır; burada ön-doğrulayıp
  // yakalanmayan throw yerine temiz bir 400 döndürürüz.
  const raw = process.env.PURGE_OLD_REQUESTS_DAYS?.trim();
  let days = DEFAULT_PURGE_DAYS;
  if (raw) {
    const parsed = Number(raw);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return Response.json(
        {
          ok: false,
          error: "PURGE_OLD_REQUESTS_DAYS pozitif bir tam sayı olmalı.",
        },
        { status: 400 },
      );
    }
    days = parsed;
  }

  try {
    const deleted = await purgeOldRequests(days);
    return Response.json({ ok: true, deleted, days });
  } catch (error) {
    // Hasta PII loglanmaz: purgeOldRequests yalnız sayı döndürür, hata da
    // (guard mesajı / DB hatası) hasta verisi içermez.
    console.error("[cron purge-requests] temizlik başarısız:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}
