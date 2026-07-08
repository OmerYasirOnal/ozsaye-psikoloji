import { z } from "zod";

/**
 * Randevu başvurusu için SAF doğrulama şeması.
 *
 * Yalnız `zod` import eder — `server-only`/DB YOK. Böylece hem düz Vitest
 * birim testleri (Faz 0 kuralı: `server-only` düz Vitest'te fırlatır) hem de
 * ileride gelecek public Server Action aynı kuralları paylaşır.
 *
 * Kurallar + kullanıcıya-görünür Türkçe hata metinleri, statik-hosting
 * dönemindeki `public/randevu.php` doğrulayıcısından BİREBİR taşınmıştır
 * (metinler zaten üretimde; byte-byte korunur).
 */

// PHP $uzmanLabels ile birebir. Uzman değeri -> görünen etiket.
export const UZMAN_SECENEKLERI: Record<string, string> = {
  "melek-yildiz": "Psk. Dan. Melek Yıldız",
  "sacide-sahin": "Kl. Psk. Sacide Şahin",
  farketmez: "Farketmez",
};

// PHP'deki /^[0-9\s\-\+\(\)]{10,20}$/ ile aynı dili tanır: rakam, boşluk,
// tire, artı ve parantez; 10–20 karakter. (JS karakter sınıfında +()  kaçış
// gerektirmez; kaçışsız hâli aynı eşleşmeyi verir, no-useless-escape'i geçer.)
const TELEFON_RE = /^[0-9\s\-+()]{10,20}$/;

export const randevuSchema = z.object({
  ad: z.string().trim().min(2, "Lütfen adınızı girin."),
  telefon: z
    .string()
    .regex(TELEFON_RE, "Lütfen geçerli bir telefon numarası girin."),
  email: z.email("Lütfen geçerli bir e-posta adresi girin."),
  uzman: z.enum(
    ["melek-yildiz", "sacide-sahin", "farketmez"],
    "Lütfen bir uzman seçin.",
  ),
  // Serbest metin; boş "" kabul edilir, biçim doğrulanmaz (ileride nota yazılır).
  tarih: z.string().optional(),
  mesaj: z
    .string()
    .trim()
    .max(2000, "Mesaj en fazla 2000 karakter olabilir.")
    .optional(),
  // İşaretli HTML checkbox yalnız "on" gönderir; işaretsizken alan hiç
  // gelmez (formData.get -> null). null/eksik -> zorunlu onay hatası.
  kvkk: z.literal(
    "on",
    "Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.",
  ),
});

export type RandevuGirdisi = z.infer<typeof randevuSchema>;
