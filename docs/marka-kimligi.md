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

Amblem; **açık dairesel halka** (güvenli bölge / açılım) içinde **kollarını
yukarı açan figür** (kendi özüne doğru) ve onu **kucaklayan iki yapraktan**
(büyüme/şefkat) oluşur.

### Logo kiti (`brand/logo/`)

`generate-logo-kit.cjs` ile üretilen, baskı/dijital için hazır tam set. SVG'ler
vektör (metin outline → font gerektirmez), PNG'ler saydam zeminli yüksek çözünürlük.

| Dosya (svg + png) | Açıklama |
| --- | --- |
| `ozsaye-logo` | Ana logo — dikey (amblem üstte, wordmark altta) |
| `ozsaye-logo-yatay` | Yatay logo |
| `ozsaye-amblem` (+128/256/512) | Sadece amblem |
| `ozsaye-logo-ters`, `...-yatay-ters`, `ozsaye-amblem-ters` | Koyu zemin için (cream mürekkep) |
| `ozsaye-logo-mono-forest` / `-siyah` / `-beyaz` | Tek renk varyantlar |
| `ozsaye-logo-overview.png` | Tüm varyantların önizleme tablosu |

### Site / sistem varlıkları

| Dosya | Kullanım |
| --- | --- |
| `src/components/LogoMark.tsx` | Site içi amblem (inline SVG). "Mürekkep" öğeleri `currentColor` — açık zeminde forest, koyu zeminde cream. |
| `public/logo-mark.svg` | Statik vektör amblem (dış kullanım, e-imza vb.). |
| `public/logo.png` | Yatay tam logo kilidi (amblem + yazı). Sunum, antet, kartvizit. |
| `src/app/icon.svg` · `src/app/favicon.ico` | Tarayıcı sekmesi ikonu. |
| `public/og.png` | Sosyal paylaşım önizleme görseli (1200×630). |

**Kurallar**
- Amblemin etrafında en az amblem yüksekliğinin %25'i kadar boşluk bırakın.
- Açık zeminde forest, koyu/forest zeminde cream mürekkep kullanın; yapraklar her zaman sage tonlarında.
- Logoyu sıkıştırmayın/eğmeyin, paletten farklı renge boyamayın, gölge/efekt eklemeyin.

## 2. Renk Paleti

| Token | HEX | Kullanım |
| --- | --- | --- |
| Forest (Orman Yeşili) | `#23472E` | Ana marka rengi, başlık, mürekkep |
| Forest Dark | `#17311F` | Hover, derinlik |
| Forest Light | `#2F5A3B` | İkincil vurgu |
| Forest Muted | `#3D5C45` | Gövde metni (WCAG AA, tüm zeminlerde ≥5:1) |
| Sage (Adaçayı) | `#A7BFA7` | Yaprak, aksan, ayraç |
| Sage Light | `#C2D4C2` | Yumuşak aksan, forest zeminde ikincil metin |
| Sage Dark | `#7E9E80` | İnce aksan |
| Cream (Sıcak Krem) | `#F3EFE6` | Ana zemin |
| Cream Dark | `#E6DFCD` | Bölüm zemini |
| Stone (Taş) | `#DAD7CE` | Nötr ayraç / yüzey |
| Warm White | `#FAF7F1` | Kart/yüzey |

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
