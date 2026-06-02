# GoDaddy'ye Deploy Rehberi (Özsaye Psikoloji)

Bu site **Next.js 16** ile yazıldı ama tamamen **statik** (tek sayfa, sunucu
tarafı kod / veritabanı yok). Bu yüzden GoDaddy'nin WordPress/paylaşımlı
(Apache + PHP) hostingine **Node.js gerektirmeden** yüklenebilir.

Proje `output: "export"` ile build edildiğinde tüm site `out/` klasöründe
saf HTML + CSS + JS olarak üretilir. Yapılması gereken: bu klasörü hostinge
yüklemek.

```bash
npm install
npm run build      # -> out/ klasörü oluşur
```

---

## ⚠️ Önce karar: WordPress'e ne olacak?

Şu anda domain GoDaddy'de WordPress'i gösteriyor. İki seçenek var:

### Seçenek A — WordPress'i bu site ile DEĞİŞTİR (önerilen)
Domain (`alanadiniz.com`) doğrudan yeni siteyi açar.
- Yükleme hedefi: `public_html/`
- WordPress dosyaları (wp-admin, wp-content, wp-includes, wp-config.php...)
  ve veritabanı artık kullanılmayacak. **Önce yedek alın** (aşağıya bakın).

### Seçenek B — WordPress'i KORU, yeni siteyi alt adres/klasöre koy
- Alt klasör: `public_html/yeni/` -> `alanadiniz.com/yeni/`
- Veya subdomain: cPanel'den `yeni.alanadiniz.com` subdomain'i oluşturup
  onun kök klasörüne yükleyin.

> Seçimi yaptıktan sonra GitHub Actions iş akışındaki `server-dir` değerini
> (`.github/workflows/deploy-godaddy.yml`) buna göre ayarlayın.

---

## Yöntem 1 — Elle yükleme (cPanel File Manager) — en hızlısı

1. **Yedek al:** cPanel > File Manager > `public_html` klasörünü seç >
   "Compress" ile zip yap ve indir. (Veritabanı için: cPanel > phpMyAdmin >
   ilgili DB > Export.)
2. GoDaddy cPanel > **File Manager** > `public_html` içine gir.
3. (Seçenek A ise) eski WordPress dosyalarını sil veya `eski-wp/` adlı bir
   klasöre taşı.
4. **Upload** > `ozsaye-psikoloji-static.zip` dosyasını yükle.
   (Bu zip `out/` klasörünün içeriğidir — bu sohbette size gönderildi.)
5. Yüklenen zip'e sağ tık > **Extract**. İçerik doğrudan `public_html`
   (veya seçtiğiniz klasör) altına çıkmalı; içinde `index.html`,
   `_next/`, `.htaccess` görünmeli.
6. Tarayıcıda domaini aç. (Önbellek için Ctrl+F5.)

> Not: `.htaccess` gizli dosyadır. File Manager'da Settings > "Show Hidden
> Files" açık olmalı ki görünsün.

## Yöntem 2 — FTP ile elle yükleme

1. cPanel > **FTP Accounts** > bir FTP hesabı oluştur/şifre al.
2. FileZilla ile bağlan (Host: `ftp.alanadiniz.com`, kullanıcı/şifre).
3. `out/` klasörünün **içindeki** tüm dosyaları `public_html/`
   (veya hedef klasöre) sürükle.

## Yöntem 3 — GitHub Actions ile OTOMATİK deploy (önerilen, sürdürülebilir)

Repoda hazır iş akışı var: `.github/workflows/deploy-godaddy.yml`.
Bir kez ayarlayınca, her `main`'e push'ta site otomatik build edilip
GoDaddy'ye FTP ile yüklenir.

Kurulum:
1. GitHub repo > **Settings > Secrets and variables > Actions > New secret**:
   - `FTP_SERVER` = `ftp.alanadiniz.com` (cPanel FTP sunucu adresi)
   - `FTP_USERNAME` = FTP kullanıcı adınız
   - `FTP_PASSWORD` = FTP şifreniz
2. İş akışındaki `server-dir`'i seçeneğinize göre ayarlayın
   (`public_html/` veya `public_html/yeni/`).
3. Actions sekmesi > "GoDaddy'ye Deploy (FTP)" > **Run workflow** ile elle
   tetikleyin ya da `main`'e push yapın.

---

## Domain / DNS notu
Domain zaten GoDaddy hostingine bağlı (WordPress orada çalıştığına göre).
Dosyaları `public_html`'e koyduğunuzda DNS değişikliği gerekmez; domain
otomatik yeni siteyi gösterir. Subdomain seçeneğinde sadece cPanel'den
subdomain oluşturmak yeterli, harici DNS ayarı gerekmez.

## İçeriği güncelleme
Kod değişince tekrar `npm run build` çalıştırıp `out/` içeriğini yeniden
yükleyin (veya Actions otomatik yapar). Tarayıcıda Ctrl+F5 ile önbelleği
temizleyin.
