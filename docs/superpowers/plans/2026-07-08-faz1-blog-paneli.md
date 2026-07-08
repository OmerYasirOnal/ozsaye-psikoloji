# Faz 1 — Blog Paneli · Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Blog'un kaynağını `content/blog/*.md` dosyalarından Postgres'e (`blog_posts`) taşımak ve 2 uzmanın `/panel/blog` altında WYSIWYG editörle (görsel yüklemeli) yazı oluşturup taslak/yayın yönetebilmesini sağlamak — genel `/blog` route'ları, anasayfa "Yazılar" bölümü ve sitemap DB'den beslenirken URL/SEO davranışı korunur.

**Architecture:** Mevcut `src/lib/blog.ts` dış sözleşmesi (tipler + fonksiyon adları) korunur ama içerik DB'den gelir ve fonksiyonlar **async** olur; 4 tüketici (blog listesi, blog detayı, `Articles`, `sitemap`) await'e geçer. Sayfalar SSG kalır + her panel mutasyonunda `revalidatePath` ile on-demand yenilenir. Editör: Tiptap v3 + `tiptap-markdown` (markdown olarak saklanır); render mevcut `marked` hattı + `sanitize-html`. Görseller: dev'de yerel disk (`.uploads/` + servis route'u), üretimde Vercel Blob — `RESEND_API_KEY` desenindeki gibi tek `saveImage()` arkasında. CI build'i artık DB'ye dokunduğu için ci.yml'e Postgres service container + migrate + `npm test` eklenir.

**Tech Stack:** Next 16.2.6 (sunucu modu), Drizzle + postgres.js, `@tiptap/react@^3.27`, `@tiptap/starter-kit@^3.27` (Link dahil), `@tiptap/extension-image@^3.27`, `tiptap-markdown@^0.9` (peer: tiptap v3 ✓), `@vercel/blob@^2.6`, `sanitize-html@^2.17` (+`@types/sanitize-html`), Vitest.

## Global Constraints

- **Commit trailer:** her commit `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` ile biter.
- **Tüm arayüz metni Türkçe.** Renk disiplini (CLAUDE.md): metin yalnız `text-forest`/`text-forest-muted`; opaklık-tabanlı metin rengi ve metin olarak `sage` yasak; panel UI sade/işlevsel.
- **Next 16:** `params`/`searchParams` **Promise** (`await`). Middleware = `proxy.ts` (dokunulmayacak — `/panel/**` guard'ı mevcut).
- **Panel sayfaları `src/app/panel/(protected)/` altına** yazılır (layout guard'ı yalnız bu group'u sarar). **Route handler'lar layout'tan auth ALMAZ** — panel altındaki her route handler kendi içinde oturum doğrular (`readSessionCookie`, yoksa 401).
- **Her Server Action ilk iş `verifySession()` çağırır** (`@/lib/auth/dal`) — istemci kısıtları güvenlik değildir.
- **`server-only` yalnız Vitest'in doğrudan import ETMEDİĞİ dosyalarda** (Faz 0'da keşfedilen kural: paket düz Vitest altında koşulsuz throw eder).
- **`/blog` tek kanonik route** — ikinci blog route'u açılmaz. Mevcut URL'ler (`/blog/kaygi-ile-basa-cikmak/` vb.) değişmez.
- **`content/blog/*.md` dosyaları SİLİNMEZ** — Faz 3'te boş prod (Neon) DB'sini tohumlamak için `scripts/migrate-blog-to-db.ts`'in girdisi olarak kalırlar. (Not: cutover'a kadar panelden yapılan düzenlemeler yalnız yerel DB'de yaşar; gerçek içerik üretimi cutover SONRASI başlamalı.)
- **Yürütme ön-koşulu:** Docker Postgres ayakta (`DB_HOST_PORT=5433 docker compose up -d db`), `.env.local` mevcut, `npm test` şu an 9/9 yeşil.

## Dosya haritası (özet)

