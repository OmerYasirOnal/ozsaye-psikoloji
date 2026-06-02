@AGENTS.md

# Proje: Özsaye Psikoloji

Türkçe psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Marka adı **"Öz & Saye"**. Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Anasayfa (`/`) bölümleri hash-anchor ile bağlı (`#hakkimizda`, `#randevu` vb.). Ayrıca blog/haber route'ları: **`/blog`** (liste) ve **`/blog/[slug]`** (detay).

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript.
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- Marka paleti (globals.css token'ları — paletten sapma): forest `#2B5233`, cream `#F1EAD9`, sage `#92B594`, warm-white `#FDFBF7`. Fontlar: Cormorant Garamond (`font-display`, başlık + italik vurgu), Nunito (`font-body`).

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`. Test framework kurulu değil.

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`.
- Yapılanlar + teklif/kapsam dokümanı: `docs/teklif-ve-yapilanlar.md`.

### Blog / Haberler
- **Kanonik blog `/blog`**'tur (`content/blog/*.md` frontmatter + markdown; okuyucu `src/lib/blog.ts`). İkinci bir blog route'u (`/yazilar` vb.) **açma** — daha önce tekrar/çakışma yarattı.
- `draft: true` frontmatter'lı yazılar yayınlanmaz. Anasayfadaki "Yazılar" bölümü (`Articles.tsx`) en güncel 3 yazıyı gösterir ve `/blog`'a bağlanır.

### Sosyal medya otomasyonu (yerel)
- `tools/icerik-uretici/` — **Ollama (yerel LLM)** ile yayınlanan blog yazılarından Instagram/Facebook için Türkçe **taslak** (metin + marka görseli) üretir. **Otomatik yayın YOK**: taslaklar `taslaklar/` (gitignore'da) altına yazılır, elle paylaşılır. `--no-llm` yedeği ve `--watch` modu var. Kurulum: `tools/icerik-uretici/README.md`.
- Meta'ya (Instagram/Facebook) gerçek otomatik yayın **henüz yok**; İş hesabı + uygulama onayı + token gerektiren dış bir engel.

### CI / Deploy (GitHub Actions)
- `.github/workflows/ci.yml` — **PR ve main push'ta** `npm ci → lint → build`. Merge öncesi doğrulama buradan geçer.
- `.github/workflows/deploy-godaddy.yml` — **main push'ta** statik `out/`'u GoDaddy'ye **FTP** ile yükler. FTP başarısızlıkları (ör. `530`) genelde **secret/format** kaynaklıdır (`FTP_USERNAME` çoğunlukla `kullanıcı@alanadi.com` olmalı), kod değil.

### Statik export kuralları (`output: "export"`) — DİKKAT
- `robots.ts` ve `sitemap.ts` `export const dynamic = "force-static"` gerektirir.
- Dinamik route'lar `generateStaticParams()` ister; tüm yollar build'de üretiliyorsa `export const dynamicParams = false`.
- Next 16'da `params` artık **Promise** — `await params`.
- `next/image` `unoptimized: true`. Sunucu çalışmaz: API/Server Action/cookies/redirect yok.
- Header/Footer hash linkleri **mutlak** (`/#...`) tutulur ki alt route'lardan (ör. `/blog`) da çalışsın.

## Gözden geçirme (review) akışı — HER ZAMAN
Önemli bir değişiklik bitince ve **PR açmadan/merge etmeden önce**, sıfır bağlamlı
(fresh) bir Claude oturumuyla bağımsız review çalıştır:

1. `bash scripts/review.sh` → `review-rapor.md` üretir (main'e göre diff'i ayrı,
   önyargısız bir oturuma inceletir).
2. Rapordaki **Yüksek/Orta** öncelikli bulguları düzelt; ardından `npm run lint && npm run build`.
3. Gerekiyorsa review'i tekrar çalıştır.

Amaç, çalışan oturumun kör noktalarını yakalamaktır. `review-rapor.md` geçici
çıktıdır (repoya commit'lenmez; `.gitignore`'da).
