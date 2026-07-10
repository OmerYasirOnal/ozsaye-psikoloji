# Öz & Saye Psikoloji — Uzman Paneli · Randevu Talep Sistemi · Blog Yazımı
## Tasarım Dokümanı (Spec)

- **Tarih:** 2026-07-06
- **Durum:** Onaylandı (yön + randevu modeli + barındırma kararları kullanıcı onaylı)
- **Dal:** `uzman-paneli-randevu-blog-platformu` (taban: `origin/main` = gerçek güncel trunk)
- **Bağlam:** Klinik işi profesyonelleştiriyor. İstenen: 2 uzmanın kullanacağı login'li panel + gerçek (kayıt altına alınan) randevu talep sistemi + uzmanların site içinden blog yazabilmesi.

### Referans gerçeği
Klinik "profesyonel örnek" olarak `butunculpsikoloji.com` ve `diyetisyenhale.com`'u paylaştı. İkisi de şık tanıtım sitesi + blog + bir randevu/iletişim formu; **login, hasta paneli, doktor paneli veya canlı takvim yok**. Yani hedef ağır bir SaaS değil: sağlam bir tanıtım sitesinin üstüne (a) uzmanların iş takibi yapabildiği hafif bir arka-ofis ve (b) uzmanların kendi blog yazılarını yazabilmesi.

---

