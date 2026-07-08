# Faz 3 — Cutover · Uygulama Planı (3a: kod hazırlığı + 3b: canlıya alma runbook'u)

> **For agentic workers:** Faz **3a** tasks use superpowers:subagent-driven-development (checkbox steps, fresh implementer+reviewer per task, PR + bağımsız review + merge — önceki fazların pipeline'ı). Faz **3b** bir SDD dizisi DEĞİL: kullanıcı-katılımlı, canlı sistemleri (Vercel/Neon/Resend/GoDaddy DNS) değiştiren bir **runbook**tur; adım adım, "SEN"/"BEN" işaretli, her adımda doğrulama kapısı ve geri-dönüş ile yürütülür.

**Goal:** Uygulamayı GoDaddy statik barındırmadan **Vercel + Neon + Resend + Blob**'a taşımak; blog & randevu verisini prod DB'ye tohumlamak; `ozsaye.com` web trafiğini Vercel'e yönlendirmek — **`info@ozsaye.com` e-postası (MX) kesinlikle bozulmadan**; ve bunu yaparken önce hesap gerektirmeyen tüm kod hazırlığını (yasal metinler, hata sınırı, birikmiş sertleştirmeler) bitirip merge etmek.

**Architecture:** Faz 0–2'nin ürettiği sunucu-modu Next.js uygulaması Vercel'de çalışır (Fluid Compute, Node runtime). DB: Neon Postgres (Vercel Marketplace) — sürücü mevcut `postgres.js`, **prod'da Neon'un pooled (`-pooler`) connstring'i** kullanılır (kod değişikliği yok). E-posta: Resend, gönderen alt-alan `bildirim.ozsaye.com` (SPF/DKIM orada; kök alanın M365 mail teslimatına dokunmaz). Görsel: Vercel Blob. DNS: GoDaddy sağlayıcı olarak **kalır**; yalnız web kaydı (`@`/`www`) Vercel'e döner → **MX/e-posta kayıtları ellenmez**.

## Global Constraints (Faz 3a kod işleri için)
- **Commit trailer:** `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Tüm arayüz/metin Türkçe; renk disiplini (yalnız `text-forest`/`text-forest-muted`; `sage` aksan).
- **Yasal metin (KVKK/gizlilik) hukuki tavsiye DEĞİLDİR:** yalnız sistemin FİİLEN yaptığını doğru/dürüst betimler; **klinik/hukuk incelemesi zorunlu** olacak şekilde işaretlenir; uydurma hukuki taahhüt/süre yok — saklama süresi gibi değerler klinik tarafından doldurulacak placeholder kalır.
- `dataReady=false` ve noindex bu fazda DEĞİŞMEZ (gerçek NAP verisi ayrı, kullanıcı-bağımlı bir iş; bkz. `docs/klinikten-gereken-veriler.md`).
- Test/doğrulama: `tsc`/lint/`npm test`/`npm run build` yeşil; DB-dokunan testler kendi satırını ekler-siler (CI seed'siz — Faz 2 dersi).

---

# FAZ 3a — Cutover Hazırlığı (kod; hesap gerektirmez)

### 3a-T1: Kök hata sınırı (Türkçe `error.tsx` + `global-error.tsx`)

**Neden:** Bağımsız review'lar iki kez işaret etti — uygulamada hiçbir `error.tsx` yok; DB kesintisi/beklenmedik hata Next'in İngilizce jenerik hata sayfasını gösteriyor. Randevu action'ı (`createAppointmentRequest`) bilinçli olarak try/catch'siz; prod'da geçici bir DB hıçkırığı hastaya İngilizce çökme sayfası gösterir.

**Files:** Create: `src/app/error.tsx` (`"use client"`), `src/app/global-error.tsx` (`"use client"`).

- [ ] **Step 1:** `error.tsx` — segment hata sınırı: sakin, marka-uyumlu Türkçe sayfa ("Bir şeyler ters gitti", kısa açıklama, "Tekrar dene" butonu `reset()` çağırır, ana sayfaya dön linki). Kök layout'un chrome'u (Header/Footer) sarmaladığından bu, chrome içinde render olur — SiteChrome'a dokunma. Renk/tipografi kurallarına uy (`bg-cream`, `text-forest`/`text-forest-muted`, `font-display`).
- [ ] **Step 2:** `global-error.tsx` — kök layout'un kendisi patlarsa devreye girer; kendi `<html lang="tr"><body>`'sini render eder (layout yok), minimal Türkçe mesaj + yenile. (Next 16 gereği global-error kendi html/body'sini içerir.)
- [ ] **Step 3:** Doğrula — `tsc`/lint/`build`; dev'de `/` üzerinde bir sayfaya kasıtlı `throw` enjekte edip (geçici) error.tsx'in Türkçe göründüğünü gör, sonra geri al. Commit: `feat(hata): Türkçe kök error.tsx + global-error.tsx sınırları`

---

### 3a-T2: KVKK aydınlatma + gizlilik metinlerini randevu-verisi gerçekliğine güncelle

**Neden:** Form artık hasta kişisel verisini (ad/telefon/e-posta/mesaj + KVKK rızası) DB'ye yazıyor. Mevcut metinler (statik-PHP dönemi) bunu yansıtmıyor. Cutover'da yeni form prod'a çıkmadan önce metinler FİİLİ işlemeyi doğru anlatmalı.

**Files:** Modify: `src/app/kvkk-aydinlatma-metni/page.tsx`, `src/app/gizlilik-politikasi/page.tsx`.

- [ ] **Step 1:** İki sayfayı tam oku. Mevcut yapı/stil/bileşen desenini koru.
- [ ] **Step 2:** KVKK aydınlatma metnine, sistemin FİİLEN yaptığını betimleyen bölüm(ler) ekle/güncelle: (a) toplanan veriler (ad, telefon, e-posta, tercih edilen uzman/tarih, mesaj); (b) işleme amacı (randevu talebinin değerlendirilmesi/iletişim); (c) **açık rızanın zaman + IP damgasıyla kayıt altına alındığı**; (d) verinin güvenli bir veritabanında tutulduğu, erişimin yalnız yetkili uzmanlarla sınırlı olduğu; (e) saklama süresi — **klinik tarafından doldurulacak placeholder** (ör. "[DOLDUR: ör. 12 ay]"); (f) ilgili kişi hakları (erişim/silme/düzeltme) + başvuru kanalı (`site.email`; `isReady()` ile koşullu). Uydurma süre/tüzel kişi yazma; tüzel kişi `site.legalName` (placeholder ise `isReady` ile gizle).
- [ ] **Step 3:** Gizlilik politikasını da tutarlı hale getir (randevu verisi saklama + rıza kaydı bahsi). Çelişen eski ifadeleri düzelt.
- [ ] **Step 4:** Sayfaların üstüne (yorum + görünür küçük bir not değil — yalnız kod yorumu) **"KLİNİK/HUKUK İNCELEMESİ GEREKLİ, go-live öncesi"** işareti koy. `tsc`/lint/`build`. Commit: `docs(kvkk): aydınlatma+gizlilik metinleri randevu-verisi saklama gerçekliğine güncellendi (klinik incelemesine tabi)`

> **Not:** Bu görev metin/JSX üretir; hukuki metnin nihai onayı Faz 3b'de klinikten alınır. İçerik dürüst/muhafazakâr olmalı, sistemin yapmadığı bir şeyi vaat etmemeli.

---

### 3a-T3: Birikmiş sertleştirmeler + KVKK saklama-temizlik script'i

**Files:** Modify: `src/lib/randevu.ts` (ad üst sınır), `src/app/panel/(protected)/blog/actions.ts` (blog başlık/içerik üst sınır), `src/lib/randevu-db.ts` (boş-alıcı fallback) · Create: `scripts/purge-old-requests.ts` + `src/lib/randevu-db.ts`'e `purgeOldRequests(gunSayisi)` (TDD).

- [ ] **Step 1 (hardening):** `randevu.ts`: `ad`'a `.max(120, ...)` (Türkçe mesaj); PHP'de yoktu ama kamusal endpoint için makul üst sınır. `blog/actions.ts`: `baslik`'a `.max(200)`, `icerik`'e makul üst sınır (ör. `.max(50000)`) — Türkçe mesajlarla. (Mevcut testler geçmeli; gerekiyorsa sınır testleri ekle.)
- [ ] **Step 2 (boş-alıcı fallback):** `getBildirimAlicilari`: seçili slug'a eşleşen staff yoksa (veri kayması) boş dizi yerine **tüm terapistlere** düş; hâlâ boşsa boş döner (action zaten console.error basıyor). Yorumla belgele. Test ekle (sentetik: olmayan slug → terapist fallback).
- [ ] **Step 3 (saklama-temizlik, TDD):** `purgeOldRequests(gunSayisi: number): Promise<number>` — `appointment_requests`'te `created_at < now - gunSayisi gün` olanları siler, silinen sayıyı döner. `scripts/purge-old-requests.ts` bunu env/arg'dan gün alıp çağırır (varsayılan 365; Faz 3b'de Vercel Cron'a bağlanır). Test: sentetik eski + yeni satır ekle → purge yalnız eskiyi siler; temizle. (KVKK veri minimizasyonu.)
- [ ] **Step 4:** `tsc`/lint/`npm test` (yeni testlerle) + `build`. Commit: `feat(randevu): alan üst sınırları, boş-alıcı terapist fallback, KVKK saklama-temizlik script'i`

---

### 3a-T4: Vercel/Neon hazırlık dokümanı + production smoke + final

**Files:** Create: `docs/vercel-deploy-rehberi.md` · Modify: `.env.local.example` (prod env yorumları).

- [ ] **Step 1:** `docs/vercel-deploy-rehberi.md` — Faz 3b runbook'unun teknik eki: gereken prod env değişkenleri tam listesi (`DATABASE_URL` = **Neon pooled** `-pooler` connstring; `SESSION_SECRET` = `openssl rand -base64 32`; `APP_URL` = `https://ozsaye.com`; `RESEND_API_KEY`; `BLOB_READ_WRITE_TOKEN`; `SEED_STAFF` = gerçek uzman e-postaları), her birinin nereden alınacağı, ve "postgres.js + Neon pooler → `max:10` sorun değil" notu.
- [ ] **Step 2:** `.env.local.example`'a prod-only değişkenler için açıklayıcı yorumlar (BLOB_READ_WRITE_TOKEN, SEED_STAFF) ekle (değerler boş).
- [ ] **Step 3 (production smoke — regresyon):** `npm run build && npm run start`; gerçek tarayıcıda hızlı geçiş: anasayfa açılıyor, `/blog` + bir yazı, `/panel/giris` → magic-link (konsol) → panel, randevu formu gönder → tesekkurler + DB satırı. Faz 1+2'nin main'de birlikte hâlâ sağlam olduğunu teyit (sadece bu dalın kod eklemeleriyle). Sunucu kapat, port boş, test satırı temizle.
- [ ] **Step 4:** `tsc`/lint/`npm test`/`build` yeşil. Commit: `docs(deploy): Vercel/Neon cutover teknik rehberi + prod env dokümanı`

---

## Faz 3a — sonra: Final pipeline
Whole-branch review (Opus) → PR (base main) → CI yeşil → **bağımsız sıfır-bağlamlı PR review** (global CLAUDE.md kuralı) → bulgu triage/düzelt → merge. (Önceki iki fazın aynısı.)

## Faz 3a Tamamlanma Kriterleri
- [ ] Türkçe `error.tsx` + `global-error.tsx`; kasıtlı hata İngilizce jenerik sayfa yerine Türkçe gösteriyor.
- [ ] KVKK/gizlilik metinleri randevu-verisi saklamayı dürüstçe anlatıyor; klinik-inceleme işaretli; uydurma hukuki taahhüt yok.
- [ ] Alan üst sınırları; boş-alıcı terapist fallback (testli); `purgeOldRequests` (testli) + script.
- [ ] Vercel deploy rehberi + prod env listesi hazır.
- [ ] `tsc`/lint/test/build/CI yeşil; production smoke temiz.

---

# FAZ 3b — Cutover Runbook (kullanıcı + Claude birlikte; canlı sistemler)

> **Bu bir SDD dizisi değildir.** Sırayla, her adımda doğrulama kapısıyla yürütülür. **En kritik güvenlik rayı: `info@ozsaye.com` e-postasının MX kayıtları asla bozulmamalı.**

## Ön koşul: kullanıcıdan gerekenler (BEN isteyeceğim, SEN sağlayacaksın)
1. **Gerçek 2 uzman e-postası** (panel girişi + bildirim alıcısı) — WhatsApp sorusu #4.
2. **Vercel hesabı** (GitHub ile giriş; repo'yu import edeceğiz) — ücretli kullanım → Pro (~$20/ay) ticari uyum.
3. **GoDaddy DNS paneli erişimi** (web kaydını döndürmek + Resend SPF/DKIM TXT eklemek için).
4. **Resend hesabı** (`bildirim.ozsaye.com` alt-alanını doğrulayacağız).
> Bu erişimler için interaktif login gerektiğinde, oturumda `! <komut>` ile kendin çalıştırırsın (ör. `! vercel login`), çıktı buraya düşer.

## Adım 0 — **MX gerçeğini DOĞRULA (dokunmadan önce)**
- **BEN:** `dig +short MX ozsaye.com` ve `dig +short TXT ozsaye.com` (mevcut SPF) çalıştırırım. **Kritik:** Kayıtlarda hangi sağlayıcı olduğunu (Microsoft 365 → `*.mail.protection.outlook.com`, veya GoDaddy/secureserver) canlıdan teyit ederiz. (Not: eski bir teşhiste kutu **Microsoft 365** görünüyordu; kullanıcı "GoDaddy" dedi — **canlı DNS neyse o geçerli**, ikisine de güvenme.) Bu MX + mevcut mail TXT'leri bir yere yazarız; cutover boyunca **değişmeyecek referans** budur.

## Adım 1 — Neon (DB)
- **BEN/SEN:** Vercel Marketplace'ten Neon provision (veya Neon'da proje). Prod DB + **pooled** connstring al. Vercel env'e `DATABASE_URL` (pooled) gir.
- **BEN:** `drizzle-kit` migration'ları prod DB'ye uygula; `blog` göç script'ini (`scripts/migrate-blog-to-db.ts`) prod DB'ye karşı çalıştır (3 yazı tohumlanır); `SEED_STAFF` = gerçek e-postalarla `scripts/seed-staff.ts`.
- **Kapı:** prod DB'de 4 tablo + 2 gerçek staff + 3 blog yazısı; başka veri yok.

## Adım 2 — Resend (e-posta) + DNS TXT
- **SEN/BEN:** Resend hesabı; `bildirim.ozsaye.com` alt-alanını ekle → Resend, GoDaddy'ye eklenecek **SPF/DKIM/(DMARC) TXT** kayıtlarını verir.
- **SEN:** Bu TXT'leri GoDaddy DNS'e ekle (alt-alan; **kök MX'e DOKUNMA**). `RESEND_API_KEY`'i Vercel env'e gir.
- **Kapı:** Resend panelinde `bildirim.ozsaye.com` "verified"; test bildirimi bir uzman kutusuna düşüyor. **Kök `ozsaye.com` MX hâlâ Adım 0'daki gibi.**

## Adım 3 — Vercel'e deploy (henüz DNS yok)
- **SEN:** Vercel'de repo'yu import et (framework: Next.js otomatik). Tüm env değişkenlerini gir (`vercel-deploy-rehberi.md` listesi): `DATABASE_URL`(pooled), `SESSION_SECRET`, `APP_URL=https://ozsaye.com`, `RESEND_API_KEY`, `BLOB_READ_WRITE_TOKEN` (Blob store oluştur), `SEED_STAFF`.
- **BEN/SEN:** Preview/prod deploy → Vercel'in verdiği `*.vercel.app` URL'inde uçtan uca doğrula: anasayfa, blog, **panel giriş magic-link'i gerçek e-postayla** (Resend prod), randevu formu → DB + bildirim. Blob'a görsel yükleme.
- **Kapı:** `*.vercel.app` üzerinde her şey çalışıyor — DNS'e hiç dokunmadan. `info@ozsaye.com` etkilenmedi (hiç dokunulmadı).

## Adım 4 — DNS repoint (**yalnız web; MX korunur**)
- **SEN (BEN yanında):** GoDaddy DNS'te **yalnız** `@` (A → Vercel `76.76.21.21`) ve `www` (CNAME → Vercel) kayıtlarını güncelle. Vercel'de `ozsaye.com` + `www` domain'ini ekle (Vercel tam kayıtları söyler). **MX ve mevcut mail TXT'lerine DOKUNMA.**
- **BEN:** Yayılım sonrası `dig ozsaye.com`, `dig www.ozsaye.com` (Vercel'i gösteriyor mu) **ve** `dig MX ozsaye.com` (Adım 0'la BİREBİR AYNI mı) doğrula.
- **Kapı:** `https://ozsaye.com` Vercel'i sunuyor; **`dig MX` değişmemiş**; bir test e-postası `info@ozsaye.com`'a hâlâ ulaşıyor (SEN kutudan teyit).

## Adım 5 — Emeklilik + temizlik
- **BEN:** `deploy-godaddy.yml` workflow'unu sil (artık gereksiz); `docs/godaddy-deploy-rehberi.md`'yi arşiv/emekli işaretle. (Repo'da `randevu.php` zaten yok.)
- **SEN (opsiyonel):** GoDaddy hosting/статik dosyalar bir süre yedek kalabilir; DNS Vercel'de kaldıkça görünmez.
- **BEN:** Vercel Cron → `purgeOldRequests` (KVKK saklama) bağla.

## Geri dönüş (rollback)
- Herhangi bir adımda sorun → **DNS'i eski A/CNAME değerine geri al** (GoDaddy statik yeniden sunar). MX zaten hiç değişmediği için e-posta her hâlükârda etkilenmez. Neon/Resend/Vercel bağımsız kalır; kod main'de güvende.

## Faz 3b Tamamlanma Kriterleri
- [ ] `https://ozsaye.com` Vercel'de canlı; blog paneli + randevu formu prod'da çalışıyor; magic-link gerçek e-postayla geliyor.
- [ ] **`info@ozsaye.com` e-postası çalışmaya devam ediyor** (MX değişmedi, kutu testiyle teyitli).
- [ ] Prod DB gerçek staff + göçmüş blog; bildirimler gerçek uzman kutularına düşüyor.
- [ ] FTP deploy workflow emekli; KVKK saklama-temizliği zamanlanmış.
- [ ] (Ayrı/kullanıcı işi) gerçek NAP verisi girilip `dataReady=true` → site indekslenebilir olur.

## Self-Review notu
Spec §4/§8/§9/§10/§11 bu planla karşılanıyor. 3a, spec'in cutover'dan bağımsız kod parçalarını (hata sınırı, KVKK metin gerçekliği, saklama-temizlik, alan sınırları) önceden merge eder; 3b, spec §11 cutover adımlarını **MX-korumalı, geri-dönüşlü** bir runbook'a döker. Faz 0'da netleşen "GoDaddy DNS kalır, yalnız web repoint" kararı Adım 4'ün temeli; Adım 0'ın canlı-MX doğrulaması, eski teşhis (M365) ile kullanıcı ifadesi (GoDaddy) arasındaki çelişkiyi cutover anında kesinleştirir.
