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

/**
 * Mutlak an → `datetime-local` değeri (İstanbul yereli, UTC+3, DST yok).
 * Hem detay sayfasının form ön-doldurmasında hem de `actions.ts`'in takvim-
 * geçerliliği round-trip kontrolünde kullanılır — tek kaynak, iki tarafın
 * aynı biçimlendirmeyi paylaşması için.
 */
export function istanbulInputDegeri(d: Date): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  return `${g("year")}-${g("month")}-${g("day")}T${g("hour")}:${g("minute")}`;
}

/**
 * Mutlak an → Türkçe okunur tarih-saat (ör. "15 Temmuz 2026 14:30", İstanbul
 * yereli). Panel talep detay sayfasının damgaları (oluşturma/planlanan/güncelleme)
 * ile hastaya giden "randevunuz planlandı" bildiriminin tarih metni AYNI
 * biçimlendirmeyi paylaşsın diye buradadır — tek kaynak, iki taraf.
 */
export function istanbulTarihSaat(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

/**
 * `datetime-local` ("YYYY-MM-DDTHH:mm", İstanbul yereli kabul edilir — UTC+3,
 * DST yok) → mutlak an. Sunucu saat diliminden bağımsız olması için offset
 * açıkça eklenir. Boş → null (temizle). Biçim bozuksa "gecersiz".
 *
 * Takvim-geçerliliği: `Date` geçersiz günleri (ör. 30 Şubat) sessizce bir
 * sonraki aya taşır (`Number.isNaN` bunu YAKALAMAZ). `istanbulInputDegeri` ile
 * round-trip karşılaştırması bu sessiz taşmayı da "gecersiz" olarak reddeder.
 */
export function planlananaCevir(ham: string): Date | null | "gecersiz" {
  if (!ham) return null;
  const s = ham.slice(0, 16);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return "gecersiz";
  const d = new Date(`${s}:00+03:00`);
  if (Number.isNaN(d.getTime())) return "gecersiz";
  if (istanbulInputDegeri(d) !== s) return "gecersiz";
  return d;
}
