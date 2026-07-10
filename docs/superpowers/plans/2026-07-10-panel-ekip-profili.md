# Panelden Ekip Profili + Marka Görselleri — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uzmanların profil içeriğini (bio/diploma/sertifika/alanlar/sosyal/fotoğraf) panelden düzenleyebilmesi; kamu sayfalarının tek birleşik kaynaktan okuması; `site.ts`'in içerik placeholder'larından arındırılması; 3 blog yazısına marka-uyumlu üretilmiş kapak.

**Architecture:** Yeni `expert_profiles` tablosu (içerik, `text[]` listeler, boş başlar) + saf birleştirme katmanı (`ekip.ts`: kimlik `site.experts` + içerik DB) + kapsamlı yetkili action + blog deseni `revalidatePath`. Fotoğraf: mevcut `storage.ts` altyapısı. Kapaklar: `sharp` ile deterministik kompozisyon. Spec: `docs/superpowers/specs/2026-07-10-panel-ekip-profili-design.md`.

**Tech Stack:** Next 16.2.6, Drizzle (`text().array()`), Vitest, sharp (mevcut devDep), Intl yok.

## Global Constraints
- Renk disiplini (CLAUDE.md): metin yalnız `text-forest`/`text-forest-muted`; `sage` yalnız ikon/aksan; tüm metin Türkçe; yeni npm bağımlılığı YOK.
- Yetki: profil yazma = `verifySession`→`getStaffByEmail`→ (staff.expertSlug === slug || role==="admin"); upload endpoint'i oturumsuz 401.
- `server-only`, Vitest'in doğrudan import ettiği modüllere KONMAZ (`ekip.ts`, `profil-db.ts`).
- Her commit `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` ile biter; commit öncesi `git branch --show-current` = `panel-ekip-profili` doğrulanır.
- DB testleri: Docker Postgres 5433 (`.env.local` hazır). Migration SQL'leri commit'lenir.
- Kimlik alanları (slug/name/title/shortTitle) `site.ts`'te kalır ve DEĞİŞMEZ.

---

### Task 1: DB — `expert_profiles` şeması + migration

**Files:** Modify `src/lib/db/schema.ts`; Create migration (`npm run db:generate` çıktısı); Modify `src/lib/db/schema.test.ts` (yeni test)

**Interfaces (Produces):** `expertProfiles` tablosu — TS kolonları: `id (uuid pk)`, `expertSlug (text unique notNull)`, `bio`, `credentialsLine`, `university`, `membership` (text, nullable), `degrees`, `certifications`, `areas`, `sameAs` (`text("...").array()`, nullable), `imageUrl` (text nullable), `updatedAt (timestamptz notNull defaultNow)`.

- [ ] **Step 1:** `schema.ts`'e (blogPosts'tan sonra) ekle:

