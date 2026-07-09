import { UZMAN_SECENEKLERI } from "@/lib/randevu";

/**
 * Randevu talepleri paneli için SAF (DB'siz) yardımcılar.
 *
 * `randevu.ts` gibi yalnız hafif bağımlılık kullanır — `server-only`/DB YOK.
 * Böylece hem client form (durum seçimi) hem sunucu tarafı (detay sayfası) hem
 * de düz Vitest birim testleri aynı etiket/değer/biçimleme kurallarını paylaşır.
 */

// Durum -> Türkçe etiket. DB `request_status` enum'ının TEK arayüz kaynağı.
// Sıralama = iş akışı sırası (yeni → arandı → planlandı → tamam/iptal).
export const DURUM_ETIKETLERI = {
  new: "Yeni",
  contacted: "Arandı",
  scheduled: "Planlandı",
  done: "Tamamlandı",
  cancelled: "İptal",
} as const;

export type RandevuDurum = keyof typeof DURUM_ETIKETLERI;

// İzin verilen durum değerleri (zod/enum + gösterge sırası) — tek yerden.
export const DURUM_DEGERLERI = Object.keys(DURUM_ETIKETLERI) as RandevuDurum[];

/** expertSlug -> uzman görünen adı; null ("farketmez") → "Farketmez". */
export function uzmanEtiketi(slug: string | null): string {
  if (!slug) return "Farketmez";
  return UZMAN_SECENEKLERI[slug] ?? slug;
}

/**
 * WhatsApp için telefon numarasını uluslararası (90…) biçime çevirir; yalnız
 * rakam döndürür (`wa.me/<numara>` için). Çözümlenemezse null → arayan taraf
 * yalnız `tel:` bağlantısına düşer.
 *
 * Kurallar:
 *  - "0" + 10 hane (0 5XX … → 11 hane) → baştaki 0 atılır, "90" eklenir.
 *  - 10 hane, 5 ile başlıyor (5XX …)   → "90" eklenir.
 *  - Zaten "90" + 10 hane (12 hane)     → olduğu gibi bırakılır.
 *  - Diğer her şey                       → null (çözümlenemedi).
 */
export function whatsappNumarasi(telefon: string): string | null {
  const rakamlar = telefon.replace(/\D/g, "");
  if (rakamlar.length === 11 && rakamlar.startsWith("0")) {
    return "90" + rakamlar.slice(1);
  }
  if (rakamlar.length === 10 && rakamlar.startsWith("5")) {
    return "90" + rakamlar;
  }
  if (rakamlar.length === 12 && rakamlar.startsWith("90")) {
    return rakamlar;
  }
  return null;
}

/**
 * Liste ekranında omuz-üstü gizliliği için hafifçe maskelenmiş telefon
 * (baş 4 + son 2 rakam görünür). Detay ekranında tam numara gösterilir.
 */
export function maskeliTelefon(telefon: string): string {
  const rakamlar = telefon.replace(/\D/g, "");
  if (rakamlar.length < 6) return "•••";
  return `${rakamlar.slice(0, 4)} ••• •• ${rakamlar.slice(-2)}`;
}
