# Site AI Asistanı (Mac tarafı)

`ozsaye.com`'daki sohbet widget'ının arkasındaki yerel Ollama sarmalayıcısı.
Mimari ve tasarım kararları: `docs/superpowers/specs/2026-07-11-site-ai-asistani-design.md`.

## Kurulum

1. **Ollama'yı kur ve modeli indir** (bir kere):
   ```bash
   brew install ollama
   ollama pull qwen2.5:7b
   ```

2. **Ortam değişkenlerini ayarla:**
   ```bash
   cp tools/site-asistan/.env.local.example tools/site-asistan/.env.local
   # ASISTAN_SECRET için: openssl rand -base64 32
   # çıkan değeri hem bu dosyaya hem de Vercel Production env'e
   # (AI_ASISTAN_SECRET adıyla) yazın.
   ```

3. **Sunucuyu başlat:**
   ```bash
   node tools/site-asistan/server.cjs
   ```
   `http://localhost:8787` üzerinde dinlemeye başlar.

4. **Tailscale Funnel ile dışa aç** (bir kere kurulum, `tailscale.com/download`):
   ```bash
   tailscale funnel 8787
   ```
   Çıktıda verilen `https://<makine-adı>.<tailnet>.ts.net` adresini kopyalayın.

5. **Vercel Production env'e ekleyin** (`vercel env add`, ya da Vercel Dashboard'dan):
   - `AI_ASISTAN_URL` = 4. adımdaki `https://....ts.net` adresi
   - `AI_ASISTAN_SECRET` = 2. adımda ürettiğiniz secret

6. **Değişikliğin canlıya yansıması için yeniden deploy edin** (env değişikliği yalnız
   YENİ bir deploy'da etkinleşir — mevcut production deployment eski env'i kullanmaya
   devam eder):
   ```bash
   vercel redeploy <mevcut-production-url> --target production
   ```

7. **Sürekli çalışır durumda tut** (Mac yeniden başlarsa otomatik ayağa kalksın) —
   hazır plist'ler `launchd/` altında (biri `tailscaled` userspace daemon'u, biri
   bu sunucu; Funnel yapılandırması daemon durumunda saklıdır, daemon kalkınca
   kendiliğinden geri gelir):
   ```bash
   mkdir -p loglar
   cp tools/site-asistan/launchd/*.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.ozsaye.tailscaled.plist
   launchctl load ~/Library/LaunchAgents/com.ozsaye.site-asistan.plist
   ```

> **Not (bu makinedeki kurulum):** Tailscale, GUI uygulaması yerine Homebrew
> formülüyle (`brew install tailscale`) ve **userspace** modda kuruludur — sudo
> gerektirmez, Funnel bu modda da çalışır. Durum/soket dizini:
> `~/.tailscale-asistan/`. CLI kullanırken soketi belirtin:
> `tailscale --socket ~/.tailscale-asistan/tailscaled.sock <komut>`.

## Doğrulama

```bash
curl -X POST http://localhost:8787/sohbet \
  -H "Content-Type: application/json" \
  -H "X-Asistan-Secret: <ASISTAN_SECRET değeriniz>" \
  -d '{"mesaj":"Randevu nasıl alırım?","gecmis":[],"siteIcerigi":"Test klinik bilgisi."}'
```
Beklenen: `{"cevap": "..."}` şeklinde bir JSON.

## Loglar

Her konuşma, `tools/site-asistan/gunluk.tsv` dosyasına **anonim** bir satır
olarak yazılır (yalnız zaman damgası + kaba kategori — kişisel veri/mesaj
metni yok). Bu dosya `.gitignore`'dadır (repoya commit'lenmez).