```ts
export const expertProfiles = pgTable("expert_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  expertSlug: text("expert_slug").notNull().unique(),
  bio: text("bio"),
  credentialsLine: text("credentials_line"),
  university: text("university"),
  membership: text("membership"),
  degrees: text("degrees").array(),
  certifications: text("certifications").array(),
  areas: text("areas").array(),
  sameAs: text("same_as").array(),
  imageUrl: text("image_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 2:** `npm run db:generate` → üretilen `drizzle/*.sql` dosyasını incele (yalnız CREATE TABLE olmalı) → `npm run db:migrate`.
- [ ] **Step 3:** `schema.test.ts`'e test ekle (mevcut desen: yaz/oku/sil; `degrees: ["A", "B"]` dizisinin round-trip döndüğünü ve `expertSlug` unique ihlalinin hata fırlattığını assert et).
- [ ] **Step 4:** `npm test` PASS → commit: `feat(db): expert_profiles tablosu (panelden profil içeriği)`

---

### Task 2: Saf katman — `src/lib/ekip.ts`

**Files:** Create `src/lib/ekip.ts`, `src/lib/ekip.test.ts`

**Interfaces (Produces):**
- `type ProfilIcerik = { bio: string | null; credentialsLine: string | null; university: string | null; membership: string | null; degrees: string[] | null; certifications: string[] | null; areas: string[] | null; sameAs: string[] | null; imageUrl: string | null }`
- `type BirlesikProfil = { slug: string; name: string; title: string; shortTitle: string } & ProfilIcerik`
- `satirlardanListe(ham: string): string[]` — satırlara böl, trim, boşları at (form → DB)
- `listedenSatirlar(liste: string[] | null): string`(DB → form)
- `birlesikProfil(kimlik: { slug; name; title; shortTitle }, icerik: ProfilIcerik | null): BirlesikProfil` — icerik null (satır yok) ise tüm içerik alanları null
- `profiliDuzenleyebilir(staff: { expertSlug: string | null; role: "therapist" | "admin" }, slug: string): boolean`

- [ ] **Step 1 (RED):** test yaz — `satirlardanListe("a\n\n b \nc")` → `["a","b","c"]`; `satirlardanListe("")` → `[]`; `listedenSatirlar(null)` → `""`; `listedenSatirlar(["a","b"])` → `"a\nb"`; `birlesikProfil(kimlik, null)` tüm içerik null + kimlik alanları taşınmış; `birlesikProfil(kimlik, {bio:"x", ...})` içerik yansımış; `profiliDuzenleyebilir`: kendi slug'ı true, başka slug false, admin (expertSlug null bile olsa) her slug'a true.
- [ ] **Step 2 (GREEN):** modülü yaz (saf; `server-only`/DB import YOK). Dosya başı yorum: "Kimlik site.experts'ten, içerik expert_profiles'tan — birleştirme burada; alan null = kamuda gizli (eski isReady davranışının DB karşılığı)."
- [ ] **Step 3:** `npm test` PASS → commit: `feat(ekip): saf profil birleştirme + liste çeviricileri + yetki kuralı`

---

### Task 3: DB katmanı — `src/lib/profil-db.ts`

**Files:** Create `src/lib/profil-db.ts`, `src/lib/profil-db.test.ts`

**Interfaces (Produces):**
- `getProfilIcerik(slug: string): Promise<ProfilIcerik | null>` (satır yoksa null)
- `upsertProfilIcerik(slug: string, icerik: ProfilIcerik): Promise<void>` — `onConflictDoUpdate` (target: expertSlug) + `updatedAt: new Date()`
- `getTumProfiller(): Promise<Map<string, ProfilIcerik>>` — kamu liste/JsonLd için tek sorgu

- [ ] **Step 1 (RED):** test — upsert→get round-trip (diziler dahil); ikinci upsert'un güncellediğini (insert değil) assert; olmayan slug → null; `getTumProfiller` map'inde eklenen slug var. Test slug'ları `profil-test-${Date.now()}` benzersiz + finally'de sil (self-cleaning desen).
- [ ] **Step 2 (GREEN):** modülü yaz (`server-only` YOK — test doğrudan import ediyor; `db`/`expertProfiles` kullan; select kolonları `ProfilIcerik` alanlarıyla birebir).
- [ ] **Step 3:** `npm test` PASS → commit: `feat(ekip): profil içeriği DB katmanı (get/upsert/tümü)`

---

### Task 4: Kamu geçişi — sayfalar + JsonLd birleşik kaynağa, site.ts sadeleştirme

**Files:** Modify `src/lib/site.ts`, `src/app/ekip/page.tsx`, `src/app/ekip/[slug]/page.tsx`, `src/components/Team.tsx`, `src/components/JsonLd.tsx`, `docs/klinikten-gereken-veriler.md`

**Interfaces (Consumes):** Task 2-3'ün tümü.

- [ ] **Step 1:** `site.ts`: `Expert` arayüzünü `{ slug; name; title; shortTitle }`'a indir; `experts` sabitinden içerik alanlarını (credentialsLine, degrees, university, certifications, membership, image, bio, areas, sameAs ve TODO yorumlarını) sil. `isReady` fonksiyonu ve diğer her şey aynen kalır (NAP/ücret hâlâ kullanıyor).
- [ ] **Step 2:** `/ekip/[slug]/page.tsx`: `const expert = site.experts.find(...)` sonrasına `const profil = birlesikProfil(expert, await getProfilIcerik(slug));` ekle; gövdedeki `isReady(expert.X)` kalıplarını `profil.X` null-kontrolüne çevir (`const bio = profil.bio;` vb. — `filter(isReady)` yerine `profil.degrees ?? []`). Fotoğraf: `profil.imageUrl` varsa mevcut yorumlu `next/image` yuvasını (aspect-[4/5]) gerçek koda çevir (`unoptimized` prop'lu), yoksa mevcut monogram bloğu aynen. Sayfa SSG kalır (`generateStaticParams` dokunma).
- [ ] **Step 3:** `/ekip/page.tsx` ve `Team.tsx`: kart altı satır için `profil.credentialsLine` (null → gizle); fotoğraf aynı imageUrl/monogram kuralı. Liste sayfaları tek sorgu için `getTumProfiller()` kullanır (`birlesikProfil(expert, map.get(expert.slug) ?? null)`).
- [ ] **Step 4:** `JsonLd.tsx`: Person düğümleri `birlesikProfil` çıktısından (alumniOf=university, memberOf=membership, knowsAbout=areas, sameAs, image=imageUrl); alan null ise düğümden atlanır (mevcut isReady-atla davranışıyla aynı). `dataReady` kapısı DEĞİŞMEZ.
- [ ] **Step 5:** `docs/klinikten-gereken-veriler.md`: uzman içerik maddelerini "artık panelden (Profilim) giriliyor" notuyla işaretle.
- [ ] **Step 6:** Doğrula: `npx tsc --noEmit && npm run lint && npm test && npm run build` (build'de /ekip SSG üretimi DB'ye erişir — Docker ayakta). Kalıntı tarama: `grep -rn "expert\.bio\|expert\.image\|expert\.degrees" src/` → 0 eşleşme. Commit: `feat(ekip): kamu sayfaları + JsonLd birleşik profil kaynağına; site.ts içerik placeholder'ları kaldırıldı`

---

### Task 5: Panel — profil sayfaları + kayıt action'ı + nav

**Files:** Create `src/app/panel/(protected)/profil/page.tsx`, `.../profil/[slug]/page.tsx`, `.../profil/[slug]/ProfilForm.tsx`, `.../profil/actions.ts`; Modify `(protected)/layout.tsx` (nav)

**Interfaces (Consumes):** Task 2-3; `verifySession`/`getStaffByEmail`; `revalidatePath`.

- [ ] **Step 1:** `actions.ts` — `profilKaydet(_prev, formData)`: auth → `profiliDuzenleyebilir(staff, slug)` değilse Türkçe hata → zod (`slug: z.enum(site.experts slugları)`, `bio/credentialsLine/university/membership: z.string().trim().max(...)`, liste alanları ham string) → `satirlardanListe` çevirileri → `upsertProfilIcerik` → `revalidatePath("/ekip"); revalidatePath(\`/ekip/${slug}\`); revalidatePath("/");` → `{ ok: true }`. `imageUrl` bu action'da güncellenMEZ (Task 6 ayrı action: `profilFotoAyarla(slug, url | null)` aynı yetki zinciriyle).
- [ ] **Step 2:** `profil/page.tsx` — terapist: kendi slug'ına `redirect(\`/panel/profil/${staff.expertSlug}\`)` (expertSlug null + admin değil → "profil ataması yok" mesajı); admin: `site.experts` kartları (ad/unvan + Düzenle linki). `metadata.title: "Profilim"`.
- [ ] **Step 3:** `[slug]/page.tsx` — auth + `profiliDuzenleyebilir` değilse `notFound()`; `getProfilIcerik` + `listedenSatirlar` ile form başlangıç değerleri; `<ProfilForm slug initial />`. `metadata.title: "Profili Düzenle"`.
- [ ] **Step 4:** `ProfilForm.tsx` (client, `useActionState(profilKaydet)`) — alanlar: bio (textarea 6 satır), credentialsLine, university, membership (input), degrees/certifications/areas/sameAs (textarea, açıklama: "Her satıra bir madde"), Kaydet butonu, hata/`Kaydedildi` durumu; stil mevcut panel form desenleri (border-stone/bg-warm-white/text-forest).
- [ ] **Step 5:** Nav — layout'a `user` ikonlu link: href `/panel/profil`, etiket `staff?.role === "admin" ? "Profiller" : "Profilim"` (Blog'dan sonra).
- [ ] **Step 6:** Doğrula (tsc/lint/test/build + dev'de: melek kendi profiline yazar → /ekip/melek-yildiz anında güncellenir; sacide slug'ına URL ile girmeyi dener → notFound; admin ikisini görür) → commit: `feat(panel): profil düzenleme sayfaları + kayıt action'ı + nav`

---

### Task 6: Profil fotoğrafı — endpoint + form + kamu render doğrulaması

**Files:** Create `src/app/panel/(protected)/profil/gorsel/route.ts`; Modify `ProfilForm.tsx`, `actions.ts` (`profilFotoAyarla`)

- [ ] **Step 1:** `gorsel/route.ts` — blog `gorsel/route.ts`'in birebir kopyası/deseni (`readSessionCookie` 401, 4MB, ALLOWED_TYPES, `sniffImageType` otorite, `saveImage(buf, sniffedType, "profil")` — `saveImage`'ın klasör parametresi yoksa mevcut imzasına uy; dosya blog ile aynı havuza düşüyorsa sorun değil).
- [ ] **Step 2:** `actions.ts`'e `profilFotoAyarla(_prev, formData)` ekle: auth + yetki + zod (`slug` + `url: z.string()` veya boş=kaldır) → `upsertProfilIcerik` çağrısı YERİNE dar güncelleme: mevcut içeriği `getProfilIcerik` ile al, `imageUrl` değiştir, upsert et → revalidate (aynı 3 path).
- [ ] **Step 3:** `ProfilForm.tsx`'e fotoğraf bölümü: mevcut `imageUrl` önizleme (`next/image` `unoptimized`, 96×120) veya "Fotoğraf yok" kutusu; dosya seç → `/panel/profil/gorsel/`'e fetch POST (blog Editor.tsx görsel deseni) → dönen url ile `profilFotoAyarla` submit; "Fotoğrafı kaldır" butonu (url boş submit).
- [ ] **Step 4:** Doğrula (dev'de yükle → /ekip/[slug]'da `next/image` render; kaldır → monogram döner) → commit: `feat(panel): profil fotoğrafı yükleme/kaldırma`

---

### Task 7: Blog kapak görselleri — üretim script'i + dev yerleştirme

**Files:** Create `scripts/uret-blog-kapaklari.ts`

- [ ] **Step 1:** Script (sharp; CJS/IIFE deseni — `db-migrate.ts` gibi): 3 yayınlı yazının slug'ına deterministik kompozisyon üret (1200×630 PNG). Kompozisyon dili (İNSAN YÜZÜ/FİGÜRÜ YOK — spec kararı): cream (#F5F2EB) zemin; slug'dan türetilen tohumla yerleşimi değişen 2-3 yumuşak kesişen daire/yaprak-yayı (forest #1F3B2E %8-14 opaklık, sage #A6B79B %20-30, blush #D8A7A5 %15-20); sol altta ince sage hairline. SVG string'i compose edip sharp ile PNG'ye çevir (sharp SVG girdisini destekler). Çıktı: `.uploads/blog/kapak-<slug>.png` + `blog_posts.cover_image_url = "/uploads/blog/kapak-<slug>.png"` (dev DB update; `--dry-run` bayrağı yazmadan üretir).
- [ ] **Step 2:** Çalıştır (`npx tsx --env-file=.env.local scripts/uret-blog-kapaklari.ts`), üç PNG'nin oluştuğunu ve panel blog listesinde küçük resimlerin göründüğünü doğrula (dev). PNG'leri Read ile gözle kontrol et (kompozisyon makul mü).
- [ ] **Step 3:** tsc/lint/test → commit: `feat(icerik): marka-uyumlu blog kapak üretici (sharp) + dev yerleştirme`

> Prod yerleştirme (Blob upload + prod DB update + revalidate) Final aşamasında kontrolör tarafından yapılır — script `DATABASE_URL`/`BLOB_READ_WRITE_TOKEN` env'ine göre Blob'a da yükleyebilecek şekilde `--prod` bayrağı içerir: `put()` ile `@vercel/blob`… **DİKKAT: yeni bağımlılık YASAK — `@vercel/blob` zaten kurulu mu kontrol et (blog görsel yüklemesi prod'da Blob kullanıyor → `package.json`'da olmalı); değilse script yalnız dosya üretir, prod yüklemeyi kontrolör mevcut yükleme altyapısıyla (storage.ts prod dalı) yapar.**

---

## Final (kontrolör): prod migration + kapak prod yerleştirme + doğrulama + PR
1. Tam süit + canlı tarayıcı doğrulaması + ekran görüntüleri (profil formu, /ekip yenilenmiş, blog kapakları).
2. **Merge'den ÖNCE prod migration:** `npx tsx --env-file=.env.neon-prod.local scripts/db-migrate.ts` (expert_profiles prod'da oluşur; tablo boş = kamu davranışı değişmez → deploy güvenli).
3. Kapakların prod yerleştirmesi (script `--prod` ya da storage altyapısı) + prod revalidate doğrulaması.
4. Final whole-branch review (Opus) → PR → bağımsız sıfır-bağlamlı review → merge → prod verify (canlıda /ekip + blog kapakları + panel Profilim).

## Self-Review notu
Spec kararlarının tümü görevlere eşlendi (tablo→T1, birleştirme/yetki→T2, DB→T3, kamu+site.ts+JsonLd+docs→T4, panel→T5, foto→T6, kapaklar→T7, prod sıra/migration→Final). `imageUrl` iki action'a bölündü (metin kaydı vs foto) — form UX'i ve yetki zinciri aynı. T4'ün `filter(isReady)`→`?? []` çevirisi davranış-eş: placeholder yerine null gizleme.
