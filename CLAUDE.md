@AGENTS.md

# Proje: Öz & Saye Psikoloji

Türkçe psikoloji kliniği tanıtım sitesi; tüm arayüz metni Türkçe (`<html lang="tr">`). Marka adı **"Öz & Saye"**. Uzmanlar: Psk. Dan. Melek Yıldız, Kl. Psk. Sacide Şahin. Ana sayfa (`/`) bölümleri hash-anchor ile bağlı (`#hakkimizda`, `#randevu`, `#surec`, `#sss` vb.). Ayrıca gerçek alt route'lar: `/hizmetler` + `/hizmetler/[slug]` (8, SSG), `/ekip` + `/ekip/[slug]` (2, SSG), **`/blog` + `/blog/[slug]`** (markdown blog, SSG), `/kvkk-aydinlatma-metni`, `/gizlilik-politikasi`, `/randevu/tesekkurler` (+ `not-found`). SEO dosya-konvansiyonları: `robots.ts`, `sitemap.ts`, `manifest.ts`, `icon.png`/`apple-icon.png`/`favicon.ico`, `og.png`.

## Stack & konvansiyonlar
- Next.js 16 App Router + React 19 + Tailwind v4 + TypeScript. **Sunucu modu** (Faz 0'da statik export — `output: "export"` → `out/` — KALDIRILDI; artık Server Actions/route handler/`cookies()`/DB mümkün). **CANLI: `ozsaye.com` 2026-07-09'dan beri Vercel'de** (proje `ozsaye-psikoloji`; DNS GoDaddy'de kaldı, yalnız web kayıtları Vercel'i gösterir — **MX/M365 e-postası el değmedi**). Prod altyapı: Neon Postgres (Frankfurt, pooled) · Resend (`bildirim.ozsaye.com`, gönderen `randevu@bildirim.ozsaye.com`) · Vercel Blob · Vercel Cron (`/api/cron/purge-requests/`, `CRON_SECRET`). **DİKKAT: repo Vercel Git entegrasyonuna bağlı — main'e merge otomatik production deploy'dur.** Prod env listesi: `docs/vercel-deploy-rehberi.md`.
- Tailwind v4 CSS-first: tema tokenları `src/app/globals.css` içinde `@theme inline` ile tanımlı — `tailwind.config` dosyası **yok**.
- Bileşenler `src/components/` altında; varsayılan Server Component, yalnızca etkileşim gerektiğinde `"use client"`. Path alias `@/*` → `src/*`.
- **Merkezî config `src/lib/site.ts`** (`const site`): tüm NAP/kimlik/uzman/ücret verisi buradan; gerçek değerler `[DOLDUR]` placeholder (bkz. `docs/klinikten-gereken-veriler.md`). `site.dataReady` bayrağı `true` olmadan `JsonLd` (schema.org) yapısal veri **yayınlamaz** ve site `robots` ile **noindex** kalır — placeholder NAP'i indekslenebilir veriye sızdırma.
- **Randevu formu (sunucu modu):** form artık Server Action (`src/app/randevu/actions.ts`) — **kamusal**, bilinçli olarak `verifySession` KULLANMAZ (randevu herkese açık). Akış: talebi `appointment_requests` tablosuna yazar (KVKK rızası zaman+IP damgalı: `consentAt`/`consentIp`; talep e-posta gitmese bile KAYBOLMAZ — önce DB'ye yaz, sonra bildirim try/catch içinde) → ilgili staff'a bildirim (dev: konsol `[DEV randevu-bildirim]`, prod: Resend; `farketmez` → iki uzmana, aksi halde seçilen uzmana; Reply-To = hasta e-postası). Korumalar (statik dönemin `randevu.php`'sinin birebir devamı, hiçbiri panel oturumu gerektirmez): honeypot (gizli `website`, sessiz-başarı) + zod (kullanıcıya-görünür hata metinleri eski `randevu.php`'den birebir taşındı → `src/lib/randevu.ts`) + IP başına 30 dk / 5 talep hız limiti. **Panel talep yönetimi YAYINDA (Faz 4):** `/panel/talepler` liste (durum filtreli; uzman kendi + "farketmez" havuzunu görür) + `[id]` detay (durum/planlanan tarih/iç not + hızlı iletişim tel/WhatsApp/mailto); IDOR koruması veri katmanında (`kapsamKosulu`, `src/lib/talepler-db.ts`). Uzman bir talebi durumu **"Planlandı" + tarih** yapınca hastaya otomatik Türkçe bilgilendirme e-postası gider (tarih değişince yeniden; yalnız iç not düzenlemesi mail üretmez) — `sendHastaPlanlandi` → SAF `hastaPlanlandiMetni` (ilk ad + tarih; uzman/telefon/adres yok), Reply-To=info@; mail düşse bile DB güncellemesi ayakta kalır (sakin uyarı). Eski GoDaddy statik sitesi/PHP formu cutover'la erişimden kalktı (DNS Vercel'de); Apache-dönemi artıkları repo'dan zaten silinmişti. Erişilebilirlik token'ı: `text-forest-muted` (gövde metni AA), global `:focus-visible` + `.skip-link` globals.css'te.
- **Chrome (Header/Footer/StickyCta) kök layout'ta** (`src/app/layout.tsx`) — pazarlama sayfalarının tümünde ortak; sayfalar kendi Header/Footer'ını render **etmez**. **İstisna: `/panel/**` (uzman paneli)** bu kabuğu almaz — `src/components/SiteChrome.tsx` (client, `usePathname()`) pathname `/panel` ile başlıyorsa Header/Footer/StickyCta'yı hiç render etmez; kök layout'un sabit-konumlu genel Header'ı panelin kendi header'ının üstüne binip tıklamaları engelliyordu. `Footer` (sunucu bileşeni) client bundle'a çekilmesin diye `SiteChrome`'a hazır node ("slot") olarak geçirilir, içeride import edilmez. Ana-sayfa-bölümü anchor'ları **kök-göreli** + `next/link` (`/#randevu` vb.), aksi halde alt sayfalardan çalışmaz + lint hatası verir. Placeholder gizleme tek noktadan: `isReady(value)` (`src/lib/site.ts`) — `[DOLDUR]`/boş değerler arayüzde gizlenir veya "yakında" fallback, JSON-LD'ye sızmaz.
- Marka paleti (final logo renkleri; globals.css token'ları — paletten sapma): forest `#1F3B2E`, cream/ivory `#F5F2EB`, sage `#A6B79B`, soft-blush `#D8A7A5` (aksan), warm-white `#FFFFFF`, stone `#DAD7CE`. Logo varlıkları raster (PNG) ve `brand/logo/final/` altında; Header/Footer logoyu `next/image` ile (`public/logo.png`) gösterir, footer'da koyu zeminde okunması için warm-white yuvarlak çip içinde. Fontlar: Playfair Display (`font-display`, başlık + italik vurgu), Montserrat (`font-body`). Marka rehberi: `brand/marka-rehberi.png` + `docs/marka-kimligi.md`.
- **Tasarım dili: "sakin botanik minimalizm" (sade/modern/ferah).** Boşluk birincil öğedir (`py-28 lg:py-36`, `max-w-6xl`). Yüzeyler 3 tane: warm-white (ana) · cream (alternatif ritim) · forest (vurgu: Randevu + Footer). **Renk disiplini (zorunlu):** metin yalnızca `text-forest` (başlık) + `text-forest-muted` (gövde); **opaklık-tabanlı metin rengi yasak** (`text-forest/NN`, `text-cream/NN`), metin olarak `text-sage`/`text-sage-dark` yasak; forest zeminde ikincil metin `text-sage-light`. `sage` yalnızca aksan (ince çizgi/ikon/işaret). Başlık başına en fazla 1 italik vurgu. Dekorasyon minimal — yüzen yaprak/grain/gradient ayraç **kullanma**; en fazla tek ince sage hairline veya Hero'daki tek filiz motifi. Hover tek-özellikli/sakin.

## Komutlar
- `npm run dev` · `npm run build` · `npm run lint`.
- `npm test` (Vitest; Docker Postgres gerekir). DB komutları: `npm run db:generate` / `db:migrate` / `db:seed`.
- Yerel DB: `DB_HOST_PORT=5433 docker compose up -d db` (bu makinede 5432 dolu; docker-compose varsayılanı 5432).

## Notlar
- SEO/AIO/tasarım/erişilebilirlik incelemesi ve 4 fazlı uygulama yol haritası: `docs/seo-aio-inceleme-yol-haritasi.md`.
- Yayın öncesi klinikten doldurulması gereken gerçek veriler (örnekli checklist): `docs/klinikten-gereken-veriler.md`. **Kalan:** gerçek veri girişi → `site.dataReady=true` (o zamana dek site bilinçli **noindex**).
- Yapılanlar + teklif/kapsam dokümanı: `docs/teklif-ve-yapilanlar.md`.

### Blog / Haberler
- **Kanonik blog `/blog`**'tur; kaynak artık **DB (`blog_posts` tablosu)**, uzman panelinden yönetilir (`/panel/blog`; **paylaşımlı yetki** — iki uzman da tüm yazıları düzenler/yayınlar). Okuyucu `src/lib/blog.ts` (async; `marked` → `sanitize-html`). İkinci bir blog route'u (`/yazilar` vb.) **açma** — daha önce tekrar/çakışma yarattı.
- `content/blog/*.md` dosyaları **tarihî tohum girdisiydi** — prod tohumu 2026-07-09 cutover'ında YAPILDI (3 yazı Neon'a taşındı). **Runtime'da okunmaz**; kanonik veri artık **prod DB**, panel düzenlemeleri doğrudan canlıyı günceller. md dosyalarını güncelleme/yeniden tohumlama.
- Yayın durumu frontmatter `draft` yerine **`status` alanı** (`draft` / `published`); yalnız `published` sitede görünür (taslak asla sızmaz). Anasayfadaki "Yazılar" bölümü (`Articles.tsx`) en güncel 3 **yayınlı** yazıyı DB'den gösterir ve `/blog`'a bağlanır.
- **Görseller:** dev'de `.uploads/blog/` (gitignore'lu; `/uploads/...` route'undan servis), prod'da Vercel Blob (`BLOB_READ_WRITE_TOKEN` doluysa mutlak Blob URL). Upload endpoint'i (`/panel/blog/gorsel`) oturumsuz **401**.
- **On-demand revalidate:** yayınla/taslağa-çek/düzenle `revalidatePath` ile `/blog`, `/blog/[slug]` ve anasayfayı **yeniden deploy olmadan** canlı tazeler (Task 9 üretim E2E'de doğrulandı). **`sitemap.xml` artık `force-dynamic`** (her istekte DB'den üretilir) — yayınlanan/kaldırılan yazı sitemap'e **anında** yansır, revalidate gerekmez. (Önceki `force-static` sınırlaması — `revalidatePath("/sitemap.xml")` üretimde tazeleyemiyordu — böylece **giderildi**; üretimde kanıtlandı: yayınla→sitemap anında içeriyor, kaldır→anında düşüyor. Bkz. `src/app/sitemap.ts` + `.superpowers/sdd/task-9-report.md`.)

### Sosyal medya otomasyonu (yerel)
- `tools/icerik-uretici/` — **Ollama (yerel LLM)** ile yayınlanan blog yazılarından Instagram/Facebook için Türkçe **taslak** (metin + marka görseli) üretir. **Kendiliğinden yayın YOK — insan onay kapısı**: taslaklar `taslaklar/` (gitignore'da) altına yazılır; onay elle (`--onayla`) **veya Telegram butonuyla** verilir, yayın `instagram-yayinla.cjs` ile. `--no-llm` yedeği ve `--watch` modu var. Kurulum: `tools/icerik-uretici/README.md`.
- **Telegram onay köprüsü** (`telegram-bot.cjs` + `lib/telegram.cjs`): `notify` taslağı görsel + [✅ Yayınla/🎬 Görsel+Reels/❌ Atla] butonlarıyla gönderir, `poll` (launchd 120 sn, `tools/icerik-uretici/launchd/`) dokunuşu işleyip yayınlar. Güvenlik: yalnız `TG_CHAT_ID` chat'i yetkili; offset dosyası (`taslaklar/.tg-offset`) ile idempotent; durum makinesi `taslak → bildirildi → onaylandi/reddedildi → paylasildi`.
- Meta'ya (Instagram/Facebook) gerçek otomatik yayın **henüz yok**; İş hesabı + uygulama onayı + token gerektiren dış bir engel.

### CI / Deploy (GitHub Actions)
- `.github/workflows/ci.yml` — **PR ve main push'ta** `npm ci → lint → build` (sunucu modu). Build adımı CI-özel **sahte** `SESSION_SECRET`/`DATABASE_URL` ile çalışır (gerçek gizli DEĞİL; CI hiç gerçek sunucu çalıştırmaz/oturum imzalamaz — yalnız auth modüllerinin build-zamanı fail-fast kontrolleri için sözdizimsel geçerli değer gerekir). Merge öncesi doğrulama buradan geçer.
- **Production deploy = Vercel Git entegrasyonu:** main'e merge otomatik deploy tetikler; elle `vercel --prod` da mümkün. Eski `deploy-godaddy.yml` workflow'u cutover tamamlanınca **silindi** (2026-07-09); GoDaddy/FTP dönemi kapandı (`docs/godaddy-deploy-rehberi.md` arşiv).

### Sunucu modu kuralları (Faz 0 sonrası) — DİKKAT
- **Eski statik export kuralları ARTIK GEÇERLİ DEĞİL** (`output: "export"` kaldırıldı): `force-static`/`dynamicParams` zorunluluğu ve "sunucu çalışmaz" kısıtı yok. Artık Server Actions, route handler, `cookies()`, `redirect()` ve DB erişimi mümkün.
- Next 16'da `params` **ve** `searchParams` artık **Promise** — `await params` / `await searchParams`.
- Middleware dosyası **`proxy.ts`** (Next 16; `middleware.ts` değil).
- `/panel/**` kimlik doğrulama: **jose** imzalı cookie + DB'de hash'li tek-kullanımlık **magic-token** + DAL (`verifySession`, `src/lib/auth/dal.ts`). Giriş `/panel/giris` — sitede bu sayfaya **link YOK**, yalnız doğrudan URL. Akış: istek → onay sayfası (`/panel/giris/dogrula`, GET token'ı **tüketmez**) → POST `/panel/giris/dogrula/onayla` token'ı tüketir (303).
- `.env.local` **gerekli** (`.env.local.example`'dan kopyala): `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, (ops.) `RESEND_API_KEY`.
- Magic-link dev'de e-posta yerine **konsola** basılır (`RESEND_API_KEY` boşken).
- Header/Footer hash linkleri hâlâ **mutlak** (`/#...`) tutulur ki alt route'lardan (ör. `/blog`) da çalışsın.

## Gözden geçirme (review) akışı — HER ZAMAN
Önemli bir değişiklik bitince ve **PR açmadan/merge etmeden önce**, sıfır bağlamlı
(fresh) bir Claude oturumuyla bağımsız review çalıştır:

1. `bash scripts/review.sh` → `review-rapor.md` üretir (main'e göre diff'i ayrı,
   önyargısız bir oturuma inceletir).
2. Rapordaki **Yüksek/Orta** öncelikli bulguları düzelt; ardından `npm run lint && npm run build`.
3. Gerekiyorsa review'i tekrar çalıştır.

Amaç, çalışan oturumun kör noktalarını yakalamaktır. `review-rapor.md` geçici
çıktıdır (repoya commit'lenmez; `.gitignore`'da).

CI'daki `.github/workflows/claude-review.yml` job'u (2026-07-10'dan beri):
repo secret'ı (`ANTHROPIC_API_KEY` veya `CLAUDE_CODE_OAUTH_TOKEN`) tanımlı
DEĞİLKEN incelemeyi **açıklamalı atlar** — job ~6 sn'de yeşil biter, step
summary "atlandı" der. **Yeşil "review" check'i bu yüzden hâlâ review
yapıldığı anlamına GELMEZ** (secret eklenene dek). Secret eklenirse inceleme
kendiliğinden çalışmaya başlar (workflow'a bağlı). Merge'i hiçbir durumda
bloke etmez (branch protection yok; gerçek kapı `lint-build`). Bağımsız
review bu yüzden oturum içinden (sıfır-bağlamlı subagent) yürütülür.
