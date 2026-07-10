# Klinikten Gereken Veriler — Yayına Hazırlık Rehberi

Bu site için tüm kod yazıldı. Aşağıdaki **gerçek veriler** girilip doğrulandığında site yayına hazır olacak. Şu an kodda her alan açıkça işaretli **placeholder** değer taşıyor: metin placeholder'ları `[DOLDUR] ` ön-ekiyle başlar ve üstlerinde `// TODO: GERÇEK VERİ -- ...` yorumu bulunur. Bu placeholder'ları gerçekmiş gibi yayınlamayın.

Verilerin neredeyse tamamı tek bir merkezi dosyada toplanır: **`src/lib/site.ts`** (named export `const site`). Bir kısmı ise **ortam değişkenleri** (`.env.local` / hosting paneli) ile gelir. Her maddede hangi anahtara/ortam değişkenine gideceği ve bir **örnek değer** belirtilmiştir.

> **Önemli kural:** JSON-LD yapısal verisi (`src/components/JsonLd.tsx`) yalnızca `site.dataReady === true` olduğunda yayınlanır. Bu bayrak **en son adımda**, tüm veriler girilip doğrulandıktan sonra `true` yapılmalıdır. Bkz. [10. Son Adım](#10-son-adım-dataready--true).

---

## 1. Kimlik & NAP (Ad–Adres–Telefon)

NAP tutarlılığı yerel SEO'nun temelidir: aynı isim/adres/telefon biçimi sitede, Google İşletme Profili'nde ve tüm dizinlerde **birebir aynı** olmalı.

### Kimlik
- [ ] **Yasal/ticari tam ünvan** → `site.legalName`
  - Örn: `"Özsaye Psikoloji Danışmanlık Hizmetleri"` veya şahıs işletmesiyse tescilli ünvan.
- [ ] **Görünen kısa ad** → `site.shortName` (zaten `"Özsaye Psikoloji"`, doğrulayın).
- [ ] **Slogan** → `site.slogan` (örn: `"Güvenli bir alanda iyileşmeye doğru"`).
- [ ] **Açıklama** → `site.description` (1-2 cümle; arama sonuçları ve meta description için).

### Telefon → `site.phone`
- [ ] **display** (insan-okur biçim) — örn: `"0 (212) 123 45 67"`
- [ ] **e164** (uluslararası, boşluksuz) — örn: `"+902121234567"`
- [ ] **href** — örn: `"tel:+902121234567"`

### E-posta → `site.email`
- [x] **address** — `"info@ozsaye.com"` (GİRİLDİ 2026-07-09: kliniğin M365 kutusu; canlı mail teslimiyle doğrulandı)
- [x] **href** — `"mailto:info@ozsaye.com"` (GİRİLDİ 2026-07-09)

### Adres → `site.address`
- [ ] **streetAddress** (cadde/sokak + no) — örn: `"Atatürk Cad. No: 12 Kat: 3"`
- [ ] **district** (ilçe) — örn: `"Kadıköy"`
- [ ] **city** (il) — örn: `"İstanbul"`
- [ ] **postalCode** (posta kodu) — örn: `"34710"`
- [ ] **country** — `"TR"` (sabit, doğrulayın).
- [ ] **full** (tek satır tam adres) — örn: `"Atatürk Cad. No: 12 Kat: 3, Kadıköy, İstanbul 34710"`

### Konum → `site.geo`
- [ ] **latitude** (sayı) — örn: `40.9901`
- [ ] **longitude** (sayı) — örn: `29.0289`
  - Nasıl bulunur: Google Haritalar'da ofis konumunuza sağ tıklayın; en üstteki iki ondalık sayı sırasıyla enlem (lat) ve boylamdır (lng). Tıklayınca panoya kopyalanır.

### Çalışma saatleri → `site.openingHours`
Her gün grubu için bir nesne. `days` schema.org gün kodları kullanır: `Mo, Tu, We, Th, Fr, Sa, Su`.
- [ ] Her grup için: **days** (örn: `["Mo","Tu","We","Th","Fr"]`), **opens** (`"09:00"`), **closes** (`"19:00"`), **label** (insan-okur TR, örn: `"Pazartesi - Cuma 09:00-19:00"`).
  - Örnek girdi:
    ```
    { days: ["Mo","Tu","We","Th","Fr"], opens: "09:00", closes: "19:00", label: "Pazartesi - Cuma 09:00-19:00" }
    { days: ["Sa"], opens: "10:00", closes: "16:00", label: "Cumartesi 10:00-16:00" }
    ```
  - [ ] Hafta sonu kapalıysa o günü hiç eklemeyin (veya açıkça belirtin).

---

## 2. Sosyal Medya → `site.social`

Tam URL girin (yarım/handle değil). Hesap yoksa alanı `undefined` bırakın — boş string vermeyin.
- [x] **instagram** — `"https://www.instagram.com/ozsayepsikoloji"` (GİRİLDİ 2026-07-09: kliniğin İşletme hesabı, Meta Accounts Center'da doğrulandı)
- [ ] **linkedin** — örn: `"https://www.linkedin.com/company/ozsaye-psikoloji"`

---

## 3. Uzman E-E-A-T Bilgileri → **artık panelden (Profilim) giriliyor**

Google'ın sağlık/psikoloji içeriklerinde aradığı **Deneyim, Uzmanlık, Otorite, Güvenilirlik** (E-E-A-T) sinyalleri için uzmanların gerçek kimlik ve yetkinlik bilgileri kritik. Sitede şu an iki uzman var:
- `slug: "melek-yildiz"` — **Melek Yıldız**, Psikolojik Danışman
- `slug: "sacide-sahin"` — **Sacide Şahin**, Klinik Psikolog

> **Değişti (Ekip Profili fazı):** Uzman **içeriği** artık `site.ts`'te değil, **panelden** giriliyor. Her uzman kendi profilini `Panel → Profilim` (admin: `Profiller`) altından düzenler; içerik `expert_profiles` tablosunda tutulur ve kaydedilince `/ekip`, `/ekip/[slug]` ve anasayfa anında güncellenir. Alan boş bırakılırsa (bugünkü davranış) kamuda gizli kalır. **`site.ts`'te yalnızca sabit kimlik durur:** `slug`, `name`, `title`, `shortTitle`.

**Panelden (her uzman için)** doldurulacaklar:
- [ ] **credentialsLine** — tek satırlık ünvan+ad gösterimi (örn: `"Psk. Dan. Melek Yıldız"`). Kart altı satırında ve detay sayfasında gösterilir.
- [ ] **degrees** — lisans/yüksek lisans dereceleri (her satıra bir madde) — örn: `Psikolojik Danışmanlık ve Rehberlik (Lisans)` / `Klinik Psikoloji (Yüksek Lisans)`
- [ ] **university** — mezun olunan üniversite(ler) — örn: `"Boğaziçi Üniversitesi"`
- [ ] **certifications** — eğitim/sertifikalar (her satıra bir madde) — örn: `EMDR Terapi Eğitimi` / `Bilişsel Davranışçı Terapi (BDT) Sertifikası`
- [ ] **membership** — meslek örgütü üyeliği — örn: `"Türk Psikologlar Derneği (TPD) üyesi"`
- [ ] **bio** — kısa biyografi/yaklaşım metni (1 paragraf).
- [ ] **areas** — uzmanlık/çalışma alanları (her satıra bir madde) — örn: `Kaygı bozuklukları` / `Çift ve ilişki terapisi` / `Travma`
- [ ] **sameAs** — kişisel/akademik profil tam URL'leri (her satıra bir URL) — varsa LinkedIn, kişisel web sitesi, akademik profil (örn. ORCID, Google Scholar), Psikolog dizinleri. Yoksa boş bırakın. Örn: `https://www.linkedin.com/in/melek-yildiz`
- [ ] **fotoğraf (imageUrl)** — bkz. [4. Görseller](#4-görseller-artık-panelden-yükleniyor).

**`site.ts`'te kalan sabit kimlik** (kod tarafı, gerekirse doğrulayın): `name`, `title`, `shortTitle`.

> İpucu: Mümkünse her uzman için diploma/sertifika adlarını resmî tam adlarıyla yazın; bunlar JSON-LD `Person` şemasında ve sayfada güven sinyali olarak kullanılır.

---

## 4. Görseller → **artık panelden yükleniyor**

### Uzman portreleri
- [ ] Her uzman için bir portre fotoğrafı hazırlayın.
  - **Öneri:** ~800×800 px **kare** (veya 4:5 dikey), `.jpg`/`.png`/`.webp`, net ve profesyonel.
- [ ] Fotoğrafı **panelden** yükleyin: `Panel → Profilim → Fotoğraf` (yükle/kaldır). Yüklenen görsel `expert_profiles.imageUrl`'de tutulur ve `/ekip` + `/ekip/[slug]` sayfalarında `next/image` ile gösterilir.
  - Fotoğraf yoksa uzmanın ad baş harflerinden oluşan **monogram** yer tutucusu (mevcut şık tasarım) gösterilir — kırık görsel olmaz.

> Not: `public/uzmanlar/` + `site.experts[].image` yöntemi **artık kullanılmıyor**; portreler DB'de (`imageUrl`) tutulup panelden yönetiliyor.

### Ofis/mekan görselleri (opsiyonel ama önerilir)
- [ ] Resepsiyon, görüşme odası, bekleme alanı gibi 2-4 görsel. Aynı klasöre veya `public/ofis/` altına koyup ilgili bölüm/galeri bileşeninde kullanın.
  - **Öneri:** yatay (örn. 1600×1067), `.webp`, optimize edilmiş.

> Telif: Yalnızca kliniğe ait veya kullanım hakkı olan görseller kullanın. Stok görsel kullanılacaksa lisansını saklayın.

---

## 5. Ortam Değişkenleri (`.env.local` ve hosting paneli)

Bu değerler kodda **değil**, ortam değişkeni olarak tutulur. Yerelde `.env.local` dosyasına, yayında hosting/Vercel ortam değişkenleri paneline girin. `RESEND_*` ve `APPOINTMENT_TO_EMAIL` gizli kalmalı (repoya commit etmeyin).

- [ ] **NEXT_PUBLIC_SITE_URL** — production domain (sonunda `/` olmadan).
  - Örn: `https://www.ozsayepsikoloji.com`
  - Kullanım: `site.url` ve `absoluteUrl()` bunu okur; canonical/Open Graph/JSON-LD mutlak URL'leri buna dayanır.
- [ ] **RESEND_API_KEY** — randevu formu e-postalarını gönderen Resend API anahtarı.
  - Resend panelinde **API Keys** bölümünden oluşturulur. Örn: `re_xxxxxxxxxxxxxxxx`
- [ ] **RESEND_FROM** — doğrulanmış gönderen adresi (Resend'de domain doğrulaması yapılmış olmalı).
  - Örn: `"Özsaye Psikoloji <randevu@ozsayepsikoloji.com>"`
- [ ] **APPOINTMENT_TO_EMAIL** — randevu başvurularının düşeceği e-posta kutusu.
  - Örn: `iletisim@ozsayepsikoloji.com`
- [ ] **DATABASE_URL** — KVKK rıza + başvuru kaydının yazılacağı Postgres bağlantısı.
  - **Vercel Marketplace → Postgres (Neon)** entegrasyonu eklenince otomatik gelir; elle de girilebilir.
  - Yoksa kayıt veritabanına yazılmaz (yalnızca e-posta/log); gelince otomatik aktifleşir.

> Not: Randevu Server Action'ı (`src/app/randevu/actions.ts`) e-posta için `RESEND_*`/`APPOINTMENT_TO_EMAIL`'i, kalıcı KVKK rıza kaydı için `DATABASE_URL`'i kullanır. Hiçbiri yoksa başvuru `console.info` ile loglanır — **form yine de çalışır, başarısız olmaz.**

---

## 6. Google Maps Embed → `site.mapEmbedSrc`

Haritanın sayfada görünmesi için Google Maps gömme (embed) `src`'i gerekir. Yoksa `""` (boş string) bırakın — harita bölümü gizlenir.

Nasıl alınır:
1. [Google Haritalar](https://www.google.com/maps)'ta ofis konumunuzu/işletmenizi bulun.
2. **Paylaş** → **Harita yerleştir** (Embed a map) sekmesine geçin.
3. **HTML'i kopyala**'ya basın. Kopyalanan `<iframe ...>` etiketi içinde `src="..."` değeri vardır.
4. Yalnızca tırnak içindeki **URL'yi** (`src` değerini) `site.mapEmbedSrc`'e yapıştırın.
   - Örn: `site.mapEmbedSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12..."`

- [ ] `site.mapEmbedSrc` dolduruldu (veya bilinçli olarak `""` bırakıldı).

---

## 7. Ücret / Seans Bilgisi → `site.pricing`

- [ ] **sessionFee** — seans ücreti (gösterim biçimi) — örn: `"1.500 TL"` veya `"Görüşmede belirlenir"`
- [ ] **duration** — seans süresi — örn: `"50 dakika"`
- [ ] **note** — ek not — örn: `"İlk görüşme ücretsiz tanışma içerir."` veya kurum/sigorta notu.

> Ücret yayınlamak istemiyorsanız `sessionFee` için nötr bir ifade (örn. `"Görüşmede belirlenir"`) kullanın; alanı placeholder bırakmayın.

---

## 8. Hukuki Metinler (KVKK & Gizlilik)

Randevu formu kişisel/sağlık verisi topladığı için KVKK kapsamındadır.
- [ ] **KVKK Aydınlatma Metni** taslağı hazırlandı.
- [ ] **Gizlilik / Çerez Politikası** taslağı hazırlandı.
- [ ] **Açık rıza** ifadesi randevu formuna eklendi (gerekiyorsa onay kutusu).
- [ ] Tüm metinler bir **hukuk danışmanı** tarafından gözden geçirilip onaylandı.

> Uyarı: Bu site içinde üretilecek/üretilen hukuki metinler **taslaktır** ve hukuki tavsiye değildir. Yayından önce mutlaka yetkili bir hukukçudan onay alın.

---

## 9. Doğrulama Kontrolü (yayın öncesi)

- [ ] `npm run build` hatasız tamamlanıyor.
- [ ] `npm run lint` temiz.
- [ ] Telefon/e-posta linkleri tıklanınca doğru çalışıyor (`tel:` / `mailto:`).
- [ ] Randevu formu test gönderimi `APPOINTMENT_TO_EMAIL` kutusuna ulaşıyor.
- [ ] Harita doğru konumu gösteriyor.
- [ ] Uzman görselleri yükleniyor (kırık görsel yok).
- [ ] Kodda hiçbir `[DOLDUR]` placeholder veya `// TODO: GERÇEK VERİ` yorumu kalmadı.

---

## 10. Son Adım: `dataReady = true`

Yukarıdaki **tüm** veriler girilip [9. Doğrulama Kontrolü](#9-doğrulama-kontrolü-yayın-öncesi) tamamlandıktan sonra:

- [ ] `src/lib/site.ts` içinde `site.dataReady` değerini `false` → **`true`** yapın.

Ancak o zaman `src/components/JsonLd.tsx` `MedicalClinic` + iki `Person` yapısal verisini (JSON-LD) yayınlar. Eksik/placeholder veriyle `dataReady = true` yapmayın — Google'a yanlış yapısal veri göndermek SEO açısından zararlıdır.

---

## 11. Yayın Öncesi Teknik Bloker'lar (kod tarafı — geliştirici işi)

Aşağıdakiler veri değil, **kod/altyapı** gerektirir; canlıya çıkmadan ele alınmalı:

- [x] **KVKK açık rıza kaydı kalıcı saklama — KOD HAZIR.** Rıza + başvuru (zaman damgası + IP + user-agent ile) `appointment_submissions` tablosuna yazılır (`src/lib/db.ts`, Neon/Postgres serverless sürücü). **Aktifleştirmek için tek kalan: provisioning.**
  - Vercel projesinde **Marketplace → bir Postgres (Neon) entegrasyonu** ekleyin → `DATABASE_URL` ortam değişkeni otomatik gelir.
  - Tablo ilk yazımda otomatik (`CREATE TABLE IF NOT EXISTS`) oluşur; istenirse elle: `db/migrations/0001_appointment_submissions.sql`.
  - `DATABASE_URL` gelene kadar uygulama e-posta/`console.info` fallback'i kullanır (form çalışmaya devam eder).
  - Not: Tabloda kişisel veri (PII) saklanır; klinik KVKK saklama/silme sürelerini yönetmelidir.
- [ ] **Dağıtık rate-limit.** `src/app/randevu/actions.ts` içindeki bellek-içi rate-limit sunucusuz/çok-instance ortamda paylaşılmaz (gerçek koruma sağlamaz). Üretimde Upstash Redis / Vercel KV tabanlı limit ya da Vercel WAF rate-limit kuralı kullanılmalı (honeypot yerinde kalır).
- [ ] **Resend uçtan uca test.** Gerçek `RESEND_API_KEY` + doğrulanmış gönderen domain ile test başvurusu yapılıp e-postanın `APPOINTMENT_TO_EMAIL` kutusuna ulaştığı doğrulanmalı (şu an key yoksa yalnızca `console.info` log fallback çalışır).
- [ ] **Gerçek görseller.** Uzman portreleri artık **panelden** yükleniyor (`imageUrl` + `next/image`, `unoptimized`); yüklenene kadar monogram yer tutucu gösterilir. **Ofis/mekan görselleri** için hâlâ `next/image` bağlaması gerekli.
- [ ] **`dataReady=true` sonrası JSON-LD doğrulaması.** Gerçek veri girilip `dataReady=true` yapılınca `validator.schema.org` / Google Rich Results Test ile MedicalClinic / Person / Service / FAQPage doğrulanmalı.
- [ ] **(Opsiyonel) Maskable PWA ikonları** (192×192 ve 512×512 PNG) `manifest.ts`'e eklenebilir.
