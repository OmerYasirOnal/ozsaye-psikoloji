# Öz & Saye Psikoloji — Yapılan İşler & Güncel Teklif

> Hazırlayan: Ömer Yasir · Tarih: Haziran 2026
> Bu doküman; bugüne kadar tamamladığımız işleri, devam eden / planlanan adımları,
> güncel fiyatlandırmayı ve sıkça sorduğunuz soruların yanıtlarını **şeffaf** bir
> şekilde özetler. Rakamlar netleştirmek üzere öneridir; birlikte son halini veririz.

---

## 0. Bağlantılar — Canlı Önizleme

İşin tamamını kendi gözünüzle görebilirsiniz:

| | Bağlantı |
|---|---|
| 🌐 **Web Sitesi (canlı)** | https://ozsayepsikoloji.com |
| 📷 **Instagram** | https://instagram.com/ozsayepsikoloji |
| 💻 **Proje Kaynak Kodu (GitHub)** | https://github.com/OmerYasirOnal/ozsaye-psikoloji |

> Web sitesi telefonda da, bilgisayarda da açılır. GitHub bağlantısı, işin
> "kapağının altını" — yani arkadaki tüm mühendislik emeğini — şeffafça gösterir.

---

## 1. Özet — Bir Bakışta

Elinizde artık **canlı bir web sitesi**, **kurumsal bir marka kimliği** (logo kiti +
renk/tipografi sistemi), **hazır sosyal medya görsel seti** (Instagram + LinkedIn),
**blog/haberler altyapısı** ve **otomatik yayınlama (deploy) sistemi** var. Bunların
hepsi tek seferlik yapılan, size kalan kalıcı varlıklardır.

| | Ajans Teklifi | Bizim Yaklaşımımız |
|---|---|---|
| Kurulum (tek seferlik) | ~50.000 TL | Aşağıdaki dostane paket |
| Aylık | ~30.000 TL (post + yönetim) | İhtiyaca göre esnek / opsiyonel |
| Şeffaflık | Paket içinde belirsiz | Kalem kalem, gizli ücret yok |
| Sahiplik | Ajansa bağımlılık | Tüm dosyalar **sizin**, her an taşınabilir |

---

## 2. Bugüne Kadar Ne Yaptık? (Tamamlandı ✅)

### 2.1. Marka Kimliği
- **Logo kiti (11 varyant):** "Figür + Kanat" amblemi —
  - dikey logo, yatay logo, sadece amblem (128/256/512 px),
  - koyu zemin için ters varyantlar,
  - tek renk (forest / siyah / beyaz) varyantlar,
  - hepsi hem **SVG** (sonsuz büyütülebilir, baskıya hazır) hem **PNG** (saydam zemin).
- **Renk paleti (9 ton):** orman yeşili, koyu/açık yeşil, adaçayı tonları, sıcak krem,
  doğal beyaz — tek kaynaktan yönetilen tutarlı sistem.
- **Tipografi:** Başlık için Cormorant Garamond, gövde için Nunito — gerçek
  fontlarla, vektöre çevrilerek (her ortamda birebir aynı görünür).
- **Ses tonu + slogan:** "Güvenli Bir Bölgede Kendi Özüne Doğru."
- **Marka rehberi:** tüm kurallar `docs/marka-kimligi.md` dosyasında belgeli
  (kim isterse aynı çizgide üretim yapabilir).

### 2.2. Web Sitesi
- **Teknoloji:** Next.js 16 + React 19 — modern, hızlı, Google'ın sevdiği altyapı.
- **Bölümler:** Giriş (Hero), Hakkımızda, Hizmetler, Ekip (Melek Yıldız & Sacide Şahin),
  Randevu formu, Yazılar/Blog, İletişim, Footer.
- **Mobil uyumlu** (telefon/tablet/masaüstü), yumuşak kaydırma (scroll-reveal)
  animasyonları, sabit (sticky) üst menü, marka paletiyle bütünleşik tasarım.
- **Teknik kazanımlar:** favicon (sekme ikonu), sosyal paylaşım önizleme görseli (OG),
  otomatik `sitemap.xml` + `robots.txt`, doğru başlık hiyerarşisi, Türkçe arayüz.

### 2.3. Sosyal Medya Görsel Seti
- **Instagram (7 şablon):**
  - profil görseli (1080×1080), tanıtım/künye gönderisi, slogan/alıntı kartı,
    hizmetler kartı, 2 uzman kartı (foto eklenecek alanlı, 1080×1350), story (1080×1920).
