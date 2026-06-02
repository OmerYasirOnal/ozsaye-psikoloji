@AGENTS.md

# Proje: Öz & Saye Psikoloji

Türkçe psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Marka adı **"Öz & Saye"**. Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Ana sayfa (`/`) bölümleri hash-anchor ile bağlı (`#hakkimizda`, `#randevu`, `#surec`, `#sss` vb.). Ayrıca gerçek alt route'lar: `/hizmetler` + `/hizmetler/[slug]` (8, SSG), `/ekip` + `/ekip/[slug]` (2, SSG), **`/blog` + `/blog/[slug]`** (markdown blog, SSG), `/kvkk-aydinlatma-metni`, `/gizlilik-politikasi`, `/randevu/tesekkurler` (+ `not-found`). SEO dosya-konvansiyonları: `robots.ts`, `sitemap.ts`, `manifest.ts`, `icon.svg`, `og.png`.

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript. **Statik export** (`output: "export"` → `out/`; GoDaddy paylaşımlı hosting'e FTP).
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- **Merkezî config `src/lib/site.ts`** (`const site`): tüm NAP/kimlik/uzman/ücret verisi buradan; gerçek değerler `[DOLDUR]` placeholder (bkz. `docs/klinikten-gereken-veriler.md`). `site.dataReady` bayrağı `true` olmadan `JsonLd` (schema.org) yapısal veri **yayınlamaz** ve site `robots` ile **noindex** kalır — placeholder NAP'i indekslenebilir veriye sızdırma.
- **Randevu formu statik export'ta Server Action KULLANMAZ.** Form `public/randevu.php`'ye POST eder; PHP doğrular (ad/telefon/e-posta/uzman/kvkk), honeypot + e-posta başlık-enjeksiyonu koruması yapar, KVKK rızasını `randevu-kayitlari.log`'a yazar (`.htaccess` ile erişime kapalı), `info@ozsaye.com`'a e-posta gönderir ve `/randevu/tesekkurler/`'e yönlendirir. Erişilebilirlik token'ı: `text-forest-muted` (gövde metni AA), global `:focus-visible` + `.skip-link` globals.css'te.
- **Chrome (Header/Footer/StickyCta) kök layout'ta** (`src/app/layout.tsx`) — tüm sayfalarda ortak; sayfalar kendi Header/Footer'ını render **etmez**. Ana-sayfa-bölümü anchor'ları **kök-göreli** + `next/link` (`/#randevu` vb.), aksi halde alt sayfalardan çalışmaz + lint hatası verir. Placeholder gizleme tek noktadan: `isReady(value)` (`src/lib/site.ts`) — `[DOLDUR]`/boş değerler arayüzde gizlenir veya "yakında" fallback, JSON-LD'ye sızmaz.
- Marka paleti (globals.css token'ları — paletten sapma): forest `#23472E`, cream `#F3EFE6`, sage `#A7BFA7`, warm-white `#FAF7F1`, stone `#DAD7CE`. Fontlar: Playfair Display (`font-display`, başlık + italik vurgu), Montserrat (`font-body`). Marka rehberi: `brand/marka-rehberi.png` + `docs/marka-kimligi.md`.
- **Tasarım dili: "sakin botanik minimalizm" (sade/modern/ferah).** Boşluk birincil öğedir (`py-28 lg:py-36`, `max-w-6xl`). Yüzeyler 3 tane: warm-white (ana) · cream (alternatif ritim) · forest (vurgu: Randevu + Footer). **Renk disiplini (zorunlu):** metin yalnızca `text-forest` (başlık) + `text-forest-muted` (gövde); **opaklık-tabanlı metin rengi yasak** (`text-forest/NN`, `text-cream/NN`), metin olarak `text-sage`/`text-sage-dark` yasak; forest zeminde ikincil metin `text-sage-light`. `sage` yalnızca aksan (ince çizgi/ikon/işaret). Başlık başına en fazla 1 italik vurgu. Dekorasyon minimal — yüzen yaprak/grain/gradient ayraç **kullanma**; en fazla tek ince sage hairline veya Hero'daki tek filiz motifi. Hover tek-özellikli/sakin.

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`. Test framework kurulu değil.

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`.
- Yayın öncesi klinikten doldurulması gereken gerçek veriler (örnekli checklist): `docs/klinikten-gereken-veriler.md`. **Kalan:** gerçek veri girişi → `site.dataReady=true`; GoDaddy'de PHP `mail()` teslim doğrulaması.
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
- `next/image` `unoptimized: true`. Sunucu çalışmaz: API/Server Action/cookies/redirect yok (form bu yüzden `public/randevu.php`).
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

Ayrıca CI'da otomatik çalışır: `.github/workflows/claude-review.yml` her PR'da
bağımsız review yapıp bulgularını yorum olarak ekler. Kimlik doğrulama kurulu
Claude GitHub App (OIDC) ile yapılır; ayrı secret gerekmez. Yerel `review.sh`
ile CI Action birbirini tamamlar.
