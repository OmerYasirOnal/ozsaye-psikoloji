import { services } from "./services";
import { site, isReady } from "./site";
import { faqs } from "@/components/FaqSection";

/**
 * AI asistanının sistem promptuna gömülecek, site içeriğinden üretilen düz
 * metin özet. Yalnız bellekte sabit veri okur (DB çağrısı yok) — her istekte
 * ucuza yeniden hesaplanabilir. Placeholder ([DOLDUR]) alanlar isReady() ile
 * elenir; ücret gibi doğrulanmamış veri asla asistana sızmaz.
 */
export function asistanIcerigi(): string {
  const bolumler: string[] = [];

  bolumler.push(`Klinik adı: ${site.shortName}`);

  const hizmetler = services.map((s) => `- ${s.title}: ${s.shortDesc}`).join("\n");
  bolumler.push(`Hizmetler:\n${hizmetler}`);

  const uzmanlar = site.experts.map((e) => `- ${e.name} (${e.title})`).join("\n");
  bolumler.push(`Uzman kadrosu:\n${uzmanlar}`);

  if (isReady(site.pricing.sessionFee)) {
    bolumler.push(`Seans ücreti: ${site.pricing.sessionFee} (${site.pricing.duration})`);
  }

  const sss = faqs.map((f) => `S: ${f.question}\nC: ${f.answerText}`).join("\n\n");
  bolumler.push(`Sıkça sorulan sorular:\n${sss}`);

  return bolumler.join("\n\n");
}