- **LinkedIn (2 şablon):** kapak görseli (1584×396) + paylaşım görseli (1200×627).
- Hepsi marka fontu ve paletiyle; metin değişince **saniyeler içinde** yeniden üretilir.

### 2.4. Blog / Haberler Modülü
- Markdown tabanlı yazı sistemi; **3 başlangıç yazısı** hazır:
  - "Kaygı ile Başa Çıkmak", "Çocuklarda Duygusal Gelişim", "Sağlıklı İlişkiler".
- Her yazı için ayrı, Google'da indekslenebilir URL + SEO uyumu.

### 2.5. SEO / AIO Altyapısı
- Site **statik** üretildiği için içerik arama motorlarınca tam okunur
  (tek-sayfa uygulamalarındaki "Google göremiyor" sorunu **yok**).
- `robots.txt` ve `sitemap` otomatik; doğru başlık yapısı; sosyal önizleme görselleri.
- **AIO (Yapay Zeka Optimizasyonu):** içerik, ChatGPT/Gemini gibi motorların
  alıntılayabileceği "yanıt biçimli" yapıya hazırlanıyor (yol haritası Faz 4).

### 2.6. Yayınlama (Deploy) Sistemi
- **Otomatik akış:** GitHub'a yapılan her güncelleme, GoDaddy hostinginize
  FTP ile otomatik yüklenir (`.github/workflows/deploy-godaddy.yml`).
- Elle yükleme rehberi de hazır (`docs/godaddy-deploy-rehberi.md`).
- Site **Node.js sunucu gerektirmez** → hosting maliyeti minimumda kalır.

---

## 3. Teslim Edilen Dosyalar (Sizde Kalanlar)

