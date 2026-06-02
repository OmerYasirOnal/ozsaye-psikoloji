# Öz & Saye Otomasyon

Local LLM (Ollama) ile Türkçe içerik üretip **web sitesi (blog)**, **Instagram**
ve **Facebook**'ta yayınlayan otomasyon servisi. Kendi bilgisayarınızda sürekli
çalışacak şekilde tasarlanmıştır.

Mimari ve detaylar: [`../docs/otomatik-icerik-sistemi.md`](../docs/otomatik-icerik-sistemi.md)

## Kurulum

```bash
# 1) Ollama'yı kurun: https://ollama.com  (sonra modeli indirin)
ollama pull qwen2.5:7b

# 2) Bağımlılıklar
cd automation
npm install

# 3) Ayarlar
cp .env.example .env
# .env içini doldurun (model, Meta token'ları, branch vb.)

# 4) Kontrol
npm run start -- doctor   # veya: node src/cli.js doctor
```

## Komutlar

```bash
node src/cli.js generate              # bir içerik taslağı üret (onay bekler)
node src/cli.js review                # bekleyen/onaylı içerikleri listele
node src/cli.js show <id>             # içeriği tam göster
node src/cli.js image <id> <url>      # Instagram için herkese açık görsel URL'si
node src/cli.js approve <id>          # onayla → yayın kuyruğu
node src/cli.js reject <id>           # reddet
node src/cli.js publish               # onaylıları yayınla (web push + FB + IG)
node src/cli.js start                 # sürekli mod (zamanlanmış üret + yayınla)
node src/cli.js doctor                # ortam/bağlantı kontrolü
```

> Kısa yol: `npm run generate`, `npm run review`, `npm run publish`, `npm run start`.

## Akış

1. **Üret** — `generate` Ollama ile JSON içerik üretir, `data/queue/pending/` altına koyar.
2. **Onayla** — `review` ile görüp `approve` edersiniz. (Instagram için önce `image`.)
3. **Yayınla** — `publish`:
   - Web: `content/yazilar/<slug>.md` yazar, `main`'e push eder → GoDaddy FTP deploy tetiklenir.
   - Facebook & Instagram: Meta Graph API ile paylaşır.

`start` modunda üretim zamanlanır (varsayılan: Pzt/Çar/Cum 10:00) ve onaylı
içerikler saatte bir otomatik yayınlanır. Onay her zaman manueldir.

## Notlar

- `DRY_RUN=true` ile hiçbir şey gerçekten gönderilmeden test edebilirsiniz.
- `.env` ve `data/` dizini gitignore'dadır; token'lar ve taslaklar repoya girmez.
- Instagram, paylaşım için herkese açık bir görsel URL'si zorunlu kılar; görsel
  yoksa Instagram atlanır, web ve Facebook devam eder.
