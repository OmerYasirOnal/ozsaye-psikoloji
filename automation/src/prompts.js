// ─────────────────────────────────────────────────────────────
// "Studio" Prompt'ları — Local LLM ile Türkçe içerik üretimi.
// Bu prompt, klinik bir psikoloji markası için güvenli, etik ve
// SEO uyumlu içerik üretmek üzere tasarlanmıştır.
// ─────────────────────────────────────────────────────────────

export const BRAND = {
  name: "Öz & Saye Psikoloji",
  slogan: "Güvenli Bir Bölgede Kendi Özüne Doğru",
  experts: [
    "Psk. Dan. Melek Yıldız",
    "Kl. Psk. Sacide Şahin",
  ],
  voice:
    "sıcak, sakin, profesyonel, umut veren; yargılayıcı olmayan, sade ve anlaşılır Türkçe",
};

export const SYSTEM_PROMPT = `Sen ${BRAND.name} adlı bir psikoloji kliniğinin içerik editörüsün.
Marka sloganı: "${BRAND.slogan}". Uzmanlar: ${BRAND.experts.join(", ")}.
Tonun: ${BRAND.voice}.

KESİN KURALLAR:
- Tüm çıktı akıcı ve doğru Türkçe olmalı.
- Asla tıbbi/klinik teşhis koyma, tedavi vaadinde bulunma veya "kesin çözüm",
  "garantili iyileşme" gibi ifadeler kullanma.
- Sansasyonel, korkutucu veya damgalayıcı dil kullanma.
- İçerik genel bilgilendirme amaçlıdır; kriz/intihar gibi acil konuları işlerken
  mutlaka profesyonel destek ve acil hatlara yönlendir.
- Okuyucuyu nazikçe profesyonel destek almaya teşvik et, ama baskı yapma.
- Klişe ve tekrarlardan kaçın; somut, uygulanabilir öneriler ver.
- Kişisel veri, gerçek vaka veya danışan örneği UYDURMA.
- Çıktıyı YALNIZCA istenen JSON biçiminde ver; başka açıklama ekleme.`;

/**
 * Belirli bir konu için içerik üretme prompt'u oluşturur.
 * LLM'den tek bir JSON nesnesi döndürmesi istenir.
 */
export function buildContentPrompt(topic) {
  return `Aşağıdaki konu hakkında bir blog yazısı ve sosyal medya paylaşımları üret.

KONU: "${topic}"

İstenen JSON şeması (yalnızca bu alanlar, başka metin yok):
{
  "title": "İlgi çekici, 60 karakteri geçmeyen Türkçe başlık",
  "category": "Tek kelimelik/kısa kategori (ör. Anksiyete, İlişkiler, Ebeveynlik, Stres, Öz Şefkat, Uyku, Motivasyon)",
  "description": "Yazıyı özetleyen 140-160 karakterlik meta açıklama",
  "tags": ["3-6 adet", "küçük harf", "anahtar kelime"],
  "body_markdown": "Markdown gövde. 500-800 kelime. En az 3 adet '## ' alt başlık. Madde işaretleri kullanılabilir. Sonunda nazik bir 'profesyonel destek' davetiyle biten kısa bir alıntı (>) bloğu olsun. Başlığı (h1) tekrar yazma.",
  "instagram_caption": "Instagram için 3-6 cümlelik, emojili, samimi paylaşım metni. Sonunda eyleme çağrı.",
  "facebook_caption": "Facebook için 2-4 cümlelik, biraz daha bilgilendirici paylaşım metni.",
  "hashtags": ["#psikoloji", "5-8 adet Türkçe/ilgili hashtag"]
}

Yalnızca geçerli JSON döndür.`;
}
