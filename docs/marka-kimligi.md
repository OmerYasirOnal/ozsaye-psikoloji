# Öz & Saye Psikoloji — Marka Kimliği Rehberi

Bu doküman markanın görsel temelini özetler: logo kullanımı, renkler, tipografi,
ses tonu ve hazır sosyal medya şablonları.

**Görsel üretici script'ler** (tümü `scripts/lib/brand.cjs` ortak kütüphanesini
kullanır; metin marka fontlarıyla **vektör yola** çevrilir, böylece çıktılar net
ve fontsuz ortamda da doğru görünür):

| Script | Üretir |
| --- | --- |
| `node scripts/generate-logo-kit.cjs` | `brand/logo/` — tüm logo varyantları (SVG + PNG) + `public/logo.png` |
| `node scripts/generate-instagram.cjs` | `brand/social/instagram/` — Instagram seti |
| `node scripts/generate-brand-assets.cjs` | `public/og.png` + `brand/social/linkedin-*.png` |

> **Ön koşul — marka fontları:** Script'ler Playfair Display (+ Italic) ve
> Montserrat fontlarını `BRAND_FONT_DIR` (varsayılan `/usr/share/fonts/brand/`)
> altında bekler. Kurulum için `bash scripts/setup-fonts.sh` çalıştırın; yerel/
> sudo'suz ortamda `BRAND_FONT_DIR=./.fonts bash scripts/setup-fonts.sh`. Türkçe
> karakter kapsamı tam variable TTF'ler iner. `opentype.js` devDependency'dir.

## 0. Marka Adı

Görünen marka adı **"Öz & Saye Psikoloji"**dir (wordmark: büyük serif **"Öz & Saye"** +
altında tracked **"PSİKOLOJİ"**). Kanonik alan adı **`ozsaye.com`**'dur; SEO
anahtar kelimelerinde hem "Öz & Saye" hem "Özsaye" varyantları tutulur.

## 1. Logo

Amblem; **kollarını yukarı açan figür** (kendi özüne doğru / iyi oluş) ve onu
çevreleyen **dört yapraktan** (iki adaçayı yeşili + iki soft pembe; büyüme/şefkat)
oluşur. Altında dikey kilit hâlinde **`Öz & Saye`** wordmark'ı ve **`PSİKOLOJİ`**
alt yazısı yer alır.

### Logo kiti (`brand/logo/final/`)

Onaylanan **final logo paketi — standart boyut** (`oz_saye_final_logo_pack_standard`)
raster (PNG/JPG) deliverable'lardan oluşur: kare (1:1) kilit, daha okunur/dengeli
oranda. Beyaz + saydam varyantlar (400–2048 px) + sosyal medya formatları. Kaynak
dosyalar `brand/logo/final/` altında versiyonlanır.

| Dosya (`brand/logo/final/`) | Açıklama |
| --- | --- |
| `logo_standard_1200_transparent.png` (400–2048) | Ana logo — saydam zemin (site/dijital) |
| `logo_standard_1200_white.png` / `.jpg` | Beyaz zeminli tam kilit |
| `site_icon_standard_512.png` | Kare site/app ikonu (sıkı kırpılmış) |
| `favicon_standard_16…256.png` | Favicon kademeleri |
| `open_graph_standard_1200x630.jpg` | Link önizleme |
| `instagram_profile_standard_1080.jpg`, `x_profile_standard_400.jpg`, `instagram_story_standard_*` | Sosyal medya formatları |
| `brand_palette.jpg` | Final renk paleti önizlemesi |

> `public/logo.png` bu paketin saydam ana logosundan; web için boşlukları
> kırpılıp (`-trim`) yüksekliğe göre optimize edilerek üretilir.
>
> Önceki sürümler `brand/archive/` altındadır: `logo-final-v1/` (ilk final paket)
> ve `eski-site-assetleri/` (ilk jenerik kit). Eski jenerik kit
> (`generate-logo-kit.cjs`, inline `LogoMark.tsx`, `public/logo-mark.svg`,
> `src/app/icon.svg`) artık kullanılmaz.

### Site / sistem varlıkları

