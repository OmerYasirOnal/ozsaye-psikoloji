# Panel Modernleştirme / Cila Geçişi — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uzman panelinin (`/panel/**`) görsel cilasını, hiçbir davranış/veri akışını değiştirmeden, marka renk disiplinine tam sadık kalarak modernleştirmek.

**Architecture:** Salt CSS/JSX/Tailwind class değişiklikleri + `ServiceIcon.tsx`'in (mevcut, review'dan geçmiş ikon sarmalayıcısı) 2 yeni anahtarla genişletilmesi + `blog-admin.ts`'in `coverImageUrl` seçmesi. Yeni npm bağımlılığı yok.

**Tech Stack:** Next.js 16.2.6 App Router, React 19, Tailwind v4 (CSS-first `@theme`), TypeScript, Drizzle (mevcut `blogPosts.coverImageUrl` kolonu).

## Global Constraints

- **Renk disiplini (CLAUDE.md, ihlal edilemez):** metin yalnız `text-forest` (başlık) + `text-forest-muted` (gövde); opaklık-tabanlı metin rengi (`text-forest/NN`) yasak; `sage`/`sage-dark` **metin olarak** yasak — yalnız aksan/ikon. Yüzeyler yalnız warm-white/cream/forest.
- **`DurumRozeti.tsx`'in renk sınıflandırması (`ROZET_SINIF`) DEĞİŞTİRİLMEZ** — bağımsız review'dan geçti (PR #27). Yeni kart aksanları bu sınıflandırmayı birebir yansıtır.
- Next 16: `params`/`searchParams` sayfa bileşenlerinde hâlâ `Promise` — `await` edilir (mevcut örüntüler korunur, bu plan onlara dokunmuyor).
- Tüm yeni/değişen metin Türkçe.
- Yeni npm bağımlılığı **yok**.
- Her commit mesajı `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` ile biter.
- Görsel-only değişiklikler bu projede (Faz 1-4 emsali) birim testiyle değil `npm run lint` + `npx tsc --noEmit` + `npm run build` ile doğrulanır; mevcut `npm test` süitinin (davranış testleri) kırılmadığından da her görevde emin olunur.

---

### Task 1: İkon genişletme + panel kabuğu (nav ikonları + sayfa başlığı şablonu)

**Files:**
- Modify: `src/components/ServiceIcon.tsx`
- Modify: `src/app/panel/(protected)/layout.tsx`

**Interfaces:**
- Consumes: mevcut `ServiceIcon({ name, className })` bileşeni (`src/components/ServiceIcon.tsx`).
- Produces: `ServiceIcon`'a iki yeni `name` değeri (`"grid"`, `"document"`) — sonraki görevler (`user` zaten mevcuttu) bunları kullanır. `(protected)/layout.tsx`'te `title.template` metadata sözleşmesi — sonraki görevler yalnız `title: "..."` string'i verir.

- [ ] **Step 1: `ServiceIcon.tsx`'e 2 yeni ikon ekle**

`src/components/ServiceIcon.tsx` dosyasında `ICONS` objesine (mevcut `heart` anahtarından sonra, `clock`'tan önce veya sonra — sırası önemli değil) şu iki anahtarı ekle:

```tsx
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  document: (
    <>
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </>
  ),
```

Dosyanın en üstündeki docstring'i genişlet (artık yalnız hizmetler değil, panel de kullanıyor):

```tsx
/**
 * Paylaşımlı ince (strokeWidth 1.25) sage ikon seti. Hizmet kartları
 * (`/hizmetler`) ve uzman paneli (`/panel`) aynı `ServiceIcon` bileşenini
 * `iconKey`/`name` ile kullanır. src/lib/services.ts içindeki `iconKey`
 * değerleri bu haritadaki anahtarlarla eşleşir.
 */
```

- [ ] **Step 2: `(protected)/layout.tsx`'e metadata şablonu + nav ikonları ekle**

`src/app/panel/(protected)/layout.tsx` dosyasının tamamını şu şekilde güncelle:

```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { template: "%s · Panel", default: "Panel" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession(); // oturumsuzsa /panel/giris'e redirect

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-stone bg-warm-white px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-forest">Öz & Saye · Panel</span>
          <div className="flex items-center gap-4">
            <span className="text-forest-muted text-sm">{session.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-forest-muted text-sm underline"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-3 flex gap-5 text-sm">
          <Link
            href="/panel"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="grid" className="h-4 w-4 text-sage" />
            Gösterge
          </Link>
          <Link
            href="/panel/talepler"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="user" className="h-4 w-4 text-sage" />
            Talepler
          </Link>
          <Link
            href="/panel/blog"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="document" className="h-4 w-4 text-sage" />
            Blog
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: hata yok.

Run: `npm run dev` (Docker Postgres ayakta olmalı — `DB_HOST_PORT=5433 docker compose up -d db` gerekebilir), tarayıcıda `/panel/giris`'ten seed'li bir e-postayla (`melek@example.com`) giriş yap, `/panel`'e bak: nav'da 3 küçük sage ikon görünmeli, tarayıcı sekme başlığı "Panel" olmalı (henüz alt sayfalar kendi title'ını set etmiyor — Task 3'te düzelecek).

- [ ] **Step 4: Commit**

```bash
git add src/components/ServiceIcon.tsx "src/app/panel/(protected)/layout.tsx"
git commit -m "feat(panel): nav ikonları + panel sayfa başlığı şablonu" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Giriş sayfası — logo + kart

**Files:**
- Modify: `src/app/panel/giris/page.tsx`

**Interfaces:**
- Consumes: yok (bağımsız).
- Produces: yok (yaprak sayfa).

- [ ] **Step 1: `giris/page.tsx`'i güncelle**

Dosyanın tamamını şu şekilde değiştir:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Uzman Girişi",
  robots: { index: false, follow: false },
};

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string | string[] }>;
}) {
  const { hata } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-stone bg-warm-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Öz & Saye Psikoloji"
            width={323}
            height={331}
            className="h-16 w-auto"
          />
        </div>
        <h1 className="font-display text-3xl text-forest mb-8 text-center">
          Uzman Girişi
        </h1>
        {hata && (
          <p className="mb-6 font-semibold text-forest">
            Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir
            bağlantı isteyin.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
```

(`title`/`robots` burada da kalıyor — `(protected)/layout.tsx`'in şablonu yalnız `(protected)` grubunu kapsar, `giris/` o grubun dışında, kendi metadata'sını taşımaya devam eder.)

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: hata yok.

Tarayıcıda `/panel/giris` aç: ortalanmış, kartlı, logolu bir giriş ekranı görünmeli.

- [ ] **Step 3: Commit**

```bash
git add src/app/panel/giris/page.tsx
git commit -m "feat(panel): giriş sayfasına logo + kart görünümü" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Sayfa başlıkları (kalan 6 panel sayfası)

**Files:**
- Modify: `src/app/panel/(protected)/page.tsx`
- Modify: `src/app/panel/(protected)/talepler/page.tsx`
- Modify: `src/app/panel/(protected)/talepler/[id]/page.tsx`
- Modify: `src/app/panel/(protected)/blog/page.tsx`
- Modify: `src/app/panel/(protected)/blog/yeni/page.tsx`
- Modify: `src/app/panel/(protected)/blog/[id]/duzenle/page.tsx`

**Interfaces:**
- Consumes: Task 1'in `(protected)/layout.tsx` `title.template` sözleşmesi.
- Produces: yok (yaprak sayfalar).

- [ ] **Step 1: `(protected)/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import Link from "next/link";`'ten önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gösterge" };
```

- [ ] **Step 2: `talepler/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import Link from "next/link";`'ten önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Randevu Talepleri" };
```

- [ ] **Step 3: `talepler/[id]/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import Link from "next/link";`'ten önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Talep Detayı" };
```

- [ ] **Step 4: `blog/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import Link from "next/link";`'ten önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog Yazıları" };
```

- [ ] **Step 5: `blog/yeni/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import { verifySession } from "@/lib/auth/dal";`'dan önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yeni Yazı" };
```

- [ ] **Step 6: `blog/[id]/duzenle/page.tsx`'e metadata ekle**

Dosyanın en üstüne (`import Link from "next/link";`'ten önce) ekle:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Yazıyı Düzenle" };
```

- [ ] **Step 7: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: hepsi temiz. Build çıktısında bu 6 route hâlâ `ƒ (Dynamic)` olarak listelenmeli (davranış değişmedi, yalnız metadata eklendi).

Tarayıcıda her sayfayı gez, sekme başlığının `<Sayfa Adı> · Panel` biçiminde göründüğünü doğrula (ör. "Randevu Talepleri · Panel").

- [ ] **Step 8: Commit**

```bash
git add "src/app/panel/(protected)/page.tsx" "src/app/panel/(protected)/talepler/page.tsx" "src/app/panel/(protected)/talepler/[id]/page.tsx" "src/app/panel/(protected)/blog/page.tsx" "src/app/panel/(protected)/blog/yeni/page.tsx" "src/app/panel/(protected)/blog/[id]/duzenle/page.tsx"
git commit -m "feat(panel): tüm panel sayfalarına özel sekme başlığı" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Durum-uyumlu kart aksanları (dashboard + talep listesi)

**Files:**
- Modify: `src/lib/talepler.ts`
- Modify: `src/app/panel/(protected)/page.tsx`
- Modify: `src/app/panel/(protected)/talepler/page.tsx`

**Interfaces:**
- Consumes: `DURUM_ETIKETLERI`, `RandevuDurum`, `DURUM_DEGERLERI` (mevcut, `src/lib/talepler.ts`); `ServiceIcon` (Task 1).
- Produces: `RANDEVU_AKSAN_SINIFI: Record<RandevuDurum, string>` — `src/lib/talepler.ts`'ten export edilir, Task 5+ tarafından kullanılmaz (yalnız bu görev) ama gelecekte randevu-durumlu her yüzey bunu tekrar kullanabilir.

- [ ] **Step 1: `src/lib/talepler.ts`'e aksan sınıfı ekle**

`export const DURUM_DEGERLERI = ...` satırından hemen sonra ekle:

```ts
/**
 * Kart sol-kenar aksanı — `DurumRozeti.tsx`'in (bağımsız review'dan geçmiş,
 * PR #27) 3-katmanlı renk sınıflandırmasının kart-aksanı biçimi. YENİ BİR RENK
 * ŞEMASI İCAT EDİLMEZ: açık/takip gerektiren durumlar (yeni, arandı,
 * planlandı) forest; kapanmış durumlar (tamam, iptal) stone.
 */
export const RANDEVU_AKSAN_SINIFI: Record<RandevuDurum, string> = {
  new: "border-l-forest",
  contacted: "border-l-forest",
  scheduled: "border-l-forest",
  done: "border-l-stone",
  cancelled: "border-l-stone",
};
```

- [ ] **Step 2: `(protected)/page.tsx`'i güncelle (stat kartları + hızlı-link ikonları)**

`import { DURUM_DEGERLERI, DURUM_ETIKETLERI } from "@/lib/talepler";` satırını şuna çevir:

```tsx
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  RANDEVU_AKSAN_SINIFI,
} from "@/lib/talepler";
import { ServiceIcon } from "@/components/ServiceIcon";
```

Stat kartları bloğunu (`<div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">` ile başlayan) şuna çevir:

```tsx
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {DURUM_DEGERLERI.map((d) => (
          <Link
            key={d}
            href={`/panel/talepler?durum=${d}`}
            className={`rounded-lg border border-stone border-l-4 ${RANDEVU_AKSAN_SINIFI[d]} bg-warm-white px-5 py-4`}
          >
            <span className="block font-display text-3xl text-forest">
              {sayilar[d]}
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              {DURUM_ETIKETLERI[d]}
            </span>
          </Link>
        ))}
      </div>
```

Hızlı-link kartları bloğunu (`<div className="mt-8 grid gap-3 sm:grid-cols-2">` ile başlayan) şuna çevir:

```tsx
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/panel/talepler"
          className="flex items-center gap-4 rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <ServiceIcon name="user" className="h-6 w-6 shrink-0 text-sage" />
          <div>
            <span className="block text-forest font-medium">
              Randevu Talepleri
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              Talepleri görüntüle ve yönet
            </span>
          </div>
        </Link>
        <Link
          href="/panel/blog"
          className="flex items-center gap-4 rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <ServiceIcon name="document" className="h-6 w-6 shrink-0 text-sage" />
          <div>
            <span className="block text-forest font-medium">
              Blog Yazıları
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              Yazı oluştur, düzenle, yayınla
            </span>
          </div>
        </Link>
      </div>
```

- [ ] **Step 3: `talepler/page.tsx`'i güncelle (liste satırı aksanı + ikon)**

İmport bloğuna ekle (`import DurumRozeti from "./DurumRozeti";`'den önce):

```tsx
import { ServiceIcon } from "@/components/ServiceIcon";
```

`import { ... } from "@/lib/talepler";` satırına `RANDEVU_AKSAN_SINIFI`'ı ekle:

```tsx
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  RANDEVU_AKSAN_SINIFI,
  maskeliTelefon,
  uzmanEtiketi,
  type RandevuDurum,
} from "@/lib/talepler";
```

Liste öğesi `<Link>`'ini şu şekilde değiştir:

```tsx
              <Link
                href={`/panel/talepler/${t.id}`}
                className={`flex items-center justify-between gap-4 rounded-lg border border-stone border-l-4 ${RANDEVU_AKSAN_SINIFI[t.status]} bg-warm-white px-5 py-4`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ServiceIcon
                    name="user"
                    className="h-5 w-5 shrink-0 text-sage"
                  />
                  <div className="min-w-0">
                    <p className="text-forest font-medium">{t.patientName}</p>
                    <p className="text-forest-muted text-sm">
                      {maskeliTelefon(t.patientPhone)} · {uzmanEtiketi(t.expertSlug)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-forest-muted text-sm">
                    {formatDateTR(t.createdAt.toISOString())}
                  </span>
                  <DurumRozeti durum={t.status} />
                </div>
              </Link>
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: hepsi temiz (bu görev `talepler-db.test.ts`'e dokunmuyor, davranış aynı — testler kırılmamalı).

Tarayıcıda `/panel` ve `/panel/talepler`'e bak: kartların/satırların sol kenarında forest/stone aksan, kişi/döküman ikonları görünmeli.

- [ ] **Step 5: Commit**

```bash
git add src/lib/talepler.ts "src/app/panel/(protected)/page.tsx" "src/app/panel/(protected)/talepler/page.tsx"
git commit -m "feat(panel): dashboard + talep listesine durum-uyumlu kart aksanı ve ikon" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Blog liste — durum aksanı + kapak küçük resmi

**Files:**
- Modify: `src/lib/blog-admin.ts`
- Modify: `src/app/panel/(protected)/blog/page.tsx`

**Interfaces:**
- Consumes: `ServiceIcon` (Task 1); `blogPosts.coverImageUrl` (mevcut şema kolonu, nullable).
- Produces: `listPostsAdmin()`'in dönüş tipine `coverImageUrl: string | null` eklenir — bunu tüketen tek yer bu görevdeki `blog/page.tsx`.

- [ ] **Step 1: `blog-admin.ts`'te `listPostsAdmin`'in seçimine `coverImageUrl` ekle**

`src/lib/blog-admin.ts`'teki `listPostsAdmin` fonksiyonunun `.select({...})` bloğunu şuna çevir:

```ts
export async function listPostsAdmin() {
  return db
    .select({
      id: blogPosts.id,
      slug: blogPosts.slug,
      title: blogPosts.title,
      status: blogPosts.status,
      category: blogPosts.category,
      coverImageUrl: blogPosts.coverImageUrl,
      updatedAt: blogPosts.updatedAt,
      publishedAt: blogPosts.publishedAt,
    })
    .from(blogPosts)
    .orderBy(desc(blogPosts.updatedAt));
}
```

- [ ] **Step 2: `blog/page.tsx`'i güncelle (kapak küçük resmi + durum aksanı)**

İmport bloğunun en üstüne ekle:

```tsx
import Image from "next/image";
import { ServiceIcon } from "@/components/ServiceIcon";
```

`<ul className="space-y-3">` içindeki `<li>` bloğunu şu şekilde değiştir:

```tsx
            <li
              key={post.id}
              className={`flex items-center justify-between gap-4 rounded-lg border border-stone border-l-4 ${
                post.status === "published" ? "border-l-forest" : "border-l-stone"
              } bg-warm-white px-5 py-4`}
            >
              <div className="flex min-w-0 items-center gap-4">
                {post.coverImageUrl ? (
                  <Image
                    src={post.coverImageUrl}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-cream">
                    <ServiceIcon name="document" className="h-6 w-6 text-sage" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-forest font-medium">{post.title}</p>
                  <p className="text-forest-muted text-sm">
                    {post.category} · {formatDateTR(post.updatedAt.toISOString())}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {post.status === "published" ? (
                  <span className="rounded-full bg-forest px-3 py-1 text-xs text-warm-white">
                    yayında
                  </span>
                ) : (
                  <span className="rounded-full border border-stone px-3 py-1 text-xs text-forest-muted">
                    taslak
                  </span>
                )}
                <Link
                  href={`/panel/blog/${post.id}/duzenle`}
                  className="text-forest-muted text-sm underline"
                >
                  Düzenle
                </Link>
              </div>
            </li>
```

> **Not:** `unoptimized` prop'u ile `next/image` remote URL'ler (prod'da Vercel Blob) için `next.config.ts`'e `images.remotePatterns` eklemeye GEREK BIRAKMAZ — optimizasyon adımını atlar, yalnız `width`/`height`/`alt` disiplinini ve native lazy-loading'i korur. Bu, `next.config.ts`'ye dokunmadan (kapsam dışı) en düşük riskli yol.

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: hepsi temiz.

Tarayıcıda `/panel/blog`'a bak: kapak görseli olmayan yazılarda cream zemin üzerinde döküman ikonu, satırların solunda durum-uyumlu aksan görünmeli.

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog-admin.ts "src/app/panel/(protected)/blog/page.tsx"
git commit -m "feat(panel): blog listesine kapak küçük resmi + durum aksanı" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Tarih input'u CSS cilası

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: yok.
- Produces: yok (yalnız CSS, tüm `datetime-local` input'ları site genelinde etkiler — şu an yalnız `TalepDuzenleForm.tsx`'te kullanılıyor).

- [ ] **Step 1: `globals.css`'in sonuna ekle**

Dosyanın en sonuna (`.article-prose hr { ... }` satırından sonra) ekle:

```css

/* Native datetime-local input cilası (Talep Detayı > Yönet formu).
   Yalnız Chromium/WebKit'te etkili (::-webkit-* no-op'tur Firefox'ta —
   Firefox kendi native görünümünü kullanmaya devam eder, davranış bozulmaz). */
input[type="datetime-local"] {
  color-scheme: light; /* sistem koyu temasında takvim/saat ikonu tersine dönmesin */
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: hata yok (CSS değişikliği tsc/eslint'i etkilemez, yine de tam süit çalıştır).

Tarayıcıda (Brave/Chrome) `/panel/talepler/<bir-id>`'e git, "Planlanan tarih" alanının takvim ikonuna imleci getir: opaklık değişmeli, imleç pointer olmalı.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "style(panel): native datetime-local input cilası" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Blog editörü — görsel birleşim

**Files:**
- Modify: `src/app/panel/(protected)/blog/Editor.tsx`

**Interfaces:**
- Consumes: yok (iç görsel değişiklik, dışa açık API/props aynı kalır: `Editor({ initialMarkdown, onChange })`).
- Produces: yok.

- [ ] **Step 1: Dış sarmalayıcı + araç çubuğu + içerik alanının sınıflarını güncelle**

`src/app/panel/(protected)/blog/Editor.tsx`'te `useEditor`'ün `editorProps.attributes.class` değerini şuna çevir (yalnız `class` string'i değişiyor):

```tsx
    editorProps: {
      attributes: {
        class: "article-prose min-h-[20rem] bg-warm-white p-4 focus:outline-none",
      },
    },
```

`return (` ile başlayan JSX'in dış `<div>`'ini ve araç çubuğu `<div>`'ini şuna çevir:

```tsx
  return (
    <div className="overflow-hidden rounded-lg border border-stone shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone bg-cream p-2">
```

(Geri kalan araç çubuğu düğmeleri, `<input>` dosya seçici, `<EditorContent editor={editor} />` ve `uploadError` paragrafı **aynen kalır** — yalnızca iki açılış etiketinin class'ları değişti. Kapanış etiketleri zaten `</div>` — sayıları/eşleşmeleri değişmiyor.)

`if (!editor)` erken-dönüş bloğundaki yükleniyor kutusuna da tutarlılık için `shadow-sm` ekle (opsiyonel küçük dokunuş):

```tsx
  if (!editor) {
    return (
      <div className="min-h-[20rem] rounded-lg border border-stone bg-warm-white p-4 text-forest-muted shadow-sm">
        Editör yükleniyor…
      </div>
    );
  }
```

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit && npm run lint`
Expected: hata yok.

Tarayıcıda `/panel/blog/yeni`'ye bak: araç çubuğu (cream zemin) ve içerik alanı (warm-white zemin) artık tek bir çerçeveli/gölgeli "kart" gibi görünmeli, aradaki çift-çizgi kaybolmalı.

- [ ] **Step 3: Commit**

```bash
git add "src/app/panel/(protected)/blog/Editor.tsx"
git commit -m "style(panel): blog editörü araç çubuğu + içerik alanını tek kart olarak birleştir" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Faz Tamamlanma Kriterleri (kabul)
- [ ] `npm run lint && npx tsc --noEmit && npm test && npm run build` — hepsi temiz.
- [ ] Giriş sayfası: logo + kart.
- [ ] Panel nav'ında 3 ikon; her panel sayfasının sekme başlığı doğru (`... · Panel`).
- [ ] Dashboard + talep listesi + blog listesi satırlarında durum-uyumlu sol-kenar aksanı; blog liste satırlarında kapak küçük resmi/yer tutucu ikon.
- [ ] Tarih input'u Brave/Chrome'da cilalı (imleç + opaklık geçişi).
- [ ] Blog editörü tek bir "kart" gibi görünüyor.
- [ ] Hiçbir davranış/veri akışı değişmedi (mevcut `npm test` süiti — özellikle `talepler-db.test.ts`, `talepler.test.ts` varsa — hâlâ yeşil).
- [ ] Önceki ekran görüntüleriyle (`.superpowers/sdd/panel-screenshots/`) karşılaştırmalı yeni ekran görüntüleri alınır (bu adım plan dışında, kontrolör tarafından final review'dan önce yapılır).

## Self-Review notu
Spec'in 7 maddesi (§1-7) birebir Task 1-7'ye eşleniyor. `DurumRozeti`'in renk sınıflandırması hiçbir yerde değiştirilmedi, yalnız `RANDEVU_AKSAN_SINIFI` adıyla kart-aksanına yansıtıldı. Yeni bağımlılık yok. `next/image`'ın `unoptimized` kullanımı, `next.config.ts`'ye dokunmadan (kapsam dışı bırakılan bir infra değişikliği) remote kapak görsellerini güvenle render etmenin yolu olarak seçildi.
