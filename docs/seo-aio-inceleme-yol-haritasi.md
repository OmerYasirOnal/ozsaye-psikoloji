# Özsaye Psikoloji — SEO / AIO / Tasarım İnceleme ve Yol Haritası

> Tarih: 2026-05-30 · Kapsam: 7 boyutlu çok-ajanlı inceleme (teknik SEO, yerel SEO/E-E-A-T, AIO/GEO, tasarım/UX, erişilebilirlik WCAG 2.2 AA, performans/CWV, mimari) · 79 bulgu.
> Durum: **Rapor teslim edildi, uygulama ertelendi.** Bu doküman uygulamaya başlandığında referans olarak kullanılacaktır.

---

## Genel Değerlendirme

**Güçlü temel:** Tutarlı marka kimliği (forest/cream/sage paleti, Cormorant + Nunito tipografisi, scroll-reveal animasyonları), doğru server/client sınırları (yalnızca `Header`, `AppointmentForm`, `ScrollReveal` `"use client"`), statik SSG sayesinde içerik indekslenebilir (SPA client-render SEO sorunu **yok**), doğru başlık hiyerarşisi, düzgün `prefers-reduced-motion` bloğu.

**Eksik katmanlar (YMYL kliniği için kritik):** güven, bulunabilirlik, işlevsellik.

### En kritik 5 risk

| # | Risk | Kanıt |
|---|------|-------|
| 1 | **Randevu formu sahte** — hiçbir yere veri göndermiyor | `AppointmentForm.tsx:8-12` sadece `setTimeout`; input'larda `name` yok; backend yok |
| 2 | **KVKK ihlali** — sağlık verisi topluyor, aydınlatma/açık rıza yok | Form ad/tel/e-posta/mesaj topluyor; KVKK & Gizlilik linkleri `href="#"` (`Footer.tsx:182-193`) |
| 3 | **Bulunabilirlik altyapısı sıfır** | JSON-LD, `metadataBase`, canonical, OG, `robots.ts`, `sitemap.ts` yok |
| 4 | **Sahte NAP + placeholder görseller** | Telefon `+90 (5XX) XXX XX XX`, adres "İstanbul, Türkiye", harita & tüm görseller yer tutucu |
| 5 | **WCAG 2.2 AA ihlalleri** | Form `htmlFor`/`id`/`name` bağı yok; `text-forest/40-70` kontrast 4.5:1 altında; mobil menüde aria/focus trap/ESC yok |

---

## Boyut Boyut Bulgular

### 1. Teknik SEO (Next.js 16)
- `metadataBase` yok (kritik) → OG/canonical relative URL çözülemez, build hatası riski.
- `alternates.canonical`, `openGraph`, `twitter` eksik; `keywords` değersiz (sil).
- `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image`, `icon/apple-icon` — hiçbiri yok.
- `themeColor` için ayrı `viewport` export gerekli (Next 14+ ile metadata'dan ayrıldı).
- `title.template` yapısına geç.

### 2. Yerel SEO & E-E-A-T (YMYL)
- `MedicalBusiness` + `Person` JSON-LD yok (kritik) — yerel pakette görünmüyor.
- Uzmanlarda diploma/üniversite/üyelik (TPD)/`sameAs` gibi doğrulanabilir kimlik sinyalleri yok.
- NAP tutarsız/sahte; `tel:`/`mailto:` yok; `openingHoursSpecification` makine-okunur değil.

### 3. AIO / GEO
- FAQ/soru-cevap bölümü yok (kritik) — AI motorlarının en çok alıntıladığı format.
- İçerik "yanıt biçimli" değil (net tanım, çıkarılabilir gerçek, özet kutusu yok).
- `llms.txt` yok (düşük öncelik — Google desteklemiyor; ucuz ekstra).

### 4. Tasarım / Görsel / UX
- Gerçek görsel yok (kritik) — `next/image` hiç kullanılmamış; uzman portreleri en güçlü dönüşüm sinyali.
- Eksik bölümler: "Süreç Nasıl İşliyor?", FAQ, ücret/şeffaflık, gerçek harita.
- Mobilde sabit (sticky) birincil CTA yok.
- Danışan görüşleri **TPD etik sınırları** içinde (isimsiz, onaylı, abartısız) eklenmeli.

### 5. Erişilebilirlik (WCAG 2.2 AA)
- Form `htmlFor`/`id`/`name` bağı yok; kontrast sistematik eşik altında; odak halkası (sage) 3:1'i karşılamıyor.
- Skip-link yok; dekoratif SVG'lerde `aria-hidden` yok; mobil menüde focus yönetimi yok.

### 6. Performans & Core Web Vitals
- Variable font yerine ~10 ayrı statik ağırlık indiriliyor → `weight` dizilerini sil (en yüksek etkili düzeltme).
- `italic` kullanılıyor ama loader'da tanımsız → faux italic; `style: ['normal','italic']` ekle.
- Vercel Speed Insights/Analytics yok.

### 7. Mimari & İşlevsel Boşluklar
- Tek route + hash-anchor → her hizmet/yazı/uzman ayrı indekslenebilir URL olamıyor.
- Form backend yok; blog placeholder; 404 ve onay sayfası yok; uzman profil sayfaları yok.
- **Önerilen route haritası:** `/`, `/hizmetler[/slug]`, `/yazilar[/slug]`, `/ekip/[slug]`, `/iletisim`, `/randevu` + `/randevu/tesekkurler`, `/kvkk-aydinlatma-metni`, `/gizlilik-politikasi`, `not-found.tsx`.

---

## Adım Adım Yol Haritası

İşaretler: 🤖 = kod-içi, hemen yapılabilir · 👤 = gerçek veri/karar gerekiyor · (S/M/L) = iş yükü.

### Faz 1 — Kritik Altyapı & Hızlı Güven Kazanımları `P0`
> `metadataBase` ve merkezi NAP kaynağı sonraki tüm JSON-LD/OG/route işlerinin önkoşulu.

1. 🤖 `layout.tsx`: `metadataBase` + `alternates.canonical: '/'`; `keywords`'ü sil. (S)
2. 🤖 Ayrı `viewport` export (`themeColor: '#2B5233'`), `title.template`, `<html dir="ltr">`. (S)
3. 🤖 `robots.ts` + `sitemap.ts`. (S)
4. 👤 NAP merkezi kaynağı `src/lib/site.ts` (gerçek adres/telefon/e-posta) → `Contact` + `Footer`; `tel:`/`mailto:`. (S)
5. 🤖+👤 `page.tsx`'e `MedicalBusiness` + 2× `Person` JSON-LD (`site.ts`'ten). (M)
6. 🤖 `openGraph` + `twitter` metadata + `opengraph-image.tsx` (1200×630). (M)
7. 🤖 Font: `weight` dizilerini kaldır (variable) + Cormorant'a `style: ['normal','italic']`. (S)
8. 🤖 `AppointmentForm`: `htmlFor`/`id`/`name`/`autoComplete`, placeholder kontrastı. (S)
9. 🤖+👤 `/kvkk-aydinlatma-metni` + `/gizlilik-politikasi` sayfaları; Footer linklerini bağla; sosyal `#` → gerçek URL. (M)