| Dosya | Kullanım |
| --- | --- |
| `public/logo.png` | Tam logo kilidi (amblem + yazı), saydam. Header/Footer `next/image` ile gösterir; blog JSON-LD organizasyon logosu. |
| `src/app/icon.png` · `src/app/apple-icon.png` · `src/app/favicon.ico` | Tarayıcı sekmesi + Apple touch ikonu (beyaz zeminli). |
| `public/icon-192.png` · `public/icon-512.png` | PWA manifest ikonları (`purpose: any`). |
| `public/og.png` | Sosyal paylaşım önizleme görseli (1200×630). |

**Kurallar**
- Amblemin/kilidin etrafında en az amblem yüksekliğinin %25'i kadar boşluk bırakın.
- Logo raster ve çok renklidir — yeniden renklendirmeyin. Koyu zeminde okunması için
  logoyu warm-white/ivory bir yüzey (çip) üstüne koyun (footer'daki gibi).
- Logoyu sıkıştırmayın/eğmeyin, gölge/efekt eklemeyin.

## 2. Renk Paleti

| Token | HEX | Kullanım |
| --- | --- | --- |
| Forest (Orman Yeşili) | `#1F3B2E` | Ana marka rengi, başlık, mürekkep |
| Forest Dark | `#142A20` | Hover, derinlik |
| Forest Light | `#2F5A3B` | İkincil vurgu, bağlantı hover |
| Forest Muted | `#385440` | Gövde metni (WCAG AA, tüm zeminlerde ≥4.5:1) |
| Sage (Adaçayı) | `#A6B79B` | Yaprak, aksan, ayraç |
| Sage Light | `#C7D6C0` | Yumuşak aksan, forest zeminde ikincil metin |
| Sage Dark | `#7C9077` | İnce aksan |
| Soft Blush (Soft Pembe) | `#D8A7A5` | Logo aksanı; yalnızca ince aksan (metin değil) |
| Cream / Warm Ivory | `#F5F2EB` | Ana zemin |
| Cream Dark | `#E9E3D6` | Bölüm zemini / ince kenarlık |
| Stone (Taş) | `#DAD7CE` | Nötr ayraç / yüzey |
| Warm White (White) | `#FFFFFF` | Kart/yüzey, en parlak |

Renk tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlıdır — palet tek kaynaktan yönetilir.

## 3. Tipografi

- **Başlık / vurgu:** Playfair Display (`font-display`) — yüksek kontrastlı zarif serif, italik slogan vurgusu.
- **Gövde:** Montserrat (`font-body`) — modern, okunaklı geometrik sans-serif.

> Hem web sitesi hem de tüm PNG/SVG marka görselleri **gerçek Playfair Display
> ve Montserrat** ile üretilir. Görsel üretici script'ler metni vektör yola
> çevirdiği için çıktılar fontsuz ortamlarda bile birebir aynı görünür.

## 4. Ses Tonu

Sıcak, güven veren, sakin ve profesyonel. Patolojikleştirmeyen, yargısız,
kapsayıcı bir dil. Slogan: **"Güvenli Bir Bölgede Kendi Özüne Doğru."**

## 5. Sosyal Medya Şablonları

### Instagram (`brand/social/instagram/`) — `generate-instagram.cjs`

| Dosya | Boyut | Amaç |
| --- | --- | --- |
| `profil.png` | 1080×1080 | Profil fotoğrafı (sade amblem, koyu zemin) |
| `tanitim.png` | 1080×1080 | Genel tanıtım / kilit gönderisi |
| `alinti.png` | 1080×1080 | Slogan / alıntı kartı (koyu) |
| `hizmetler.png` | 1080×1080 | Hizmet listesi |
| `uzman-melek-yildiz.png` | 1080×1350 | Uzman kartı (fotoğraf yer tutuculu) |
| `uzman-sacide-sahin.png` | 1080×1350 | Uzman kartı (fotoğraf yer tutuculu) |
| `story.png` | 1080×1920 | Story / dikey paylaşım |

### LinkedIn (`brand/social/`) — `generate-brand-assets.cjs`

| Dosya | Boyut | Amaç |
| --- | --- | --- |
| `linkedin-kapak.png` | 1584×396 | LinkedIn kapak görseli |
| `linkedin-post.png` | 1200×627 | LinkedIn paylaşım görseli |

> Uzman kartlarındaki dairesel alan, baş harfler yerine gerçek vesikalık/portre
> fotoğrafıyla değiştirilmek üzere tasarlanmıştır.

Metni/şablonları değiştirmek için ilgili script'teki bölümü düzenleyip yeniden
çalıştırın. Ortak çizim mantığı `scripts/lib/brand.cjs` içindedir.
