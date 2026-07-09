# Vercel / Neon Cutover Teknik Rehberi

Bu rehber Faz 3b canlıya alma runbook'unun teknik ekidir. Amaç, GoDaddy'deki
statik kopyadan Vercel'deki sunucu modlu Next.js uygulamasına geçerken web
trafiğini taşımak; `info@ozsaye.com` e-postasını taşıyan MX kayıtlarına
dokunmamaktır.

## Kritik Güvenlik Rayı

- GoDaddy DNS sağlayıcısı olarak kalabilir.
- Yalnız web kayıtları değişir: `@` ve `www`.
- MX kayıtları ve mevcut mail TXT kayıtları değiştirilmez.
- DNS değişmeden önce mevcut MX çıktısı kaydedilir:

```bash
dig +short MX ozsaye.com
dig +short TXT ozsaye.com
```

Cutover boyunca bu çıktı referans alınır. Web yönlendirmesi bittikten sonra MX
çıktısı birebir aynı kalmalıdır.

## Production Env Değişkenleri

Vercel Project Settings -> Environment Variables altında production için girilir.
Preview ortamına da aynı değerler, gerekirse test DB/e-posta ile girilebilir.

| Değişken | Nereden alınır | Not |
|---|---|---|
| `DATABASE_URL` | Neon / Vercel Marketplace Postgres | Neon'un pooled `-pooler` connection string'i kullanılmalı. |
| `SESSION_SECRET` | Yerelde üret | `openssl rand -base64 32` çıktısı. Cookie imzası için gizli kalmalı. |
| `APP_URL` | Production domain | `https://ozsaye.com` olmalı. Magic-link URL tabanı. |
| `NEXT_PUBLIC_SITE_URL` | Production domain | `https://ozsaye.com`; canonical/OG/JSON-LD mutlak URL'leri için. |
| `RESEND_API_KEY` | Resend API Keys | `bildirim.ozsaye.com` domain doğrulaması tamamlandıktan sonra girilmeli. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store | Blog panelindeki görsel yükleme için. Boşsa prod'da yerel disk kalıcı değildir. |
| `SEED_STAFF` | Gerçek uzman e-postaları | `Ad Soyad:email:slug` kayıtları virgülle ayrılır. |
| `CRON_SECRET` | Yerelde üret | `openssl rand -base64 32`. Vercel Cron çağrılarını doğrulamak için **zorunlu**; boşsa `/api/cron/purge-requests` 401 (fail-closed) döner ve temizlik hiç çalışmaz. |
| `PURGE_OLD_REQUESTS_DAYS` | Klinik/hukuk kararı | KVKK saklama süresi (gün). Boşsa varsayılan `365`. Pozitif tam sayı olmalı. |

Örnek `SEED_STAFF` biçimi:

```bash
SEED_STAFF=Psk. Dan. Melek Yıldız:melek@ozsaye.com:melek-yildiz,Kl. Psk. Sacide Şahin:sacide@ozsaye.com:sacide-sahin
```

`DATABASE_URL` için Neon pooled bağlantı kullanıldığında bağlantı *sayısı*
açısından ek kod değişikliği gerekmez; uygulama `src/lib/db/index.ts` üzerinden
bağlantıyı tekilleştirir.

> **Not (prepared statements):** `postgres.js` varsayılan olarak prepared
> statement kullanır; Neon'un `-pooler` (PgBouncer, transaction modu) bunları
> reddedebilir. Faz 3b smoke'ta prepared-statement davranışını doğrula; hata
> alırsan `src/lib/db/index.ts`'te `postgres(url, { prepare: false })` ile bağlan
> (veya Neon'un session-pooler'ını kullan).

## Neon Kurulumu

1. Vercel Marketplace'ten Neon Postgres ekle veya Neon'da ayrı proje oluştur.
2. Production branch için pooled connection string'i al.
3. Vercel'e `DATABASE_URL` olarak gir.
4. Migration'ları production DB'ye uygula:

```bash
DATABASE_URL="postgres://..." npx tsx scripts/db-migrate.ts
```

5. Başlangıç blog yazılarını tohumla:

```bash
DATABASE_URL="postgres://..." npx tsx scripts/migrate-blog-to-db.ts
```

6. Gerçek uzman e-postalarını seed et:

```bash
DATABASE_URL="postgres://..." SEED_STAFF="..." npx tsx scripts/seed-staff.ts
```

Kontrol:

```sql
select count(*) from staff;
select slug, status from blog_posts order by slug;
```