### Faz 2 — İşlevsellik: Çalışan Randevu Akışı & KVKK Rızası `P0`
1. 🤖 `src/app/randevu/actions.ts` → `'use server'` Server Action + React 19 `useActionState`; Zod, honeypot, rate-limit. (M)
2. 🤖 Zorunlu KVKK açık rıza checkbox'ı; rıza zaman damgası/IP sakla; hassas veri uyarısı. (S)
3. 🤖+👤 Resend e-posta bildirimi (API key) → `redirect('/randevu/tesekkurler')`; `not-found.tsx`. (M)
4. 🤖 Başarı mesajına `role="status"` + odak taşıma; 4 sn otomatik sıfırlamayı kaldır. (S)

### Faz 3 — Erişilebilirlik (WCAG 2.2 AA) & Görsel Güven `P1`
1. 🤖 Kontrast: `forest/40-70` → tam-opaklık / test edilmiş `forest-muted`; Footer cream ≥`/80`. (M)
2. 🤖 Global `:focus-visible` (forest); mobil menüye `aria-expanded`, focus trap, ESC. (M)
3. 🤖 Skip-link + `<main id>`; dekoratif SVG'lere `aria-hidden`; `<nav>` aria-label; reduced-motion'a `animate-bounce`/`scroll-behavior`. (M)
4. 👤 Gerçek fotoğraflar (`next/image` statik import → CLS=0): uzman portreleri → ofis → Hero. (M)
5. 🤖 Mobil sticky "Online Randevu Al" + "Süreç Nasıl İşliyor?" + `<details>` FAQ + şeffaf ücret. (M)
6. 👤+🤖 Gerçek gömülü harita (lazy iframe) + JSON-LD `geo`; `@vercel/speed-insights` + `analytics`. (S)

### Faz 4 — İçerik Mimarisi & Derin SEO/AIO `P1–P2`
1. 🤖 `Services`/`Articles` dizilerini `src/lib/services.ts`'e taşı; ölü `#` linkleri gerçek `next/link` route'larına. (M)
2. 🤖+👤 `/hizmetler/[slug]` (8) + `/ekip/[slug]` (2): `generateStaticParams` + `generateMetadata`, 600+ kelime içerik, FAQPage + Service + Person JSON-LD. (L)
3. 🤖+👤 `@next/mdx` blog: `src/content/yazilar/*.mdx`, `/yazilar[/slug]`, `BlogPosting` JSON-LD + yazar atfı. İçerik planı: 5 kategori kümesi (1 pillar + 3-4 destek). (L)
4. 🤖 İçeriği "yanıt biçimli" formata çevir ("X nedir + kimler için + nasıl ilerler"), özet kutuları, long-tail başlıklar. (M)
5. 🤖+👤 Olgunlaştıkça Cal.com slot rezervasyonu (2 uzman için ayrı event type); `public/llms.txt`. (M)

---

## Uygulama Öncesi Klinikten Gereken Veri
- Gerçek telefon + tam açık adres (sokak/mahalle/ilçe/il/posta kodu)
- Sosyal medya profil URL'leri (Instagram, LinkedIn)
- Uzman fotoğrafları + ofis/danışma odası görselleri
- Uzman kimlik bilgileri: üniversite, lisans/yüksek lisans, sertifikalar, meslek örgütü üyeliği (TPD vb.)
- Resend (veya tercih edilen e-posta servisi) API key + doğrulanmış domain
- Seans ücret/süre bilgisi (şeffaflık bölümü için)

## Teknik Notlar
- **Next.js 16 dokümanları** `node_modules/next/dist/docs/01-app` altından okunmalı (AGENTS.md uyarısı): `params` artık `Promise`, Server Actions + `useActionState`, metadata dosya konvansiyonları bu sürüme özgü.
- **schema.org:** Net bir `Psychologist` *tipi* yok → `MedicalBusiness`/`MedicalClinic` + `Person` + `medicalSpecialty: Psychiatric`. Rich Results Test / validator.schema.org ile doğrula.
- Sahte NAP'i JSON-LD'ye taşımak yerel SEO'ya **zarar verir** — gerçek veri gelmeden JSON-LD'de placeholder kullanma.
