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
- **Online ödeme YOK.**
- **Otomatik SMS / WhatsApp YOK.** v1'de e-posta bildirimi + panelde manuel "WhatsApp'tan yaz" linki.
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
| Auth | Auth.js v5, e-posta magic-link, 2 beyaz-listeli e-posta, dışa kayıt kapalı | Parola saklamayız = daha az KVKK/güvenlik yükü |
| Bildirim | Resend, `bildirim.ozsaye.com` alt alanından | Kök alanın GoDaddy mail teslimatına dokunmaz |
| Görsel yükleme | Vercel Blob (public) | Blog kapak/inline görselleri |
| Blog editörü | WYSIWYG (Tiptap) → **markdown** olarak sakla | Uzman-dostu; mevcut markdown render hattıyla uyumlu; XSS'e karşı güvenli |

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
- **Middleware** ile `/panel/**` korunur; oturum yoksa `/panel/giris`'e.
- **Giriş** (`/panel/giris`): e-posta gir → magic-link → tıkla → oturum. Yalnız `staff` e-postaları. Oturum uzun ömürlü ("beni hatırla").
- **Gösterge** (`/panel`): yeni talep sayısı, yaklaşan planlı randevular, son talepler.
- **Talepler** (`/panel/talepler`): durum-filtreli liste. Uzman kendi taleplerini + "farketmez" havuzunu görür (`admin` hepsini).
- **Talep detayı** (`/panel/talepler/[id]`): hasta iletişim + not; durum değiştir; iç not; planlanan tarih ata; hızlı aksiyonlar: **WhatsApp** (`wa.me/<telefon>`), **Ara** (`tel:`), **E-posta** (`mailto:`).
- **Blog listesi** (`/panel/blog`): taslak/yayında yazılar; yeni yazı.
- **Yeni/düzenle** (`/panel/blog/yeni`, `/panel/blog/[id]/duzenle`): başlık, özet, WYSIWYG içerik (görsel yükleme → Vercel Blob), kapak görseli, slug (başlıktan otomatik + elle düzeltilebilir), taslak kaydet / yayınla. Yayınla → `/blog`'da görünür (ISR revalidate).
- Panel UI marka token'larıyla (forest/cream/sage) ama yoğunluk/kullanılabilirlik için sade ve işlevsel.

## 8. Blog geçişi
- `content/blog/*.md` yazıları tek seferlik, idempotent script (`scripts/migrate-blog-to-db.ts`) ile `blog_posts`'a taşınır; **slug, tarih, draft durumu korunur** (SEO/URL kırılmaz).
- `src/lib/blog.ts` dosya-sistemi yerine DB'den okuyacak şekilde yeniden yazılır. `/blog`, `/blog/[slug]`, `Articles.tsx` (anasayfa "Yazılar" son 3) DB'den beslenir.
- Render: mevcut markdown → HTML hattı korunur (editör markdown ürettiği için tutarlı). `/blog` **tek kanonik route** kalır — ikinci blog route (ör. `/yazilar`) **açılmaz** (proje kuralı).
- ISR: yayın/düzenlemede `revalidateTag('blog')` (veya ilgili path revalidate).
- `content/blog/*.md` dosyaları git geçmişinde kalır ama artık runtime'da okunmaz (kaynak: DB).

## 9. Bildirimler (v1)
- **Resend**, gönderen alt alan `bildirim.ozsaye.com` (SPF/DKIM burada; kök alanın GoDaddy mail'ine dokunmaz).
- Yeni talep → uzmana/kliniğe e-posta (panel linkiyle).
- "Planlandı" durumu → hastaya opsiyonel bilgilendirme e-postası (uzman tetikler).
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
- [ ] Hasta randevu talebi gönderebiliyor; talep doğru uzmanın panelinde görünüyor; uzmana e-posta gidiyor; durum yaşam döngüsü çalışıyor.
- [ ] Uzman magic-link ile giriyor; talepleri görüyor; durum/iç not/planlanan tarih güncelliyor; hızlı iletişim linkleri çalışıyor.
- [ ] Uzman WYSIWYG ile görselli blog yazısı oluşturup yayınlıyor; `/blog`'da doğru slug + SEO ile çıkıyor; anasayfa son 3'ü gösteriyor.
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
- **Faz 0 — Altyapı:** static export kaldır; Vercel + Neon + Drizzle + Auth.js iskele; şema + migration; `staff` seed; magic-link giriş + `/panel` guard.
- **Faz 1 — Randevu:** form → Server Action → DB + Resend bildirimi; `/panel/talepler` liste + detay + durum/iç not/hızlı iletişim.
- **Faz 2 — Blog:** DB'ye migration; `blog.ts` DB'den okuma; panel WYSIWYG editör + Blob görsel + yayın/ISR.
- **Faz 3 — Cutover + KVKK:** DNS repoint (MX korunur); PHP/FTP emekli; KVKK/gizlilik metin güncelle; uçtan uca doğrulama.
