# Faz 2 — Randevu (Sade) · Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Randevu formunu `public/randevu.php`'den Server Action'a taşımak: talep artık kaybolmaz (`appointment_requests` tablosuna yazılır, KVKK rızası zaman+IP damgalı), ilgili uzman(lar)a e-posta bildirimi gider (dev: konsol / prod: Resend), form görsel olarak **birebir aynı** kalır. Panel talep ekranı YOK (spec §2 kararı — v1.1'e ertelendi); e-posta, talebi öğrenmenin tek yolu.

**Architecture:** PHP'nin tüm korumaları Server Action'a devralınır: honeypot sessiz-başarı, alan doğrulamaları (zod), KVKK zorunluluğu, IP yakalama (`x-forwarded-for`). Yeni: DB-sayımlı IP hız limiti (magic-link limiter deseni) ve staff-tablosundan alıcı türetme (`farketmez` → iki uzman). E-posta gönderim hatası talebi DÜŞÜRMEZ (PHP'deki "başvuru kaybolmaz" ilkesi: DB'ye yazıldıysa redirect edilir, hata console.error'a). Apache-dönemi artıkları (`randevu.php`, `.htaccess`) repo'dan silinir — canlı (donuk) GoDaddy kopyaları etkilenmez.

**Tech Stack:** Mevcut yığın; yeni bağımlılık YOK (zod v4, drizzle, Resend REST hattı hazır).

## Global Constraints

- **Commit trailer:** her commit `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` ile biter.
- **Bu fazın action'ı KAMUSAL** — `verifySession` bilinçli olarak YOKTUR (hasta formu). Koruma katmanları: honeypot + zod + IP hız limiti. Bunu action dosyasında yorumla belgelendir.
- **`AppointmentForm`'un görsel tasarımı DEĞİŞMEZ:** markup/sınıflar birebir korunur; yalnız form kablolaması (`"use client"` + `useActionState`), hata satırı ve pending durumu eklenir. Renk disiplini: hata satırı `text-forest font-semibold` (kart cream zemin); forest zemindeki sol sütuna dokunulmaz.
- **Next 16:** `headers()` Promise (`await`). `redirect()` try/catch içine alınmaz (NEXT_REDIRECT throw'la yayılır).
- **`server-only` yalnız Vitest'in doğrudan import ETMEDİĞİ dosyalarda** (Faz 0 kuralı). `src/lib/randevu.ts` (saf şema) ve `src/lib/randevu-db.ts` (test edilir) → server-only YOK; `email/send.ts` zaten server-only.
- Tüm kullanıcı metinleri Türkçe; PHP'deki hata mesajları birebir taşınır (ör. "Lütfen geçerli bir telefon numarası girin.").
- DB-dokunan testler kendi satırlarını ekler/siler ve `client.end()` ile kapanır (mevcut kalıp).
- **Yürütme ön-koşulu:** Docker Postgres ayakta, `.env.local` mevcut, `npm test` 22/22 yeşil.

## Dosya haritası

```
src/lib/randevu.ts + randevu.test.ts          (yeni: saf zod şeması + uzman seçenekleri — TDD)
src/lib/randevu-db.ts + randevu-db.test.ts    (yeni: createAppointmentRequest, isRandevuRateLimited, getBildirimAlicilari — TDD)
src/lib/email/send.ts                          (değişir: sendAppointmentNotification eklenir)
src/app/randevu/actions.ts                     (yeni: randevuTalebiGonder server action)
src/components/AppointmentForm.tsx             (değişir: "use client" + useActionState kablolaması; markup aynı)
public/randevu.php · public/.htaccess          (SİLİNİR — Apache-dönemi artıkları)
CLAUDE.md                                      (Randevu bölümü yeni gerçekliğe — Task 5)
```

---

### Task 1: Saf doğrulama şeması (`src/lib/randevu.ts`) — TDD

**Interfaces (binding):**
- `UZMAN_SECENEKLERI: Record<string, string>` — `{ "melek-yildiz": "Psk. Dan. Melek Yıldız", "sacide-sahin": "Kl. Psk. Sacide Şahin", "farketmez": "Farketmez" }` (PHP'deki `$uzmanLabels` birebir).
- `randevuSchema` (zod): `ad` string trim min 2 ("Lütfen adınızı girin.") · `telefon` regex `/^[0-9\s\-\+\(\)]{10,20}$/` ("Lütfen geçerli bir telefon numarası girin.") · `email` `z.email()` ("Lütfen geçerli bir e-posta adresi girin.") · `uzman` `z.enum(["melek-yildiz","sacide-sahin","farketmez"])` ("Lütfen bir uzman seçin.") · `tarih` string optional (boş "" kabul) · `mesaj` string trim max 2000 optional ("Mesaj en fazla 2000 karakter olabilir.") · `kvkk` — formdan "on" gelir; `z.literal("on")` ("Devam etmek için KVKK aydınlatma metnini onaylamanız gerekir.").
- `type RandevuGirdisi = z.infer<typeof randevuSchema>`.
- Dosya SAF: yalnız zod import eder (server-only/db YOK — hem test hem action kullanır).

**Steps:** (1, RED) `randevu.test.ts`: geçerli tam girdi parse olur; telefon "0555 123 45 67" ✓, "abc" ✗, 9 hane ✗, 21 karakter ✗; kvkk yokken ✗ ve doğru Türkçe mesaj; mesaj 2001 karakter ✗; uzman "baska" ✗; tarih/mesaj boşken ✓. (2) Çalıştır → FAIL. (3, GREEN) `randevu.ts` yaz. (4) `npm test` tümü yeşil. (5) Commit: `feat(randevu): saf zod doğrulama şeması (PHP kuralları birebir)`

---

### Task 2: DB katmanı (`src/lib/randevu-db.ts`) — TDD

**Interfaces (binding):**
- `createAppointmentRequest(girdi: RandevuGirdisi, ip: string): Promise<{ id: string }>` — eşleme: `patientName=ad`, `patientPhone=telefon`, `patientEmail=email`, `expertSlug = uzman === "farketmez" ? null : uzman`, `preferredNote` = `"Tercih edilen tarih: {tarih||'belirtilmedi'}\n\nMesaj:\n{mesaj||'(mesaj girilmedi)'}"` (PHP gövdesindeki kompozisyon), `kvkkConsent: true`, `consentAt: new Date()`, `consentIp: ip`. `status` default'u ("new") şemadan gelir.
- `isRandevuRateLimited(ip: string): Promise<boolean>` — son **30 dakikada** aynı `consentIp` ile **5+** kayıt varsa true (magic-token limiter deseni; `count()` + `gt(createdAt, ...)`).
- `getBildirimAlicilari(expertSlug: string | null): Promise<string[]>` — `staff` tablosundan: slug doluysa o uzmanın e-postası; null (farketmez) ise TÜM staff e-postaları. Boş dönerse action console.error basar ama talebi düşürmez. (Not: `site.email` placeholder olduğundan alıcılara EKLENMEZ; gerçek info@ cutover'da eklenebilir — Faz 3 notu.)

**Steps:** (1, RED) `randevu-db.test.ts`: create→satır DB'de doğru alanlarla (farketmez→null dahil), sonra sil; limiter: sentetik IP ile 5 kayıt ekle → true, farklı IP → false, temizle; alıcılar: seed'li staff'a göre slug→1 adres, null→2 adres (seed e-postaları `melek@example.com`/`sacide@example.com`). `afterAll` → `client.end()`. (2) FAIL. (3, GREEN) uygula. (4) tümü yeşil. (5) Commit: `feat(randevu): DB katmanı — talep kaydı, IP hız limiti, bildirim alıcıları`

---

### Task 3: Bildirim e-postası (`src/lib/email/send.ts`'e ek)

**Interfaces (binding):**
- `sendAppointmentNotification(to: string[], replyTo: string, ozet: { ad; telefon; email; uzmanEtiketi; tarih; mesaj; ip; tarihDamgasi }): Promise<void>` — `RESEND_API_KEY` boşken konsola `[DEV randevu-bildirim] → {to.join(", ")}` + gövde basar; doluyken Resend REST'e POST (`from`: mevcut `FROM` sabiti, `to`, `reply_to: replyTo` — hasta adresine tek tıkla yanıt, PHP'deki Reply-To davranışı). Konu: `Yeni Randevu Başvurusu — {ad}`. Gövde: PHP'deki düz-metin şablon birebir (alanlar + "KVKK aydınlatma metni onayı: evet ({tarihDamgasi})" + "Başvuru IP: {ip}").

**Steps:** (1) Mevcut `send.ts`'i oku; fonksiyonu aynı desenle ekle (fetch, `!res.ok` → throw). (2) `npx tsc --noEmit` + lint. (3) Commit: `feat(randevu): uzmanlara bildirim e-postası (dev konsol / prod Resend, Reply-To hasta)`

---

### Task 4: Server Action + form kablolaması

**Interfaces (binding):**
- `src/app/randevu/actions.ts` (`"use server"`): `export type RandevuFormState = { hata?: string }` · `randevuTalebiGonder(prev, fd): Promise<RandevuFormState>`. Sıra:
  1. **Honeypot:** `fd.get("website")` doluysa hiçbir yan etki olmadan `redirect("/randevu/tesekkurler/")` (bot başarı sanır — PHP davranışı).
  2. zod parse (alan sırayla ilk hata mesajı döner: `{ hata }`).
  3. IP: `(await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "bilinmiyor"`.
  4. `isRandevuRateLimited(ip)` → true ise `{ hata: "Çok sayıda deneme algılandı. Lütfen bir süre sonra tekrar deneyin ya da bizi telefonla arayın." }` (sessiz düşürme YOK — gerçek hasta kaybetmeyelim).
  5. `createAppointmentRequest(girdi, ip)`.
  6. Alıcılar + `sendAppointmentNotification` — **try/catch içinde**: hata olursa `console.error("[randevu] bildirim gönderilemedi:", e)` ve AKIŞ DEVAM eder (talep DB'de; kaybolmaz ilkesi). `redirect` bu try'ın DIŞINDA.
  7. `redirect("/randevu/tesekkurler/")`.
  - Dosya başına yorum: bu action kamusal; koruma = honeypot + zod + IP limiti; verifySession bilinçli yok.
- `AppointmentForm.tsx`: başına `"use client"`; `useActionState(randevuTalebiGonder, {})`; `<form action={action}>`; submit butonu `disabled={pending}` + metin `pending ? "Gönderiliyor…" : "Randevu Talebini Gönder"`; `state.hata` varsa butonun ÜSTÜNDE `<p className="text-sm font-semibold text-forest">{state.hata}</p>`. Honeypot bloğu, tüm alan adları (`ad/telefon/email/uzman/tarih/mesaj/kvkk/website`) ve TÜM mevcut sınıflar/markup aynen kalır; `action="/randevu.php" method="post"` kaldırılır. (Sunucu bileşeniyken içerdiği `Link` importu client'ta da çalışır — dokunma.)

**Steps:** (1) actions.ts yaz. (2) Formu kablola. (3) `tsc` + lint + `npm test` + `npm run build`. (4) Dev doğrulama (curl, `$ACTION_*` replay — teknik önceki task raporlarında): happy path (uzman=melek-yildiz) → 303 tesekkurler + DB satırı + konsolda `[DEV randevu-bildirim] → melek@example.com`; `uzman=farketmez` → alıcı listesi iki adres; honeypot dolu → 303 ama DB satırı YOK; kvkk'sız → `{hata}` KVKK mesajı; aynı IP 6. istek → hız limiti mesajı. Test satırlarını psql ile temizle. (5) Commit: `feat(randevu): form Server Action'a geçti — DB kaydı + uzman bildirimi (PHP korumaları devralındı)`

---

### Task 5: Apache-dönemi temizliği + dokümanlar

**Steps:** (1) `git rm public/randevu.php public/.htaccess` — gerekçe: ikisi de yalnız GoDaddy/Apache statik barındırmasında anlamlıydı; form artık Server Action, log-koruma bloğunun koruduğu dosya artık yazılmıyor; canlı (donuk) sitedeki sunucu kopyaları bu silmeden ETKİLENMEZ. (2) CLAUDE.md "Randevu formu (geçiş dönemi)" maddesini yeni gerçekliğe yaz: form Server Action → `appointment_requests` + staff'a e-posta (dev konsol/prod Resend); KVKK rızası DB'de zaman+IP damgalı; honeypot+zod+IP-limit; panel talep ekranı v1.1; canlı GoDaddy formu cutover'a kadar eski PHP ile sunucuda çalışmaya devam eder. (3) `npm run build` (public silmeleri sorun çıkarmamalı) + tümü yeşil. (4) Commit: `chore(randevu): Apache-dönemi artıkları (randevu.php, .htaccess) kaldırıldı + CLAUDE.md güncel`

---

### Task 6: Production E2E + tarayıcı smoke

**Steps:** (1) `npm run build && npm run start` (log dosyasına). (2) Curl replay ile Task 4'teki beş senaryoyu PRODUCTION sunucuda tekrarla (dev'e güvenme — Faz 1 dersi). (3) Gerçek tarayıcı (Brave/Playwright MCP): anasayfa `#randevu` formunu gerçekten doldur-gönder → `/randevu/tesekkurler/`'e iniş; KVKK işaretlemeden gönder → tarayıcının HTML5 engeli; ekran görüntüsü (form + teşekkür). (4) DB test satırları + varsa artık temizliği; sunucu kapat, port boş. (5) Rapor + commit yok (kod değişikliği beklenmez; çıkan bulgu varsa BLOCKED raporla).

---

## Faz 2 Tamamlanma Kriterleri (kabul)
- [ ] Form birebir aynı görünüyor; gönderim `appointment_requests`'e yazıyor (KVKK: consent + zaman + IP).
- [ ] Seçili uzmana (farketmez'de ikisine) bildirim gidiyor (dev: konsol kanıtı); Reply-To hasta adresi.
- [ ] Honeypot sessiz-başarı (DB'ye yazmadan); IP başına 30 dk'da 5 talep limiti dostane Türkçe hatayla.
- [ ] E-posta gönderimi başarısız olsa bile talep kaybolmuyor (DB'de + redirect).
- [ ] `randevu.php`/`.htaccess` repo'dan silindi; canlı donuk site etkilenmedi (dokunulmadı).
- [ ] Production sunucuda uçtan uca kanıtlı; 26+ test / tsc / lint / build / CI yeşil.

## KAPSAM DIŞI
Panel `/panel/talepler` ekranları (v1.1 — spec kararı) · hastaya onay e-postası · SMS/WhatsApp · KVKK/gizlilik metin güncellemesi (Faz 3 cutover'la birlikte — yeni form prod'a o zaman çıkıyor) · `site.email`'in alıcılara eklenmesi (gerçek veri girilince).

## Self-Review notu
Spec §6 (hasta akışı: alanlar, doğrulama, honeypot, IP rate-limit, e-posta başlık-enjeksiyonu → Resend JSON gövdesiyle sınıf olarak ortadan kalkıyor + CRLF'e izin veren serbest alan yok, tesekkurler redirect) ve §9 (bildirim: uzmana; panel linki YOK çünkü ekran v1.1) karşılanıyor. §4'ün "randevu.php + .htaccess kaldırılır" maddesi bu fazda yapılıyor (canlı site donuk olduğundan güvenli). PHP'nin `-f` zarf-göndereni/DMARC cambazlığına gerek kalmıyor — Resend kendi domain'inden (bildirim.ozsaye.com, Faz 3'te SPF/DKIM) gönderecek.
