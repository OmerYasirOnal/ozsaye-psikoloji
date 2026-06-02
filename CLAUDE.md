@AGENTS.md

# Proje: Özsaye Psikoloji

Türkçe tek sayfa (tek route `/`) psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Bölümler hash-anchor ile bağlı (`#hakkimizda`, `#randevu` vb.) — gerçek alt route yok.

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript.
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- Marka paleti (globals.css token'ları — paletten sapma): forest `#2B5233`, cream `#F1EAD9`, sage `#92B594`, warm-white `#FDFBF7`. Fontlar: Cormorant Garamond (`font-display`, başlık + italik vurgu), Nunito (`font-body`).

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`. Test framework kurulu değil.

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`.

## Gözden geçirme (review) akışı — HER ZAMAN
Önemli bir değişiklik bitince ve **PR açmadan/merge etmeden önce**, sıfır bağlamlı
(fresh) bir Claude oturumuyla bağımsız review çalıştır:

1. `bash scripts/review.sh` → `review-rapor.md` üretir (main'e göre diff'i ayrı,
   önyargısız bir oturuma inceletir).
2. Rapordaki **Yüksek/Orta** öncelikli bulguları düzelt; ardından `npm run lint && npm run build`.
3. Gerekiyorsa review'i tekrar çalıştır.

Amaç, çalışan oturumun kör noktalarını yakalamaktır. `review-rapor.md` geçici
çıktıdır (repoya commit'lenmez; `.gitignore`'da).
