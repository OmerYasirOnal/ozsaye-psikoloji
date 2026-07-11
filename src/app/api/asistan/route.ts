import { z } from "zod";
import { asistanIcerigi } from "@/lib/asistan-icerik";
import { fallbackCevap } from "@/lib/asistan-fallback";

/**
 * Herkese açık AI asistan uç noktası (ChatWidget). Oturum GEREKMEZ — randevu
 * formuyla aynı kamusal-erişim modeli. Ziyaretçi hiçbir zaman ham hata
 * görmez: Mac'e ulaşılamazsa/hız sınırı aşılırsa her zaman kullanıcı-dostu
 * bir Türkçe cevapla 200 döner.
 */
export const dynamic = "force-dynamic";

const mesajSchema = z.object({
  mesaj: z.string().trim().min(1).max(500),
  gecmis: z
    .array(
      z.object({
        rol: z.enum(["kullanici", "asistan"]),
        icerik: z.string().max(500),
      }),
    )
    .max(6)
    .optional()
    .default([]),
});

// IP başına 10 dakikada en fazla 8 istek. Modül-seviyesi in-memory sayaç:
// Fluid Compute örnek-yeniden-kullanımıyla makul çalışır; küçük klinik
// trafiği için DB'ye taşımak YAGNI (bkz. spec "Güvenlik notları").
const RATE_LIMIT_PENCERE_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAKS_ISTEK = 8;
const istekGecmisi = new Map<string, number[]>();

function hizSiniriAsildiMi(ip: string): boolean {
  const simdi = Date.now();
  const zamanlar = (istekGecmisi.get(ip) ?? []).filter(
    (t) => simdi - t < RATE_LIMIT_PENCERE_MS,
  );
  zamanlar.push(simdi);
  istekGecmisi.set(ip, zamanlar);
  return zamanlar.length > RATE_LIMIT_MAKS_ISTEK;
}

type GecmisMesaj = { rol: "kullanici" | "asistan"; icerik: string };

async function macAsistanindanCevapAl(
  mesaj: string,
  gecmis: GecmisMesaj[],
): Promise<string | null> {
  const url = process.env.AI_ASISTAN_URL;
  const secret = process.env.AI_ASISTAN_SECRET;
  if (!url || !secret) return null;

  const controller = new AbortController();
  const zamanAsimi = setTimeout(() => controller.abort(), 5000);

  try {
    const yanit = await fetch(`${url}/sohbet`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Asistan-Secret": secret,
      },
      body: JSON.stringify({ mesaj, gecmis, siteIcerigi: asistanIcerigi() }),
      signal: controller.signal,
    });
    if (!yanit.ok) return null;
    const veri = await yanit.json();
    return typeof veri.cevap === "string" ? veri.cevap : null;
  } catch {
    return null;
  } finally {
    clearTimeout(zamanAsimi);
  }
}

export async function POST(request: Request) {
  const govde = await request.json().catch(() => null);
  const ayristirilmis = mesajSchema.safeParse(govde);
  if (!ayristirilmis.success) {
    return Response.json({
      cevap: "Mesajınızı anlayamadım, lütfen tekrar yazar mısınız?",
    });
  }
  const { mesaj, gecmis } = ayristirilmis.data;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "bilinmiyor";

  if (hizSiniriAsildiMi(ip)) {
    return Response.json({
      cevap:
        "Kısa süre içinde çok fazla mesaj gönderdiniz. Birkaç dakika sonra tekrar deneyebilirsiniz.",
    });
  }

  const macCevabi = await macAsistanindanCevapAl(mesaj, gecmis);
  return Response.json({ cevap: macCevabi ?? fallbackCevap(mesaj) });
}
