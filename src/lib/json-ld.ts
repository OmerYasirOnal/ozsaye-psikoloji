/**
 * JSON-LD'yi <script> içine güvenle gömmek için serileştirir. JSON.stringify
 * "<" karakterini KAÇIRMAZ; panel'den girilebilen içerik "</script>" ile
 * script bağlamından kaçabilirdi (stored XSS). "<" -> \u003c dönüşümü JSON
 * olarak eşdeğerdir (JSON.parse aynı değeri verir) ama HTML ayrıştırıcısı
 * için zararsızdır. U+2028/U+2029 da eski ayrıştırıcılar için kaçırılır.
 * (Regex'lerde U+2028/U+2029 kaynak-kodda satır sonlandırıcı olduğundan
 * escape ile yazılır; eşleştikleri karakter aynıdır.)
 */
export function jsonLdSerialize(veri: unknown): string {
  return JSON.stringify(veri)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
