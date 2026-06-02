# Durum ve Sonraki Adımlar — İçerik & Sosyal Medya Otomasyonu

Bu doküman, blog + yerel LLM ile sosyal medya içerik otomasyonu çalışmasının
**mevcut durumunu**, **nasıl işletileceğini** ve **bekleyen işleri** özetler.
Operasyon **bilgisayar üzerinden** yürütülür (yerel LLM tercihi).

## Hedef
Türkçe blog/haber yayını + yerel LLM (Ollama) ile **sürekli** içerik üretimi;
Instagram/Facebook için **taslak → onay → elle paylaşım** akışı.

## ✅ Tamamlanan (main'de)
- **Web blog/haberler** — `/blog` (liste) + `/blog/[slug]` (detay). İçerik
  `content/blog/*.md`; `draft: true` yayınlanmaz. Anasayfa "Yazılar" bölümü en
  yeni 3 yazıyı gösterir.
- **İçerik üretici** — `tools/icerik-uretici/` (Ollama). Yayınlanan yazılardan
  Instagram/Facebook için Türkçe metin + 1080×1080 marka görseli taslağı üretir.
  **Otomatik paylaşım yok**; çıktı `taslaklar/<slug>/` (gitignore) altına yazılır.
- **CI** — `.github/workflows/ci.yml`: her PR'da `npm ci → lint → build`.
- **Deploy** — `.github/workflows/deploy-godaddy.yml`: main push'ta statik
  `out/` → GoDaddy FTP.

## İşletim (bilgisayarda, adım adım)
1. **Kurulum (bir kez):**
   - Proje kökünde `npm install`
   - `bash scripts/setup-fonts.sh` (marka fontları)
   - Ollama kur (<https://ollama.com>) ve model indir: `ollama pull llama3.1`
2. **Yeni içerik:** `content/blog/` altına yeni `.md` yazı ekle (veya mevcut
   taslakları yayınla) → site build'inde otomatik yayınlanır.
3. **Sosyal taslak üret:**
   ```bash
   node tools/icerik-uretici/index.cjs            # bir kez
   node tools/icerik-uretici/index.cjs --watch    # sürekli (bilgisayar açıkken)
   ```
4. **Onayla & paylaş:** `taslaklar/<slug>/` içindeki `instagram.txt`,
   `facebook.txt`, `gorsel.png` dosyalarını incele → telefondan/masaüstünden
   Instagram ve Facebook'a **elle** paylaş.

> Detaylı seçenekler ve ortam değişkenleri: `tools/icerik-uretici/README.md`.

## ⏳ Bekleyen / dış engele bağlı işler
- **Instagram/Facebook'a gerçek OTOMATİK yayın** (taslak değil): Meta İş hesabı +
  Facebook Sayfası + Instagram Business + **uygulama onayı (App Review)** + token
  gerekir. Hazır olunca Meta Graph API ile "onaylı taslağı tek tıkla paylaş"
  adımı eklenebilir. (Bu kod daha önce yazıldı; kapatılan PR #6'da duruyor.)
- **X/Twitter:** Eklenmedi — API ücretli olduğu için bilinçli ertelendi.
- **PR #1** (büyük SEO/AIO + çalışan randevu formu + `/hizmetler` ve `/ekip`
  detay sayfaları): açık ve beklemede. Blog'u merge edilen `/blog` ile çakıştığı
  için, blog kısmı çıkarılıp diğer parçalar yeni main'e parça parça taşınmalı.

## Bu oturumda alınan kararlar (neden böyle)
- **Kanonik blog `/blog`'tur**; ikinci bir blog route'u (`/yazilar`) açılmaz —
  tekrar/çakışma yarattığı için.
- **Otomatik yayın yerine taslak + onay** — klinik/ruh sağlığı içeriği,
  KVKK ve platform kuralları için en güvenli yaklaşım.
- **Yerel LLM (Ollama)** tercih edildi → veri cihazdan çıkmaz; üretim için
  bilgisayarın açık olması gerekir.
- PR temizliği: #6 kapatıldı (tekrar/çakışma), #8 (üretici) + #9 (teklif
  dokümanı) merge, #10 CI eklendi, #12 ile `CLAUDE.md` notları güncellendi.

## Sıradaki karar (hazır olduğunuzda)
1. Meta İş hesabı + uygulama onayını başlatmak → gerçek otomatik IG/FB yayını
2. X/Twitter ücretli API'ye girmek
3. PR #1'in değerli parçalarını taşımaya başlamak