Beklenen: 2 gerçek staff, 3 published blog yazısı.

## Resend Kurulumu

1. Resend'de `bildirim.ozsaye.com` domain'i ekle.
2. Resend'in verdiği SPF/DKIM TXT kayıtlarını GoDaddy DNS'e alt alan için ekle.
3. Kök domain MX kayıtlarına dokunma.
4. Resend domain verified olunca `RESEND_API_KEY` üret ve Vercel'e gir.

Test kapısı:

- Panel magic-link gerçek uzman e-postasına gelir.
- Randevu formu gönderimi DB'ye yazılır ve ilgili uzmana bildirim gider.
- `dig +short MX ozsaye.com` cutover öncesi çıktıyla aynı kalır.

## Vercel Blob

1. Vercel Storage -> Blob store oluştur.
2. `BLOB_READ_WRITE_TOKEN` değerini production env'e gir.
3. Panelden blog görseli yükleyerek URL'nin Blob public URL olduğunu doğrula.

Token boşsa uygulama `.uploads/` yerel disk yoluna yazar; bu yalnız geliştirme
ortamı için uygundur.

## DNS Cutover

Vercel projesine `ozsaye.com` ve `www.ozsaye.com` domain'leri eklenir. Vercel'in
gösterdiği kayıtlar GoDaddy DNS'e uygulanır:

- `@` için Vercel panelinin domain ekranında gösterdiği güncel A kaydı
- `www` için Vercel CNAME kaydı: Vercel'in gösterdiği hedef

Değiştirilmeyecek kayıtlar:

- MX
- Microsoft 365 / GoDaddy mail TXT kayıtları
- Mail için kullanılan SPF/DKIM/DMARC kayıtları

Doğrulama:

```bash
dig +short A ozsaye.com
dig +short CNAME www.ozsaye.com
dig +short MX ozsaye.com
curl -I https://ozsaye.com
```

`https://ozsaye.com` Vercel'i sunmalı; MX çıktısı değişmemelidir.

## Rollback

Sorun çıkarsa yalnız web kayıtları eski GoDaddy değerlerine döndürülür. MX
kayıtlarına dokunulmadığı için e-posta tarafı rollback gerektirmez. Neon,
Resend ve Vercel env değerleri yerinde kalabilir; sorun giderildikten sonra web
kaydı tekrar Vercel'e çevrilir.

## Yayın Sonrası

- `.github/workflows/deploy-godaddy.yml` emekli edilir.
- `docs/godaddy-deploy-rehberi.md` arşiv/legacy olarak işaretlenir.
- KVKK saklama-temizliği Vercel Cron ile otomatiktir. Route:
  `/api/cron/purge-requests` (`src/app/api/cron/purge-requests/route.ts`,
  `force-dynamic`). Cron programı `vercel.json` içinde tanımlıdır:
  `{ "crons": [{ "path": "/api/cron/purge-requests", "schedule": "0 3 * * *" }] }`
  — her gün 03:00 UTC. Yalnız deploy sonrası Vercel'de etkinleşir.
  - Kimlik: Vercel Cron, `CRON_SECRET` env'i ayarlıysa çağrıya otomatik
    `Authorization: Bearer ${CRON_SECRET}` başlığı ekler; route bunu doğrular.
    `CRON_SECRET` **zorunludur** — yoksa/boşsa route 401 (fail-closed) döner ve
    silme yapmaz. (Panel oturumu DEĞİL: makine uç noktasıdır, `verifySession`
    kullanmaz.) Silinecek gün sayısı `PURGE_OLD_REQUESTS_DAYS` env'inden gelir,
    boşsa 365.
  - Vercel **Hobby** planında cron günde 1 çalıştırmayla sınırlıdır; bu program
    (günde bir, 03:00 UTC) bu sınırla uyumludur.
  - Vercel Cron doğrudan repo içindeki `tsx` script'ini değil, deployment
    üzerindeki HTTP path'ini çağırır. Yerel/tek seferlik temizlik için hâlâ
    `npm run db:purge` kullanılabilir (aşağı bkz.).
- Yerel veya tek seferlik temizlik için `npm run db:purge -- 365` kullanılabilir.
  Argüman verilmezse varsayılan 365 gündür; alternatif olarak
  `PURGE_OLD_REQUESTS_DAYS=365 npm run db:purge` kullanılabilir.
- Gerçek NAP/uzman verileri girilmeden `site.dataReady=true` yapılmaz.
