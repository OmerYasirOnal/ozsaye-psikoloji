import { purgeOldRequests } from "@/lib/randevu-db";

/**
 * KVKK saklama-süresi temizliği — Vercel Cron uç noktası.
 *
 * Bu bir MAKİNE uç noktasıdır (panel oturumu DEĞİL): Vercel Cron her gün
 * çağırır ve `purgeOldRequests` ile saklama eşiğinden eski `appointment_requests`
 * satırlarını siler. `verifySession` KULLANMAZ — çerez/oturum yoktur; koruma
 * Vercel Cron'un otomatik `Authorization: Bearer ${CRON_SECRET}` başlığıdır.
 *
 * Env okuyup istek anında DB'ye yazdığı için asla statik üretilmemeli.
 */
export const dynamic = "force-dynamic";

// Saklama eşiği env'de tanımlı değilse varsayılan (scripts/purge-old-requests.ts
// ile aynı): 365 gün. Gerçek süre klinik/hukuk netleşince env'den ayarlanır.
const DEFAULT_DAYS = 365;

/**
 * Uzunluk-korumalı, sabit-zamanlıya yakın karşılaştırma. Erken length kısa
 * devresi yalnız uzunluğu sızdırır (gizli değeri değil) ve eşit uzunlukta
 * baytları XOR ile tam tarayarak erken-çıkış zamanlama sızıntısını önler. Secret
 * yüksek entropili (openssl rand) olduğundan bu, brute-force'a karşı yeterli.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
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
  if (!timingSafeEqual(authorization, `Bearer ${secret}`)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  // Gün kaynağı: PURGE_OLD_REQUESTS_DAYS; boş/tanımsızsa DEFAULT_DAYS.
  // purgeOldRequests da pozitif-tamsayı guard'ı taşır; burada ön-doğrulayıp
  // yakalanmayan throw yerine temiz bir 400 döndürürüz.
  const raw = process.env.PURGE_OLD_REQUESTS_DAYS?.trim();
  let days = DEFAULT_DAYS;
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