- Tüm logo dosyaları (SVG + PNG, 11 varyant) — baskı ve dijital için hazır.
- Instagram (7) + LinkedIn (2) sosyal medya şablonları.
- Web sitesi kaynak kodu (GitHub'da, %100 sizin).
- Marka kimliği rehberi + deploy rehberi (dokümanlar).
- Sosyal paylaşım önizleme görseli (OG) + favicon.

---

## 4. Sırada Ne Var? (Planlanan / Üzerinde Konuşulan)

> Detaylı 4 fazlı yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md` (79 maddelik
> teknik SEO / yerel SEO / erişilebilirlik incelemesi).

- **Üçüncü renk / feminen dokunuş:** Talebiniz üzerine palete yumuşak bir aksan
  (uçuk pembe / vişne çürüğü tonu) ve girişteki krem zeminin biraz daha açık bir
  tonu değerlendirilecek. ✱ *(Üzerinde anlaşıldı — uygulanacak.)*
- **Gerçek içerik:** uzman fotoğrafları, gerçek telefon/adres, sosyal medya linkleri.
- **Çalışan randevu formu** + KVKK aydınlatma/açık rıza (sağlık verisi için zorunlu).
- **KVKK & Gizlilik Politikası** sayfaları.
- **Hizmet ve uzman detay sayfaları** (her biri ayrı indekslenebilir URL + SSS).
- Yerel SEO için işaretlemeler ("psikolog [ilçe]" aramalarında ve haritalarda görünürlük).

---

## 5. Güncel Fiyatlandırma (Haziran 2026)

> Aşağıdaki rakamlar **dostane / netleştirilecek** önerilerdir. Ajansın istediği
> 50.000 TL kurulum + 30.000 TL/ay'ın oldukça altında, kalem kalem şeffaftır.

### 5.1. Tek Seferlik — Kurulum (büyük kısmı tamamlandı)

| Kalem | Piyasa (ajans) | Bizim |
|---|---|---|
| Marka kimliği (logo kiti + palet + tipografi) | ~15.000 TL | dahil |
| Web sitesi tasarım + geliştirme | ~25.000 TL | dahil |
| Sosyal medya şablon seti (Instagram 7 + LinkedIn 2) | ~8.000 TL | dahil |
| Blog/Haberler modülü + 3 yazı | ~6.000 TL | dahil |
| SEO / AIO altyapısı | ~10.000 TL | dahil |
| Otomatik deploy sistemi | ~5.000 TL | dahil |
| **Toplam** | **~69.000 TL** | **20.000 TL** *(öneri)* |

> Bu paket size **kalıcı olarak** kalır; ajans modelindeki gibi "ayrılırsanız
> her şey gider" durumu yoktur. Tüm dosyalar ve kod sizindir.

### 5.2. Aylık — Sosyal Medya & Bakım (opsiyonel, isteğe bağlı)

| Paket | Kapsam | Aylık *(öneri)* |
|---|---|---|
| **Başlangıç** | Ayda ~4 gönderi tasarımı + site küçük güncellemeler | 4.000 TL |
| **Standart** | Ayda ~8 gönderi + 1 blog yazısı + story'ler + temel reklam yönetimi | 7.000 TL |
| **Pro** | Ayda ~12+ gönderi + 2 blog yazısı + reklam kampanya yönetimi + raporlama | 12.000 TL |

> Aylık paket **zorunlu değildir.** İsterseniz içerikleri siz hazırlayıp paylaşır,
> bizi sadece teknik güncellemeler için çağırırsınız. Esnek ilerleriz.

### 5.3. Yıllık Sabit Giderler (bize değil, 3. taraflara ödenir)

| Kalem | Kime | Tahmini Yıllık |
|---|---|---|
| Domain (alan adı) yenileme | GoDaddy | ~500–800 TL |
| Hosting yenileme | GoDaddy | değişken (paketinize göre) |
| **Reklam bütçesi** (Instagram/Facebook) | Meta'ya doğrudan | tamamen size kalmış |

> Web sitesi yazılımı tarafında **gizli/yıllık bir ücret yoktur.** Sitenin yıllık
> "ödemesi" dediğiniz şey yalnızca domain + hosting yenilemesidir — evet, cüzi
> miktardır.

---

## 6. Nasıl Çalışıyoruz? (Süreç)

1. **Bilgi/içerik sizden:** metin, fotoğraf, güncel bilgiler bana ulaşır.
2. **Tasarım/uygulama bende:** görseli hazırlar, siteye/sosyale işlerim.
3. **Onay sizde:** paylaşmadan önce gösteririm, onayınızla yayına alırız.
4. **Yayın otomatik:** site güncellemeleri otomatik sisteme düşer, anında canlıya çıkar.

---

## 7. Sıkça Sorulanlar (Mesajlardaki Sorularınız)

**“Instagram reklamları ücretli mi?”**
Organik (normal) gönderi paylaşmak **ücretsizdir.** "Reklam" dediğimiz, bir
gönderiyi para vererek daha geniş kitleye ulaştırmaktır; bu bütçe doğrudan
**Meta'ya (Instagram/Facebook)** ödenir, bize değil. Günlük 100–300 TL gibi
küçük bütçelerle bile başlanabilir; ne kadar harcayacağınıza siz karar verirsiniz.

**“Postları ben mi atıyorum, siz mi?”**
İki model var, hangisi rahatsa:
1. **Biz yönetiriz:** İçerikleri biz tasarlar ve planlarız, siz onaylarsınız, biz
   paylaşırız. (Aylık paket kapsamında.)
2. **Siz paylaşırsınız:** Bilgi/metni siz gönderirsiniz, biz görselini hazırlarız,
   siz kendi hesabınızdan paylaşırsınız.

**“Web sitesinin yıllık ödemesi var mı? Gizli bir şey var mı?”**
Hayır, gizli bir şey yok. Tek yıllık gider domain + hosting yenilemesidir (cüzi).
Statik site olduğu için pahalı sunucuya ihtiyaç yoktur. Kod ve içerik sizindir.

**“LinkedIn / Facebook de olacak mı?”**
Evet. LinkedIn için kapak + paylaşım görselleri **hazır.** Facebook, Instagram ile
aynı Meta hesabına bağlanır; aynı görseller ve reklamlar Facebook'ta da kullanılır.
İsterseniz kurumsal sayfaları birlikte kurarız.

---

## 8. Neden Bu Model Sizin İçin Avantajlı?

- **Şeffaf:** Her kalem ayrı yazılı; "30.000 TL'nin içinde ne var?" belirsizliği yok.
- **Sahiplik:** Marka, kod, görseller %100 sizin — istediğiniz an taşıyabilirsiniz.
- **Esnek:** Aylık taahhüt zorunlu değil; büyüdükçe paket büyütülür.
- **Sürdürülebilir:** Otomatik deploy sayesinde güncellemeler hızlı ve ucuz.
- **Bütçe dostu:** Aynı işler ajansın istediğinin oldukça altında.

---

*Sorularınız için her zaman müsaitim. Birlikte rahat rahat değerlendiririz. 🌿*
