# Durum ve Sonraki Adımlar — İçerik & Sosyal Medya Otomasyonu

> **Son güncelleme: 2026-07-10.** Genel proje durumu (site/panel/altyapı) için
> kanonik kaynaklar: `CLAUDE.md` + `docs/vercel-deploy-rehberi.md` (as-built).
> Bu doküman içerik/sosyal-medya otomasyon hattına odaklanır.

## Hedef
Blog'dan (uzmanların panelden yazdığı) **otomatik** Instagram içeriği: taslak
üretimi → **telefondan tek-dokunuş onay** → otomatik yayın. Ruh sağlığı içeriği
olduğundan insan-onay kapısı bilinçli olarak KALDIRILMAZ.

## ✅ Bugünkü durum (main'de, kurulu ve çalışır)
- **Site + panel CANLI:** `ozsaye.com` Vercel'de (2026-07-09 cutover). Blog
  kaynağı artık **DB** (`blog_posts`); uzmanlar `/panel/blog`'dan yazar/yayınlar
  (`content/blog/*.md` yalnız tarihî tohumdu). Randevu akışı, hasta onay/planlandı
  mailleri, KVKK gece temizliği, haftalık Neon yedeği: hepsi canlı.
- **İçerik üretici** — `tools/icerik-uretici/index.cjs`: yayınlanan yazıları
  **DB'den** okur; Ollama (`--no-llm` şablon yedeği var) ile Türkçe metin +
  1080×1080 marka görseli + **17 sn sessiz Reels videosu** (sharp+ffmpeg) üretir
  → `taslaklar/<slug>/` (gitignore).
- **Telegram onay botu** — `tools/icerik-uretici/telegram-bot.cjs`
  (@ozsaye_icerik_bot): taslağı görsel+Reels önizlemesi ve
  [✅ Yayınla / 🎬 Görsel+Reels / ❌ Atla] düğmeleriyle sohbete düşürür; dokunuş
  `poll` ile işlenir → onaylanan taslağı `instagram-yayinla.cjs` yayınlar.
  Güvenlik: yalnız `TG_CHAT_ID` sohbeti yetkili; durum makinesi
  `taslak → bildirildi → onaylandi/reddedildi → paylasildi` (idempotent offset).
- **Instagram yayınlayıcı** — `instagram-yayinla.cjs`: medyayı Vercel Blob'a
  yükler, `graph.instagram.com` container+publish (IMAGE/REELS). **Dry-run
  varsayılan**; gerçek yayın `--yayinla` + `IG_ACCESS_TOKEN`/`IG_USER_ID` ister
  (yoksa Türkçe fail-fast). `--token-yenile` ile 60 günlük token tazelenir.
- **launchd (bu Mac'te kurulu):** `com.ozsaye.telegram-poll` (120 sn'de bir
  dokunuş işler) · `com.ozsaye.icerik-uret` (her sabah 09:30 üret+bildir; yeni
  yazı yoksa uykuda) · `com.ozsaye.neon-yedek` (Cumartesi 04:00 yedek).
- Sırlar `tools/icerik-uretici/.env.local` + kökteki `.env.neon-prod.local`
  (ikisi de gitignore'lu).

## İşletim (günlük akış)
1. Uzman panelden yazı yayınlar (`/panel/blog`).
2. Ertesi sabah 09:30 launchd üretir + Telegram'a düşürür (elle:
   `node tools/icerik-uretici/index.cjs && node tools/icerik-uretici/telegram-bot.cjs notify`).
3. Telefondan ✅/🎬/❌ — en geç 2 dk içinde işlenir; ✅ → Instagram'da yayın +
   sohbete kalıcı link döner.

> Ayrıntı/kurulum: `tools/icerik-uretici/README.md` ·
> Instagram'ın kodsuz oto-yanıtları için klinik rehberi:
> `docs/instagram-otomatik-yanit-rehberi.md`.

## ⏳ Bekleyen (dış girdi — kod hazır)
- **Instagram token'ı (TEK eksik halka):** Meta geliştirici kaydı SMS-doğrulama
  adımında yarım. Tamamlanınca "Instagram business login" ürününden token
  üretilecek (izinler: `instagram_business_basic`, `..._content_publish`,
  `..._manage_comments`, `..._manage_messages`) → `tools/icerik-uretici/.env.local`'e
  `IG_ACCESS_TOKEN` + `IG_USER_ID` (gerçek yayın ayrıca `BLOB_READ_WRITE_TOKEN`
  ister — medya önce Blob'a yüklenir; kök `.env.local`'de zaten tanımlıysa yeter). O ana dek ✅ düğmesi kibar bir hata verir;
  dry-run/❌ akışları tam çalışır. **Kendi hesabına yayın için App Review GEREKMEZ.**
- Melek & Sacide'nin Telegram grubuna alınması (grup id'si negatiftir;
  `TG_CHAT_ID` güncellenir).
- İleri sürüm fikirleri (talebe bağlı): Story otomasyonu, yorumlara otomatik
  cevap + DM karşılama (izinler baştan isteniyor; soğuk DM platform gereği
  imkânsız, yorum-beğenme API'de yok), müzikli Reels (lisans nedeniyle v1 sessiz;
  müzik IG uygulamasından eklenir).
- X/Twitter: API ücretli olduğu için bilinçli yok.

## Kalıcı kararlar (neden böyle)
- **İnsan-onay kapısı kalıcıdır** — tam-otomatik yayın modu bilinçli yazılmadı
  (ruh sağlığı içeriği + platform/KVKK hijyeni).
- **Kanonik blog `/blog`** — ikinci blog route'u açılmaz.
- **Yerel üretim (Ollama + bu Mac)** — veri cihazdan çıkmaz; launchd akışları
  Mac açıkken çalışır (kapalı gün kaçan üretim ertesi sabaha kalır, kayıp olmaz).
