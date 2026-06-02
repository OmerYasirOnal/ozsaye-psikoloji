# GoDaddy cPanel'e Deploy (Next.js 16 — Node.js App / Passenger)

> Domain `ozsaye.com` zaten GoDaddy hosting'e bağlı (DNS `A @ → 107.180.113.32`).
> E-posta (`info@ozsaye.com`, `mail` A kaydı, MX) GoDaddy'de kalır — dokunulmaz.

## 0. ÖN KOŞUL (ZORUNLU — önce bunu doğrula)
Next.js 16, **Node.js ≥ 20.9** ister. cPanel'de:
1. cPanel → **"Software"** bölümü → **"Setup Node.js App"** aracı var mı?
2. Açılışta **Node sürümü** listesinde **20.x veya 22.x** var mı?

- **İkisi de varsa** → aşağıdaki adımlarla deploy edilir.
- **Node < 20.9 ise / araç yoksa** → bu Next.js sürümü cPanel'de çalışmaz. Seçenekler: GoDaddy'den Node destekli bir plana geçmek, VPS, ya da statik-export (form/DB ÇALIŞMAZ).

## 1. Paketi üret (yerelde)
```bash
bash scripts/build-cpanel.sh
```
→ `ozsaye-cpanel.zip` (kendine yeterli: `server.js` + minimal `node_modules` + `.next` + `public`).

## 2. cPanel'de Node.js App oluştur
cPanel → **Setup Node.js App** → **Create Application**:
- **Node.js version:** 20.x+ (en yüksek)
- **Application mode:** Production
- **Application root:** ör. `ozsaye-app` (ev dizini altında bir klasör)
- **Application URL:** `ozsaye.com` (kök; alan adının docroot'una eşle)
- **Application startup file:** `server.js`

## 3. Dosyaları yükle
- `ozsaye-cpanel.zip`'i **Application root** klasörüne yükle (cPanel **File Manager** → Upload) ve **Extract** et.
- `server.js` doğrudan application root içinde olmalı.
- Not: standalone paketi kendi `node_modules`'ünü taşır; ayrıca **"Run NPM Install" gerekmez**.

## 4. Ortam değişkenleri (cPanel Node app arayüzü → Environment variables)
```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://ozsaye.com

# Randevu bildirimi — GoDaddy mail SMTP (önerilen; sende bu var). SMTP, Resend'e göre önceliklidir.
SMTP_HOST=mail.ozsaye.com          # cPanel mail sunucusu (alternatif: smtpout.secureserver.net)
SMTP_PORT=465                      # 465=SSL, 587=STARTTLS
SMTP_USER=info@ozsaye.com
SMTP_PASS=********                 # info@ozsaye.com posta şifresi
SMTP_FROM=Özsaye Psikoloji <info@ozsaye.com>
APPOINTMENT_TO_EMAIL=info@ozsaye.com

# (opsiyonel) KVKK rıza kalıcı kaydı — yoksa form çalışır, başvuru loglanır:
DATABASE_URL=...                   # Neon/Postgres
# (alternatif e-posta sağlayıcı, SMTP yoksa) RESEND_API_KEY=... / RESEND_FROM=...
```
> `PORT`'u Passenger yönetir; standalone `server.js` `process.env.PORT`'u okur.
> E-posta önceliği: **SMTP > Resend > log**. SMTP_* girilirse GoDaddy mail kullanılır.

## 5. Başlat
- cPanel Node app → **Restart**.
- `https://ozsaye.com` aç; randevu formunu test et (gönderim → `/randevu/tesekkurler`).

## Güncelleme döngüsü
Kod değişince: `bash scripts/build-cpanel.sh` → yeni zip'i yükle/extract (eskisini değiştir) → cPanel'de **Restart**.

## Bilinen riskler / notlar
- cPanel Node app'i **kök yerine alt-yolda** (ör. `/ozsaye-app`) servis edebilir; alan adı köküne map etmek için Application URL'i domain köküne ayarla (gerekirse `.htaccess`/Passenger yönlendirmesi).
- Paylaşımlı hosting bellek/işlem limitleri SSR'ı zorlayabilir.
- Build'i **cPanel'de değil yerelde** yap (standalone zip yükle) — host'ta `next build` ağırdır.
- `output: "standalone"` `next.config.ts`'te açık.
