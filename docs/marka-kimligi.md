# Öz & Saye Psikoloji — Marka Kimliği Rehberi

Bu doküman markanın görsel temelini özetler: logo kullanımı, renkler, tipografi,
ses tonu ve hazır sosyal medya şablonları. Görsel üretici script:
`scripts/generate-brand-assets.cjs` (`node scripts/generate-brand-assets.cjs`) —
hem site varlıklarını (`public/og.png`, `public/logo.png`) hem de
`brand/social/` altındaki şablonları üretir.

## 0. Marka Adı

Görünen marka adı **"Öz & Saye Psikoloji"**dir (wordmark: büyük serif **"Öz & Saye"** +
altında tracked **"PSİKOLOJİ"**). Alan adı tek kelime `ozsayepsikoloji.com` olarak
kalır; SEO anahtar kelimelerinde hem "Öz & Saye" hem "Özsaye" varyantları tutulur.

## 1. Logo

Amblem; **dairesel çerçeve** (güvenli bölge) içinde **kollarını açan figür**
(kendi özüne doğru), üstte **yaprak kanopisi** (büyüme/şefkat) ve altta
**nilüfer tabanından** (köklenme) oluşur.

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
| Forest | `#2B5233` | Ana marka rengi, başlık, mürekkep |
| Forest Dark | `#1E3A24` | Hover, derinlik |
| Forest Light | `#3A6B45` | İkincil vurgu |
| Sage | `#92B594` | Yaprak, aksan, ayraç |
| Sage Light | `#AFC6B0` | Yumuşak aksan |
| Sage Dark | `#7A9E7C` | Üst başlık, ince metin |
| Cream | `#F1EAD9` | Ana zemin |
| Cream Dark | `#E5D9C3` | Bölüm zemini |
| Warm White | `#FDFBF7` | Kart/yüzey |

Renk tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlıdır — palet tek kaynaktan yönetilir.

## 3. Tipografi

- **Başlık / vurgu:** Cormorant Garamond (`font-display`) — zarif serif, italik slogan vurgusu.
- **Gövde:** Nunito (`font-body`) — yumuşak, okunaklı sans-serif.

> Not: PNG marka görselleri, sunucuda Cormorant bulunmadığından serif benzeri sistem fontuyla üretilir. Web sitesinde gerçek Cormorant/Nunito kullanılır.

## 4. Ses Tonu

Sıcak, güven veren, sakin ve profesyonel. Patolojikleştirmeyen, yargısız,
kapsayıcı bir dil. Slogan: **"Güvenli Bir Bölgede Kendi Özüne Doğru."**

## 5. Sosyal Medya Şablonları (`brand/social/`)

| Dosya | Boyut | Amaç |
| --- | --- | --- |
| `instagram-duyuru.png` | 1080×1080 | Genel duyuru / tanıtım gönderisi |
| `instagram-alinti.png` | 1080×1080 | Slogan / alıntı kartı (koyu) |
| `instagram-hizmetler.png` | 1080×1080 | Hizmet listesi |
| `instagram-story.png` | 1080×1920 | Story / dikey paylaşım |
| `instagram-avatar.png` | 320×320 | Profil fotoğrafı |
| `uzman-melek-yildiz.png` | 1080×1350 | Uzman tanıtım kartı (fotoğraf yer tutuculu) |
| `uzman-sacide-sahin.png` | 1080×1350 | Uzman tanıtım kartı (fotoğraf yer tutuculu) |
| `linkedin-kapak.png` | 1584×396 | LinkedIn kapak görseli |
| `linkedin-post.png` | 1200×627 | LinkedIn paylaşım görseli |

> Uzman kartlarındaki dairesel alan, baş harfler yerine gerçek vesikalık/portre
> fotoğrafıyla değiştirilmek üzere tasarlanmıştır.

Şablonları çoğaltmak / metnini değiştirmek için `scripts/generate-brand-assets.cjs`
içindeki ilgili bölümü düzenleyip script'i yeniden çalıştırın.