## 1. Amaç
1. Randevu talepleri artık kaybolmasın: DB'de tutulsun, uzman panelinden durumuyla (yeni → arandı → planlandı → tamam/iptal) yönetilsin.
2. 2 uzmana login'li **arka-ofis paneli**: kendi taleplerini gör/yönet + hızlı iletişim (WhatsApp / ara / e-posta).
3. Uzmanlar **site içinden** (kod/GitHub'a dokunmadan) blog yazısı yazıp yayınlayabilsin.
4. Bunları yaparken mevcut tanıtım sitesinin tasarımını, SEO'sunu ve `info@ozsaye.com` e-postasını bozmadan Vercel'e taşı.

## 2. Kapsam DIŞI (v1 — YAGNI)
- **Hasta hesapları / hasta portalı YOK.** 2 terapist için gereksiz; hasta hesapsız randevu talep eder.
- **Canlı takvim / anlık slot rezervasyonu YOK.** Talep + onay modeli; sonradan yükseltmeye açık tasarlanır.
- **Randevu yönetim ekranları (`/panel/talepler` liste/detay/durum/iç not/hızlı iletişim) v1'de YOK.** Kullanıcı kararı (2026-07-07): şimdilik önceliksiz. v1'de form yalnızca DB'ye kaydeder + uzmana e-posta bildirimi gönderir; talepleri panelden görüp durumunu yönetme ekranı **v1.1'e ertelendi**. Veri modeli (§5) buna hazır bırakılır ki ekran sonradan kolayca eklensin. **Güncelleme (2026-07-09):** bu ekranlar **Faz 4'te yayınlandı** — `/panel/talepler` liste/detay + durum/iç not/planlanan tarih + hızlı iletişim (WhatsApp/ara/e-posta) ve göstergedeki durum-bazlı talep sayıları artık canlı.
- **Online ödeme YOK.**
- **Otomatik SMS / WhatsApp YOK.** v1'de e-posta bildirimi + panelde manuel "WhatsApp'tan yaz" linki (bu da v1.1 randevu ekranıyla birlikte gelir).
- Uzmanların kendi `/ekip` profilini panelden düzenlemesi → v1.1'e opsiyonel (placeholder veri sorununu da çözebilir).

## 3. Kararlar (özet)
| Konu | Karar | Gerekçe |
|---|---|---|
| Yön | Vercel + DB, sadece-uzman login | Doktorların istediği "kendi ekranı" + blog login'i; hasta portalının yükü yok |
| Randevu | Talep + onay (canlı takvim yok) | Terapi alımının gerçekte işlediği yol; en düşük çift-rezervasyon riski; en hızlı canlı |
| Barındırma | GoDaddy → Vercel | Login / DB / Server Action için sunucu gerekli |
| DNS | GoDaddy DNS kalır; sadece web (`@`/`www`) Vercel'e | MX/e-posta kayıtları ellenmez → `info@ozsaye.com` kesilmez |
| DB | Neon Postgres (Vercel Marketplace) | Serverless, ücretsiz kademe klinik ölçeğinde yeterli |
| ORM | Drizzle + drizzle-kit | TS-first, serverless dostu, hafif |
| Auth | `jose` imzalı httpOnly cookie + DB'de tek-kullanımlık magic-token + DAL (`verifySession`), 2 beyaz-listeli e-posta, dışa kayıt kapalı | Next 16'nın kendi dokümanının önerdiği desen (bkz. Faz 0 planı); Auth.js v5 beta yerine tercih edildi — aynı UX, sıfır beta-kütüphane/Next 16.2 uyum riski, 2 kullanıcı için daha az kod |
| Bildirim | Resend, `bildirim.ozsaye.com` alt alanından | Kök alanın GoDaddy mail teslimatına dokunmaz |
| Görsel yükleme | Vercel Blob (public) | Blog kapak/inline görselleri |
| Blog editörü | WYSIWYG (Tiptap) → **markdown** olarak sakla | Uzman-dostu; mevcut markdown render hattıyla uyumlu; XSS'e karşı güvenli |
| Blog yetkisi | **Paylaşımlı** — her uzman tüm yazıları görür/düzenler/yayınlar | Kullanıcı kararı (2026-07-07): küçük ekipte en pratik olanı; biri diğerinin yazısını tamamlayabilir/düzeltebilir |
| Panel girişi | `/panel/giris` **hiçbir yerde nav/header/footer linki veya buton olarak gösterilmez** | Kullanıcı kararı (2026-07-07): "gizli" sayfa — uzmanlar URL'i doğrudan bilir (WhatsApp/e-posta ile bir kez paylaşılır, bookmarklanır). Erişim kontrolü yine e-posta whitelist + magic-link'te; URL'in gizliliği ek bir kolaylık katmanı, güvenlik sınırı değil. |

## 4. Mimari değişiklik
- `next.config.ts`: `output: "export"` **kaldırılır**. `trailingSlash: true` **korunur** (indekslenmiş URL'ler `/yol/` biçiminde; kırılmasın). `images.unoptimized` **kaldırılır** → Vercel'de `next/image` optimizasyonu açılır.
- Runtime: Node (Fluid Compute), edge değil.
- CI/CD: Vercel (her PR → preview, `main` → prod). `.github/workflows/ci.yml` (lint+build) PR kontrolü olarak kalır. `.github/workflows/deploy-godaddy.yml` **emekli** (FTP deploy yok).
- `public/randevu.php` + ilgili `.htaccess` log koruması **kaldırılır** (form artık Server Action).

## 5. Veri modeli (Postgres / Drizzle)

**`staff`** — 2 uzman
`id (uuid, pk)` · `email (unique)` · `name` · `expert_slug` (`melek-yildiz` | `sacide-sahin`) · `role` (`therapist` | `admin`) · `created_at`

**`appointment_requests`** — randevu talepleri
`id (uuid, pk)` · `created_at` · `patient_name` · `patient_phone` · `patient_email` · `expert_slug` (nullable — "farketmez" ise null) · `preferred_note` (serbest metin: tercih edilen gün/saat + hastanın notu) · `kvkk_consent (bool)` · `consent_at` · `consent_ip` · `status` (enum: `new` | `contacted` | `scheduled` | `done` | `cancelled`, default `new`) · `scheduled_at` (nullable) · `internal_note` (uzmana özel) · `updated_at`
(Honeypot alanları DB'ye yazılmaz; server'da elenir.)

**`blog_posts`** — blog
`id (uuid, pk)` · `slug (unique)` · `title` · `excerpt` · `body_markdown` · `cover_image_url` (nullable) · `author_staff_id` (fk → staff) · `status` (enum: `draft` | `published`, default `draft`) · `published_at` (nullable) · `created_at` · `updated_at` · `seo_description` (nullable)

Auth.js için gereken `users/accounts/sessions/verification_tokens` tabloları Drizzle adapter ile ayrıca eklenir. `staff`, bu kimliklerle e-posta üzerinden eşleşir; **yalnızca `staff`'ta e-postası olanlar** giriş yapabilir (signIn callback whitelist).

## 6. Hasta akışı (hesapsız randevu talebi)
1. Anasayfa `#randevu` bölümü / `/randevu` formu: ad, telefon, e-posta, uzman seçimi (Melek / Sacide / Farketmez), tercih notu (serbest metin: gün-saat + not), KVKK onay kutusu. Honeypot alanı gizli.
2. Gönderim → **Server Action** (veya route handler):
   - Doğrulama (zorunlu alanlar; e-posta/telefon format; KVKK onayı zorunlu), honeypot kontrolü, IP başına rate-limit, e-posta başlık-enjeksiyonu koruması.
   - `appointment_requests`'e yaz (status `new`, consent + ip + zaman).
   - Resend ile bildirim e-postası: seçilen uzmana (ve/veya klinik adresine); "farketmez" ise ikisine. Panel linki içerir.
   - `/randevu/tesekkurler/`'e yönlendir.
3. Hastanın gördüğü akış bugünküyle neredeyse aynı; fark: talep artık kayıt altında + panelde yönetiliyor.

## 7. Uzman paneli (`/panel`, auth arkasında)
- **Next 16 `proxy.ts`** (eski adıyla middleware) ile `/panel/**` korunur; oturum yoksa `/panel/giris`'e.
- **Giriş** (`/panel/giris`): e-posta gir → magic-link → tıkla → oturum. Yalnız `staff` e-postaları. Oturum uzun ömürlü (30 gün). **Sitede hiçbir yerde bu sayfaya link/buton yok** (bkz. §3 "Panel girişi") — doğrudan URL ile girilir.
- **Gösterge** (`/panel`): v1'de basit karşılama; ileri metrikler (yeni talep sayısı vb.) v1.1 randevu ekranlarıyla birlikte gelir. **Güncelleme (2026-07-09):** durum-bazlı talep sayıları göstergesi **Faz 4'te yayınlandı**.
- **Blog listesi** (`/panel/blog`): taslak/yayında yazılar (tüm uzmanların — paylaşımlı yetki); yeni yazı.
- **Yeni/düzenle** (`/panel/blog/yeni`, `/panel/blog/[id]/duzenle`): başlık, özet, WYSIWYG içerik (görsel yükleme → Vercel Blob), kapak görseli, slug (başlıktan otomatik + elle düzeltilebilir), taslak kaydet / yayınla. Yayınla → `/blog`'da görünür (ISR revalidate). Herhangi bir `staff` herhangi bir yazıyı düzenleyebilir.
- Panel UI marka token'larıyla (forest/forest-muted/cream/sage aksan) ama yoğunluk/kullanılabilirlik için sade ve işlevsel.
- **v1.1 (ertelendi, bu spec'in kapsamı dışında — bkz. §2):** `/panel/talepler` durum-filtreli liste (uzman kendi taleplerini + "farketmez" havuzunu görür), `/panel/talepler/[id]` detay (durum değiştir, iç not, planlanan tarih, hızlı iletişim: WhatsApp/ara/e-posta), gösterge panelinde talep sayıları. **Güncelleme (2026-07-09):** bu ekranların tamamı **Faz 4'te yayınlandı** (durum-filtreli liste + detay + iç not + planlanan tarih + hızlı iletişim + gösterge sayıları); IDOR koruması veri katmanında (`kapsamKosulu`, `src/lib/talepler-db.ts`).

## 8. Blog geçişi
- `content/blog/*.md` yazıları tek seferlik, idempotent script (`scripts/migrate-blog-to-db.ts`) ile `blog_posts`'a taşınır; **slug, tarih, draft durumu korunur** (SEO/URL kırılmaz).
- `src/lib/blog.ts` dosya-sistemi yerine DB'den okuyacak şekilde yeniden yazılır. `/blog`, `/blog/[slug]`, `Articles.tsx` (anasayfa "Yazılar" son 3) DB'den beslenir.
- Render: mevcut markdown → HTML hattı korunur (editör markdown ürettiği için tutarlı). `/blog` **tek kanonik route** kalır — ikinci blog route (ör. `/yazilar`) **açılmaz** (proje kuralı).
- ISR: yayın/düzenlemede `revalidateTag('blog')` (veya ilgili path revalidate).
- `content/blog/*.md` dosyaları git geçmişinde kalır ama artık runtime'da okunmaz (kaynak: DB).

## 9. Bildirimler (v1)
- **Resend**, gönderen alt alan `bildirim.ozsaye.com` (SPF/DKIM burada; kök alanın GoDaddy mail'ine dokunmaz).
- Yeni talep → uzmana/kliniğe e-posta (hasta adı/iletişim/not içerir). Bu, v1'de talebi öğrenmenin **tek yolu** (panel talep ekranı yok — bkz. §2/§7).
- **Güncelleme (2026-07-10):** "Planlandı" durumu → hastaya bilgilendirme e-postası **eklendi**. Uzman panelden bir talebi `scheduled` + tarih yapınca hastaya nazik Türkçe bilgilendirme gider (yalnız İLK AD + tarih-saat; uzman adı/telefon/adres yok); tarih sonradan değişirse hasta YENİ tarihle yeniden bilgilendirilir, yalnız iç not düzenlemesi mail üretmez. Gönderim `sendHastaPlanlandi` (Reply-To=info@), SAF metin `hastaPlanlandiMetni`; mail düşse bile DB güncellemesi ayakta kalır (uzmana sakin uyarı). KVKK: talep-işleme amaçlı işlem bildirimi.
- **Sonra (v1 dışı):** Netgsm/İleti Merkezi SMS veya WhatsApp Business — maliyet + onay gerektirir.

## 10. KVKK / güvenlik
- Randevu verisi = kişisel veri; erişim yalnız login'li `staff`.
- KVKK onayı DB'de zaman + IP damgalı (mevcut düz-log yerine).
- Saklama politikası: talepler N ay (öneri: 12 ay) sonra anonimleştir/sil (elle; ileride cron). Politika metinde tanımlanır.
- Neon: at-rest şifreleme + TLS. Sırlar Vercel env'de.
- `/kvkk-aydinlatma-metni` + `/gizlilik-politikasi`: "randevu talepleri saklanıyor; veri sorumlusu, amaç, süre, haklar" bilgisiyle güncellenir.
- Hasta hesabı yok = küçük saldırı yüzeyi. Panel formlarında oturum/CSRF koruması (Auth.js).

## 11. Geçiş (cutover) planı
1. Vercel projesi bağla; Neon (Marketplace) + Resend + Blob env değişkenleri.
2. Drizzle şeması + migration; `staff` seed (2 uzman e-postası); blog migration script.
3. Preview'da uçtan uca doğrula (form → DB → e-posta; panel login; blog yayınla; mevcut sayfalar/SEO).
4. Resend için `bildirim.ozsaye.com` SPF/DKIM → GoDaddy DNS'e eklenir (mevcut MX'e dokunmadan).
5. Hazır olunca: GoDaddy DNS'te `@`/`www` A/CNAME → Vercel (MX **korunur**).
6. `deploy-godaddy.yml` + `public/randevu.php` kaldır. `ci.yml` kalır.
7. Doğrula: site açılıyor, form çalışıyor, e-posta gidiyor, `info@ozsaye.com` hâlâ çalışıyor.
- **Geri dönüş:** DNS'i eski A kaydına döndürmek yeterli (GoDaddy statik hâlâ duruyor).

## 12. Maliyet
Vercel **Pro ~$20/ay** (ticari kullanım). Neon / Resend / Auth.js / Blob → ücretsiz kademe (klinik ölçeğinde yeterli). Toplam ≈ $20/ay.

## 13. Başarı ölçütleri (kabul)
- [ ] Hasta randevu talebi gönderebiliyor; talep DB'ye kaydediliyor; ilgili uzmana e-posta gidiyor.
- [ ] Uzman magic-link ile giriyor (site üzerinde görünür bir giriş linki OLMADAN, doğrudan `/panel/giris` URL'iyle).
- [ ] Uzman WYSIWYG ile görselli blog yazısı oluşturup yayınlıyor; diğer uzman da aynı yazıyı düzenleyebiliyor (paylaşımlı yetki); `/blog`'da doğru slug + SEO ile çıkıyor; anasayfa son 3'ü gösteriyor.
- [ ] Mevcut blog yazıları taşınmış; URL'ler değişmemiş.
- [ ] Site Vercel'de `ozsaye.com`'da; `info@ozsaye.com` e-postası etkilenmemiş.
- [ ] KVKK: onay saklanıyor; erişim kısıtlı; aydınlatma/gizlilik metinleri güncel.
- [ ] `npm run lint` + Vercel build geçiyor.

## 14. Riskler ve bağımlılıklar
- **Gerçek klinik verisi hâlâ placeholder** (`site.dataReady=false`): profesyonel yayın için gerçek NAP/künye/ücret gerekli (bkz. `docs/klinikten-gereken-veriler.md`). **Kullanıcı bağımlılığı.**
- **E-posta teslimatı:** Resend alt-alan SPF/DKIM'in GoDaddy DNS'e doğru eklenmesi.
- **DNS cutover:** MX korunmalı; en sona bırak, doğrula.
- **Vercel ticari plan:** Pro (~$20/ay).
- **Repo hijyeni:** Yerel `main` bayattı; `origin/main` gerçek trunk. Bu dal `origin/main` tabanlı; PR hedefi `main` (= origin/main).

## 15. Uygulama fazları (writing-plans için)
Kullanıcı kararıyla (2026-07-07) sıralama, blog paneli öne alınacak + randevu yönetim ekranları ertelenecek şekilde güncellendi:

- **Faz 0 — Altyapı:** static export kaldır; Postgres (yerelde Docker, üretimde Neon) + Drizzle; jose+cookie+DB-token auth iskeleti; `staff` seed; magic-link giriş + `/panel` guard + DAL. **Plan yazıldı:** `docs/superpowers/plans/2026-07-06-faz0-altyapi-ve-uzman-girisi.md`.
- **Faz 1 — Blog paneli (öncelik):** `content/blog/*.md` → `blog_posts` migration; `blog.ts` DB'den okuma; panel WYSIWYG editör (paylaşımlı yetki) + Blob görsel yükleme + taslak/yayın + ISR.
- **Faz 2 — Randevu (sade):** form → Server Action → `appointment_requests`'e yaz + Resend bildirimi. **`/panel/talepler` ekranları bu fazda YOK** (v1.1'e ertelendi — bkz. §2/§7). **Güncelleme:** talep ekranları sonradan **Faz 4'te (2026-07-09)** eklendi.
- **Faz 3 — Cutover + KVKK:** Vercel+Neon+Resend provizyon; gerçek uzman e-postalarıyla seed; DNS repoint (MX korunur); PHP/FTP emekli; KVKK/gizlilik metin güncelle; uçtan uca doğrulama.
- **v1.1 → Faz 4 (uygulandı):** `/panel/talepler` liste/detay/durum/iç not/hızlı iletişim ekranları **2026-07-09'da yayınlandı**; hastaya "Planlandı" bilgilendirme e-postası **2026-07-10'da eklendi** (§9). Kalan opsiyonel v1.1 maddesi: uzmanların kendi `/ekip` profilini panelden düzenlemesi (§2 — hâlâ açık/opsiyonel).
