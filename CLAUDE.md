@AGENTS.md

# Proje: Özsaye Psikoloji

Türkçe psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Anasayfa (`/`) bölümleri hash-anchor ile bağlı (`#hakkimizda`, `#randevu` vb.). Ayrıca blog/haber route'ları: `/yazilar` (liste) ve `/yazilar/[slug]` (detay).

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript.
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- Marka paleti (globals.css token'ları — paletten sapma): forest `#2B5233`, cream `#F1EAD9`, sage `#92B594`, warm-white `#FDFBF7`. Fontlar: Cormorant Garamond (`font-display`, başlık + italik vurgu), Nunito (`font-body`).

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`. Test framework kurulu değil.

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`.
- Blog/haber altyapısı: yazılar `content/yazilar/*.md` (frontmatter + markdown), `src/lib/blog.ts` build sırasında okur; statik export için `generateStaticParams` + `dynamicParams=false`.
- Otomatik içerik & çok platformlu yayın (Ollama + Instagram/Facebook/web): `automation/` (ayrı Node projesi), mimari `docs/otomatik-icerik-sistemi.md`. `automation/` kök lint/build'in dışındadır (eslint ignore + tsconfig exclude).