```
.github/workflows/ci.yml                        (değişir: pg service + migrate + test)
src/lib/db/schema.ts                            (değişir: blogPosts.category + tags)
drizzle/0001_*.sql                              (yeni migration — üretilir)
src/lib/slug.ts + slug.test.ts                  (yeni: TR slugify, saf fonksiyon)
scripts/migrate-blog-to-db.ts                   (yeni: md → DB, idempotent)
src/lib/blog.ts                                 (yeniden yazılır: DB + sanitize; API korunur)
src/app/blog/page.tsx · blog/[slug]/page.tsx ·
src/components/Articles.tsx · src/app/sitemap.ts (await'e geçer)
src/lib/storage.ts (+ storage.test.ts)          (yeni: dev disk / prod Blob)
src/app/uploads/[...dosya]/route.ts             (yeni: dev görsel servisi, GET)
src/app/panel/(protected)/blog/gorsel/route.ts  (yeni: auth'lu upload, POST)
src/lib/blog-admin.ts                           (yeni: panel sorguları — taslaklar dahil)
src/app/panel/(protected)/blog/page.tsx         (liste)
src/app/panel/(protected)/blog/actions.ts       (create/update/setStatus + revalidate)
src/app/panel/(protected)/blog/PostForm.tsx     ("use client" form + gizli markdown alanı)
src/app/panel/(protected)/blog/Editor.tsx       ("use client" Tiptap)
src/app/panel/(protected)/blog/yeni/page.tsx
src/app/panel/(protected)/blog/[id]/duzenle/page.tsx
src/app/panel/(protected)/page.tsx              (gösterge: blog linki eklenir)
CLAUDE.md                                       (Blog bölümü DB gerçekliğine güncellenir — Task 9'da)
```

---

### Task 1: CI'ya Postgres service + migrate + test

**Files:** Modify: `.github/workflows/ci.yml`

**Interfaces:** Produces: CI'da build sırasında erişilebilir boş-şemalı Postgres; `npm test` CI'da koşar. Sonraki task'lar build-time DB okumaya güvenebilir.

**Neden:** Task 4'ten itibaren `/blog`, anasayfa ve sitemap build sırasında (SSG prerender) DB okuyacak. Bugünkü CI'da DB yok — build kırılır. Boş `blog_posts` tablosu sorun değil (liste "Henüz yazı yayınlanmadı" der, `generateStaticParams` `[]` döner).

- [ ] **Step 1: `ci.yml`'i güncelle** — `lint-build` job'ına service + job-level env + iki yeni adım:

```yaml
jobs:
  lint-build:
    runs-on: ubuntu-latest
    services:
      db:
        image: postgres:16
        env:
          POSTGRES_USER: ozsaye
          POSTGRES_PASSWORD: ozsaye
          POSTGRES_DB: ozsaye
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U ozsaye"
          --health-interval 5s --health-timeout 5s --health-retries 10
    env:
      # CI-özel değerler — GERÇEK gizli değil (build/test yerel service'e karşı çalışır).
      DATABASE_URL: postgres://ozsaye:ozsaye@localhost:5432/ozsaye
      SESSION_SECRET: ci-build-zamani-gercek-olmayan-deger
      APP_URL: http://localhost:3000
    steps:
      # ... mevcut Checkout / Node / npm ci / Lint adımları aynen ...
      - name: DB migration (CI service'ine)
        run: npx tsx scripts/db-migrate.ts
      - name: Testler
        run: npm test
      - name: Build (sunucu modu)
        run: npm run build
```

Build adımındaki eski adım-içi `env:` bloğu kaldırılır (job-level env kapsıyor). Migration adımı `npm run db:migrate` DEĞİL `npx tsx scripts/db-migrate.ts` kullanır — package.json script'i `--env-file=.env.local` istiyor, CI'da o dosya yok.

