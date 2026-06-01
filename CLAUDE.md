@AGENTS.md

# Proje: Özsaye Psikoloji

Türkçe psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Ana sayfa (`/`) bölümleri hash-anchor ile bağlı (`#hakkimizda`, `#randevu`, `#surec`, `#sss` vb.). Ayrıca gerçek alt route'lar: `/kvkk-aydinlatma-metni`, `/gizlilik-politikasi`, `/randevu/tesekkurler` (+ `not-found`). SEO dosya-konvansiyonları: `robots.ts`, `sitemap.ts`, `manifest.ts`, `opengraph-image.tsx`, `icon.tsx`.

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript.
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- **Merkezî config `src/lib/site.ts`** (`const site`): tüm NAP/kimlik/uzman/ücret verisi buradan; gerçek değerler `[DOLDUR]` placeholder (bkz. `docs/klinikten-gereken-veriler.md`). `site.dataReady` bayrağı `true` olmadan `JsonLd` (schema.org) yapısal veri **yayınlamaz** — placeholder NAP'i indekslenebilir veriye sızdırma.
- Randevu formu `useActionState` + Server Action `src/app/randevu/actions.ts` (Zod + honeypot + rate-limit + Resend; `RESEND_API_KEY` yoksa `console.info` fallback). Erişilebilirlik token'ı: `text-forest-muted` (govde metni AA), global `:focus-visible` + `.skip-link` globals.css'te.
- Marka paleti (globals.css token'ları — paletten sapma): forest `#2B5233`, cream `#F1EAD9`, sage `#92B594`, warm-white `#FDFBF7`. Fontlar: Cormorant Garamond (`font-display`, başlık + italik vurgu), Nunito (`font-body`).
- **Tasarım dili: "sakin botanik minimalizm" (sade/modern/ferah).** Boşluk birincil öğedir (`py-28 lg:py-36`, `max-w-6xl`). Yüzeyler 3 tane: warm-white (ana) · cream (alternatif ritim) · forest (vurgu: Randevu + Footer). **Renk disiplini (zorunlu):** metin yalnızca `text-forest` (başlık) + `text-forest-muted` (gövde); **opaklık-tabanlı metin rengi yasak** (`text-forest/NN`, `text-cream/NN`), metin olarak `text-sage`/`text-sage-dark` yasak; forest zeminde ikincil metin `text-sage-light`. `sage` yalnızca aksan (ince çizgi/ikon/işaret). Başlık başına en fazla 1 italik vurgu. Dekorasyon minimal — yüzen yaprak/grain/gradient ayraç **kullanma**; en fazla tek ince sage hairline veya Hero'daki tek filiz motifi. Hover tek-özellikli/sakin.

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`. Test framework kurulu değil.

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`. **Durum:** Faz 1–3 (veri gerektirmeyen kod) uygulandı; Faz 4 (içerik mimarisi — `/hizmetler/[slug]`, `/ekip/[slug]`, MDX blog) bekliyor.
- Yayın öncesi klinikten doldurulması gereken gerçek veriler (örnekli checklist): `docs/klinikten-gereken-veriler.md`.