- [ ] **Step 2: Yerel eşdeğer doğrulama** — Run: `npx tsx scripts/db-migrate.ts && npm test && npm run build` (yerel `.env.local` env'iyle; hepsi geçmeli — bugünkü davranışın regresyonu yok).
- [ ] **Step 3: Commit** — `ci: build DB'ye dokunacağı için Postgres service + migrate + test adımı`

---

### Task 2: Şema — `blog_posts.category` + `tags` ve TR slug yardımcıları

**Files:** Modify: `src/lib/db/schema.ts` · Create: `src/lib/slug.ts`, `src/lib/slug.test.ts` · Generated: `drizzle/0001_*.sql`

**Interfaces:**
- Produces (`@/lib/db/schema`): `blogPosts.category: text notNull default "Yazı"` (TS: `category`), `blogPosts.tags: text[] notNull default {}` (TS: `tags`).
- Produces (`@/lib/slug` — **saf**, client'tan da import edilebilir, `server-only` YOK): `slugify(input: string): string`.

- [ ] **Step 1 (RED): `src/lib/slug.test.ts`**

```ts
import { expect, test } from "vitest";
import { slugify } from "./slug";

test("Türkçe karakterleri sadeleştirir", () => {
  expect(slugify("Kaygı ile Başa Çıkmak")).toBe("kaygi-ile-basa-cikmak");
  expect(slugify("ÇİĞDEM'in Öğüdü — %100 İyi!")).toBe("cigdemin-ogudu-100-iyi");
});
test("boşluk/sembol tekrarını tek tireye indirir, uçları kırpar", () => {
  expect(slugify("  a   b  ")).toBe("a-b");
  expect(slugify("--a__b--")).toBe("a-b");
});
test("boş/sembol-yalnız girdi boş döner", () => {
  expect(slugify("!!!")).toBe("");
});
```

Run: `npm test src/lib/slug.test.ts` → FAIL (modül yok).

- [ ] **Step 2 (GREEN): `src/lib/slug.ts`**

```ts
const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

/** Türkçe-farkındalıklı URL slug'ı. Saf fonksiyon — client bileşenlerinden de kullanılır. */
export function slugify(input: string): string {
  return input
    .replace(/[çÇğĞıIİöÖşŞüÜ]/g, (ch) => TR_MAP[ch] ?? ch)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
```

Run testler → PASS (3).

- [ ] **Step 3: Şemaya kolonlar** — `schema.ts` içinde `blogPosts`'a (mevcut alanlar aynen kalır) ekle; dosyanın başındaki drizzle import'una `sql` için `import { sql } from "drizzle-orm";` gerekir:

```ts
  category: text("category").notNull().default("Yazı"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
```

- [ ] **Step 4: Migration üret + uygula** — Run: `npm run db:generate` sonra `npm run db:migrate`. Üretilen `drizzle/0001_*.sql`'de `ALTER TABLE "blog_posts" ADD COLUMN "category" ... ADD COLUMN "tags" text[] ...` doğrula; `docker compose exec -T db psql -U ozsaye -d ozsaye -c '\d blog_posts'` ile kolonları gör.
- [ ] **Step 5: `npm test` (tümü) + Commit** — `feat(db): blog_posts'a category+tags; TR slugify yardımcıları`

---

### Task 3: md → DB göç script'i

**Files:** Create: `scripts/migrate-blog-to-db.ts`

**Interfaces:** Consumes: `db`, `client`, `blogPosts` (schema), gray-matter. Produces: `npx tsx --env-file=.env.local scripts/migrate-blog-to-db.ts` — `content/blog/*.md`'yi `blog_posts`'a taşır; **idempotent** (slug çakışmasında dokunmaz, panel düzenlemelerini asla ezmez). Faz 3'te prod DB'ye karşı yeniden çalıştırılacak.

- [ ] **Step 1: Script**

```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { db, client } from "../src/lib/db";
import { blogPosts } from "../src/lib/db/schema";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

(async () => {
  const files = fs.existsSync(BLOG_DIR)
    ? fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"))
    : [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const { data, content } = matter(
      fs.readFileSync(path.join(BLOG_DIR, file), "utf8"),
    );
    const published = data.draft !== true;
    const inserted = await db
      .insert(blogPosts)
      .values({
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        bodyMarkdown: content.trim(),
        category: String(data.category ?? "Yazı"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        status: published ? "published" : "draft",
        publishedAt: published && data.date ? new Date(String(data.date)) : null,
        // authorStaffId null bırakılır: md yazıları kurum imzalı; görünen ad
        // blog.ts'te "Öz & Saye Psikoloji" fallback'inden gelir.
      })
      .onConflictDoNothing({ target: blogPosts.slug })
      .returning({ slug: blogPosts.slug });
    console.log(inserted.length ? `taşındı: ${slug}` : `atlandı (mevcut): ${slug}`);
  }
  await client.end();
  console.log("Göç tamam.");
})();
```

- [ ] **Step 2: Çalıştır + doğrula** — Run: `npx tsx --env-file=.env.local scripts/migrate-blog-to-db.ts` → 3 × `taşındı:`; tekrar çalıştır → 3 × `atlandı (mevcut):` (idempotens kanıtı). `psql ... -c "select slug,status,category,array_length(tags,1),published_at::date from blog_posts order by published_at;"` → 3 satır, alanlar frontmatter'la eşleşir.
- [ ] **Step 3: Commit** — `feat(blog): content/blog md → blog_posts göç script'i (idempotent; Faz 3 prod tohumu)`

---

### Task 4: `blog.ts`'i DB'ye geçir + 4 tüketiciyi await'e al

**Files:** Modify: `src/lib/blog.ts`, `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`, `src/components/Articles.tsx`, `src/app/sitemap.ts` · Deps: `npm i sanitize-html && npm i -D @types/sanitize-html`

**Interfaces:** `@/lib/blog` dış sözleşmesi: `PostMeta`/`Post` tipleri ve `formatDateTR` AYNEN; `getAllPosts(): Promise<PostMeta[]>` ve `getPostBySlug(slug): Promise<Post | null>` artık **async**. `PostMeta.author`: `staff.name` (authorStaffId doluysa) yoksa `"Öz & Saye Psikoloji"`. `PostMeta.date`: `publishedAt` ISO `YYYY-MM-DD`. `Post.html`: `marked` → `sanitize-html`.

- [ ] **Step 1: `blog.ts`'i yeniden yaz** — fs/gray-matter gider; `MONTHS_TR`/`formatDateTR`/`readTimeFromText` ve tipler kalır:

```ts
import { desc, eq } from "drizzle-orm";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { db } from "@/lib/db";
import { blogPosts, staff } from "@/lib/db/schema";
// ... tipler + formatDateTR + readTimeFromText AYNEN korunur ...

const DEFAULT_AUTHOR = "Öz & Saye Psikoloji";

type Row = typeof blogPosts.$inferSelect & { authorName: string | null };

function rowToMeta(r: Row): PostMeta {
  return {
    slug: r.slug,
    title: r.title,
    date: r.publishedAt ? r.publishedAt.toISOString().slice(0, 10) : "",
    excerpt: r.excerpt ?? "",
    category: r.category,
    author: r.authorName ?? DEFAULT_AUTHOR,
    tags: r.tags ?? [],
    readTime: readTimeFromText(r.bodyMarkdown),
  };
}

const baseSelect = () =>
  db
    .select({ post: blogPosts, authorName: staff.name })
    .from(blogPosts)
    .leftJoin(staff, eq(blogPosts.authorStaffId, staff.id));

export async function getAllPosts(): Promise<PostMeta[]> {
  const rows = await baseSelect()
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt));
  return rows.map(({ post, authorName }) => rowToMeta({ ...post, authorName }));
}

/** marked çıktısını süz: staff girdisi güvenilir olsa da panelde stored-XSS'e
 *  karşı savunma katmanı (allowlist; img http(s)/kök-göreli src). */
function renderMarkdown(md: string): string {
  const raw = marked.parse(md, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2"],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "title", "width", "height"],
    },
    allowedSchemes: ["https", "http"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    allowProtocolRelative: false,
  });
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const rows = await baseSelect().where(eq(blogPosts.slug, slug)).limit(1);
  const row = rows[0];
  if (!row || row.post.status !== "published") return null;
  return {
    ...rowToMeta({ ...row.post, authorName: row.authorName }),
    html: renderMarkdown(row.post.bodyMarkdown),
  };
}
```

Not: kök-göreli `/uploads/...` img src'leri `allowedSchemes` filtresine takılmamalı — sanitize-html şemasız (relative) URL'lere izin verir; doğrulama adımında bir `/uploads/x.png` içeren markdown'la test et.

- [ ] **Step 2: Tüketiciler** — 4 dosyada minimal değişiklik: bileşen/fonksiyon `async` yapılır, `getAllPosts()`/`getPostBySlug()` `await`'lenir (`BlogIndexPage`, `Articles`, `sitemap()`, `generateStaticParams` + `generateMetadata` + `BlogPostPage`). Başka hiçbir markup/davranış değişmez.
- [ ] **Step 3: Doğrula** — `npx tsc --noEmit` + `npm run lint` + `npm test` + `npm run build` (build DB'den 3 yazıyı SSG'ler — route listesinde `/blog/[slug]` altında 3 yol görünmeli). `npm run dev` ile `/blog`, bir yazı detayı, anasayfa "Yazılar" ve `/sitemap.xml` görsel kontrol; içerik md sürümüyle birebir.
- [ ] **Step 4: Commit** — `feat(blog): kaynak DB'ye geçti — blog.ts async + sanitize, 4 tüketici await`

---

### Task 5: Görsel depolama (dev disk / prod Blob) + servis + upload endpoint'i

**Files:** Create: `src/lib/storage.ts`, `src/lib/storage.test.ts`, `src/app/uploads/[...dosya]/route.ts`, `src/app/panel/(protected)/blog/gorsel/route.ts` · Modify: `.gitignore` (`.uploads/` eklenir) · Deps: `npm i @vercel/blob`

**Interfaces:** Produces (`@/lib/storage`, `server-only` YOK — test edilir): `saveImage(data: Buffer, originalName: string, contentType: string): Promise<{ url: string }>`. `BLOB_READ_WRITE_TOKEN` doluysa Vercel Blob'a (`access: "public"`, yol `blog/<benzersiz>`), boşsa `.uploads/blog/<benzersiz>`'e yazar ve `/uploads/blog/<benzersiz>` döner. Benzersiz ad: `Date.now()-randomHex8-slugify(taban).uzantı`.

- [ ] **Step 1 (RED→GREEN): `storage.test.ts`** — dev yolunu test eder (`BLOB_READ_WRITE_TOKEN` boş garantisiyle: testte `delete process.env.BLOB_READ_WRITE_TOKEN`): `saveImage(Buffer.from("x"), "Çiğ Köfte Fotoğrafı.PNG", "image/png")` → url `/uploads/blog/` ile başlar, `.png` ile biter, TR karakter içermez; dönen url'nin diskteki karşılığı (`.uploads/...`) gerçekten var ve içeriği "x"; `afterAll` yazılan dosyayı siler. TDD: önce FAIL, sonra `storage.ts`:

```ts
import { createHash, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/slug";

const LOCAL_DIR = path.join(process.cwd(), ".uploads");

export async function saveImage(
  data: Buffer, originalName: string, contentType: string,
): Promise<{ url: string }> {
  const ext = path.extname(originalName).toLowerCase() || ".bin";
  const base = slugify(path.basename(originalName, path.extname(originalName))) || "gorsel";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}-${base}${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`blog/${name}`, data, {
      access: "public", contentType, token,
    });
    return { url: blob.url };
  }
  const dir = path.join(LOCAL_DIR, "blog");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), data);
  return { url: `/uploads/blog/${name}` };
}
```

- [ ] **Step 2: Dev servis route'u** — `src/app/uploads/[...dosya]/route.ts` (GET, herkese açık — blog görselleri kamusal): `const { dosya } = await params` (Promise!); `path.join(LOCAL_DIR, ...dosya)`'yı `path.resolve` ile çöz ve **`.uploads` kökünün dışına çıkıyorsa 404** (traversal koruması); uzantıdan content-type (png/jpg/jpeg/webp/gif; başkası 404); `fs.readFile` → `new Response(buf, { headers: { "Content-Type": ..., "Cache-Control": "public, max-age=31536000, immutable" } })`; bulunamazsa 404. Üretimde (Blob URL mutlak) bu route hiç kullanılmaz.
- [ ] **Step 3: Upload endpoint'i** — `src/app/panel/(protected)/blog/gorsel/route.ts` (POST): önce `readSessionCookie()` (`@/lib/auth/session`) → null ise `Response.json({ hata: "Oturum gerekli" }, { status: 401 })`. `req.formData()` → `dosya` alanı `File`; tip `image/png|jpeg|webp` değilse 415, boyut > 4MB ise 413 (Türkçe `hata` mesajlarıyla); `saveImage(Buffer.from(await file.arrayBuffer()), file.name, file.type)` → `Response.json({ url })`.
- [ ] **Step 4: Doğrula** — `npm test` (yeni storage testi dahil hepsi) + `tsc` + lint. Dev sunucuyla: oturumsuz `curl -X POST .../panel/blog/gorsel/` → 401; oturumlu senaryo Task 9 E2E'de. `.gitignore`'a `.uploads/` eklendiğini `git check-ignore .uploads/x` ile doğrula.
- [ ] **Step 5: Commit** — `feat(gorsel): saveImage (dev disk / prod Vercel Blob) + dev servis route'u + auth'lu upload endpoint'i`

---

### Task 6: Panel sorgu katmanı + `/panel/blog` liste sayfası

**Files:** Create: `src/lib/blog-admin.ts`, `src/app/panel/(protected)/blog/page.tsx` · Modify: `src/app/panel/(protected)/page.tsx`

**Interfaces:** Produces (`@/lib/blog-admin`, başına `import "server-only";`): `listPostsAdmin(): Promise<Array<{ id; slug; title; status; category; updatedAt; publishedAt }>>` (taslaklar DAHİL, updatedAt desc) · `getPostByIdAdmin(id: string): Promise<typeof blogPosts.$inferSelect | null>`. Paylaşımlı yetki: staff filtresi YOK (spec kararı — her uzman her yazıyı görür/düzenler).

- [ ] **Step 1: `blog-admin.ts`** — iki küçük drizzle sorgusu (select kolonları yukarıdaki gibi; `orderBy(desc(blogPosts.updatedAt))`; id sorgusu `.limit(1)` + `?? null`).
- [ ] **Step 2: Liste sayfası** — `(protected)/blog/page.tsx` (Server Component; layout zaten `verifySession` yapıyor ama sayfa da veri çekmeden önce `await verifySession()` çağırır — DAL cache'li, bedava): başlık "Blog Yazıları" + sağda `/panel/blog/yeni`'ye `bg-forest text-warm-white` "Yeni Yazı" butonu. Yazı listesi: her satır `warm-white` kart — sol: başlık (`text-forest font-medium`) + altında `text-forest-muted text-sm` "{kategori} · {updatedAt TR tarih}"; sağ: durum rozeti (yayında: `bg-forest text-warm-white`, taslak: `border border-stone text-forest-muted` — rozet köşeleri `rounded-full px-3 py-1 text-xs`) + "Düzenle" linki (`/panel/blog/{id}/duzenle`). Liste boşsa `text-forest-muted` "Henüz yazı yok — ilk yazınızı ekleyin."
- [ ] **Step 3: Göstergeye giriş** — `(protected)/page.tsx`'teki placeholder paragrafın altına `/panel/blog`'a giden bir kart/link ekle ("Blog Yazıları — yazı oluştur, düzenle, yayınla"). Metin stili kurallara uygun.
- [ ] **Step 4: Doğrula + Commit** — dev'de `/panel/blog` giriş yapmış halde 3 göçmüş yazıyı listeler; `tsc`+lint. Commit: `feat(panel): blog liste sayfası + gösterge girişi`

---

### Task 7: Editör + yeni yazı akışı (create)

**Files:** Create: `(protected)/blog/Editor.tsx`, `(protected)/blog/PostForm.tsx`, `(protected)/blog/yeni/page.tsx`, `(protected)/blog/actions.ts` · Deps: `npm i @tiptap/react @tiptap/starter-kit @tiptap/extension-image tiptap-markdown`

**Interfaces:**
- `Editor.tsx` ("use client"): props `{ initialMarkdown: string; onChange(md: string): void }`. Tiptap `useEditor`: `StarterKit` (Link dahil — `link: { openOnClick: false }` yapılandır), `Image`, `Markdown` (tiptap-markdown; `editor.storage.markdown.getMarkdown()`). Araç çubuğu (Türkçe `aria-label`'lı düz butonlar, `type="button"`): Kalın, İtalik, Başlık (H2), Alt Başlık (H3), Madde listesi, Numaralı liste, Alıntı, Bağlantı (`window.prompt` ile URL al — sade v1), Görsel. **Görsel butonu:** gizli `<input type="file" accept="image/png,image/jpeg,image/webp">` tetikler; seçimde `fetch("/panel/blog/gorsel/", { method: "POST", body: formData })` → `{url}` → `editor.chain().focus().setImage({ src: url }).run()`; hata durumunda Türkçe uyarı satırı. Aktif biçim butonu `bg-cream` ile vurgulanır; editör gövdesi `min-h-[20rem] rounded-md border border-stone bg-warm-white p-4` + `prose` benzeri sade tipografi (`article-prose` sınıfı globals.css'te zaten var — kullan). `onUpdate`'te `onChange(getMarkdown())`.
- `PostForm.tsx` ("use client"): props `{ action: (prev: FormState, fd: FormData) => Promise<FormState>; initial?: {...tüm alanlar}; submitLabel: string; children?: ReactNode }`. `useActionState` ile alanlar: `baslik` (input; `onChange`'te slug alanı **elle değiştirilmediyse** `slugify(başlık)` ile senkron), `slug` (input, elle düzenlenebilir; düzenlenince otomatik senkron kapanır), `kategori` (input, default "Yazı"), `etiketler` (input, virgülle), `ozet` (textarea 3 satır), `icerik` (GİZLİ `<input type="hidden" name="icerik">` — Editor `onChange`'i state'e, state submit'te hidden'a), üstte `state.hata` varsa `text-forest font-semibold` mesaj. `FormState = { hata?: string }` (başarıda action redirect eder, state dönmez).
- `actions.ts` (`"use server"`): `createPost(prev, fd)` — sıra: `await verifySession()` → zod parse (`baslik` min 3, `slug` regex `^[a-z0-9]+(?:-[a-z0-9]+)*$` (boşsa `slugify(baslik)`), `kategori` default "Yazı", `etiketler` → split(",")·trim·filter, `ozet` ≤ 300, `icerik` min 1) → **benzersiz slug**: taban slug DB'de varsa `-2`, `-3`… ekle (`ilike` değil eq ile döngü) → `db.insert(blogPosts).values({ ..., status: "draft", authorStaffId: session.staffId })` → `redirect(\`/panel/blog/${id}/duzenle?kaydedildi=1\`)`. Doğrulama hatasında `{ hata: "..." }` döner (Türkçe, alan adı belirtir).

- [ ] **Step 1:** Bağımlılıkları kur; `Editor.tsx` + `PostForm.tsx` yaz.
- [ ] **Step 2:** `yeni/page.tsx` — başlık "Yeni Yazı", `<PostForm action={createPost} submitLabel="Taslak olarak kaydet" />`.
- [ ] **Step 3:** `actions.ts`'te `createPost` (yukarıdaki sözleşme birebir; `ensureUniqueSlug` iç yardımcı olarak aynı dosyada).
- [ ] **Step 4: Doğrula** — `tsc`+lint+`npm test`+build; dev'de giriş yapıp `/panel/blog/yeni`: başlık yazınca slug otomatik dolar, editörde biçimlendirme çalışır, kaydet → düzenle sayfasına düşer, `/panel/blog` listesinde "taslak" rozetiyle görünür, `/blog`'da GÖRÜNMEZ (taslak).
- [ ] **Step 5: Commit** — `feat(panel): Tiptap editörlü yeni yazı akışı (taslak oluşturma)`

---

### Task 8: Düzenleme + yayınla/taslağa çek + revalidate

**Files:** Create: `(protected)/blog/[id]/duzenle/page.tsx` · Modify: `(protected)/blog/actions.ts`

**Interfaces:**
- `actions.ts`'e eklenir:
  - `updatePost(prev, fd)` — `verifySession` → zod (create ile aynı + `id` uuid; slug değişimine izin var, benzersizlik kontrolü kendisi hariç) → `db.update(...).set({ ..., updatedAt: new Date() })` → `revalidateBlog(eskiSlug, yeniSlug)` → `redirect(...duzenle?kaydedildi=1)`.
  - `setPostStatus(fd)` — `verifySession` → `id` + hedef `durum` (`published`|`draft`); yayına alırken `publishedAt` boşsa `new Date()` yaz (ilk yayın tarihi korunur); update → `revalidateBlog(slug)` → redirect geri.
  - İç yardımcı `revalidateBlog(...sluglar: string[])`: `revalidatePath("/blog")`, her slug için `revalidatePath(\`/blog/${slug}\`)`, `revalidatePath("/")`, `revalidatePath("/sitemap.xml")` (`next/cache`).
- `duzenle/page.tsx`: `const { id } = await params`; `getPostByIdAdmin(id)` yoksa `notFound()`; `await searchParams` → `kaydedildi` varsa `text-forest-muted` "Kaydedildi." satırı. `<PostForm action={updatePost} initial={...} submitLabel="Kaydet">` + `children` olarak ayrı küçük form: durum `draft` ise "Yayınla" (`bg-forest text-warm-white`), `published` ise "Taslağa çek" (`border border-stone text-forest-muted`) — `setPostStatus`'a `id`+`durum` hidden'larıyla. Sayfa üstünde yazının durumu + yayındaysa `/blog/{slug}`'a "Sitede görüntüle" linki.

- [ ] **Step 1-2:** actions + sayfa (yukarıdaki sözleşme).
- [ ] **Step 3: Doğrula** — dev'de: Task 7'deki taslağı aç → içerik değiştir → Kaydet → "Kaydedildi."; **Yayınla** → `/blog`'da ve anasayfa "Yazılar"da anında görünür (revalidate kanıtı: yayınla SONRASI sayfayı yeniden çek), `/blog/{slug}` açılır, sitemap'te url var; **Taslağa çek** → `/blog`'dan kaybolur (detay 404). Göçmüş bir yazıyı düzenleyip başlığına ek yap → sitede yansıdığını gör.
- [ ] **Step 4: Commit** — `feat(panel): yazı düzenleme + yayınla/taslağa çek + on-demand revalidate`

---

### Task 9: Uçtan uca doğrulama + doküman güncellemesi

**Files:** Modify: `CLAUDE.md` (Blog/Haberler bölümü) — kod değişikliği beklenmez; çıkanları düzelt.

- [ ] **Step 1: Tam E2E (gerçek tarayıcı — Brave/Playwright MCP; kilitliyse controller'a BLOCKED raporla):** magic-link ile gir → `/panel/blog` → Yeni Yazı → başlık "Deneme Yazısı E2E" (+slug otomatik) → editörde kalın metin + madde listesi + **görsel yükle** (küçük bir png'yi `/tmp`'ye üret: `python3 -c` veya `sips`) → taslak kaydet → Yayınla → yeni sekmede `/blog`: yazı kapak listede; detayda görsel `/uploads/...`'tan yükleniyor ve biçimler doğru render; anasayfa "Yazılar"da ilk sırada; `/sitemap.xml` slug'ı içeriyor → panelde Taslağa çek → `/blog`'dan düştü → **test yazısını DB'den sil** (`psql` delete) + revalidate için tekrar yayın kontrolü gerekmiyor (taslakta zaten görünmez; yine de `/blog`'u bir kez daha çekip yokluğunu teyit et). Ekran görüntüsü: panel editörü + yayındaki yazı (rapora yol).
- [ ] **Step 2: Tam süit** — `npx tsc --noEmit` · `npm run lint` · `npm test` · `npm run build` (route listesi: `/blog/[slug]` SSG yolları DB'deki yayınlı yazılar; `/panel/blog*` dinamik).
- [ ] **Step 3: CLAUDE.md Blog bölümü** — "Kanonik blog `/blog`" kalır; kaynak artık **DB (`blog_posts`)**, panelden yönetilir (`/panel/blog`, paylaşımlı yetki); `content/blog/*.md` yalnız Faz 3 prod-tohum girdisi (silme + cutover'a kadar panel düzenlemeleri yerelde kalır uyarısı); `draft` yerine `status` alanı; anasayfa "Yazılar" DB'den. Görseller: dev `.uploads/` / prod Vercel Blob (`BLOB_READ_WRITE_TOKEN`).
- [ ] **Step 4: Commit** — `docs+test(faz1): E2E doğrulama; CLAUDE.md blog bölümü DB gerçekliğine güncellendi`

---

## Faz 1 Tamamlanma Kriterleri (kabul)
- [ ] 3 mevcut yazı DB'den, aynı slug/URL'lerle, içerik birebir; `content/` runtime'da okunmuyor.
- [ ] Uzman panelden görselli yazı oluşturup yayınlıyor; `/blog`, `/blog/[slug]`, anasayfa ve sitemap **yeniden deploy olmadan** güncelleniyor (revalidate).
- [ ] Taslaklar sitede asla görünmüyor; iki uzman da tüm yazıları düzenleyebiliyor.
- [ ] Upload endpoint'i oturumsuz 401; dev görseller `/uploads/`'tan, gitignore'lu.
- [ ] CI: migrate + 12+ test + sunucu-modu build hepsi yeşil (Postgres service ile).
- [ ] `tsc`/lint/build temiz; markdown çıktısı sanitize ediliyor.

## KAPSAM DIŞI (sonraki fazlar / v1.1)
Yazı SİLME (taslağa çekme yeterli — YAGNI) · kapak görseli alanı (şema hazır, UI v1.1) · SEO description alanı UI'ı (şemada var) · randevu formu DB'si (Faz 2) · Vercel/Neon/Blob token/cutover (Faz 3).

## Self-Review notu
Spec §7 (panel/blog listesi + yeni/düzenle + taslak/yayınla + paylaşımlı yetki + görsel yükleme), §8 (md→DB göçü, slug korunumu, tek kanonik route, ISR/revalidate, marked hattı) karşılanıyor. Spec'in "yayınla → ISR revalidate" maddesi `revalidatePath` setiyle; "Vercel Blob" maddesi prod-yolunda birebir, dev'de token'sız yerel disk (Faz 0'daki e-posta taşıması deseni — Faz 3'e kadar bulut hesabı gerekmez). `generateStaticParams`+SSG korunduğu için CI'ya Postgres service şart (Task 1) — bu, spec'te örtük olan "build DB okur" gerçeğinin zorunlu sonucu.
