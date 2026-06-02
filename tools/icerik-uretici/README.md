# İçerik Üretici — Blog → Sosyal Medya Taslakları

Yayınlanan blog yazılarından (`content/blog/*.md`, `draft: false`) **Instagram**
ve **Facebook** için Türkçe paylaşım **taslakları** (metin + marka görseli)
üretir. Çıktılar `taslaklar/<slug>/` altına yazılır.

> **Önemli:** Bu araç **hiçbir yere otomatik paylaşım yapmaz.** Üretilen
> taslakları sen inceler, gerekirse düzenler ve elle paylaşırsın. Bu, ruh
> sağlığı içeriği için en güvenli ve platform/KVKK uyumlu yaklaşımdır.

## Akış

```
content/blog/<slug>.md  (draft:false)
        │
        ▼  node tools/icerik-uretici/index.cjs
taslaklar/<slug>/
        ├── instagram.txt   (metin + hashtag'ler)
        ├── facebook.txt    (metin + bağlantı + hashtag'ler)
        ├── gorsel.png      (1080×1080 marka görseli)
        └── meta.json       (durum: "taslak — onay bekliyor")
```

## Kurulum (kendi bilgisayarın / mini-PC)

1. **Node bağımlılıkları** (proje kökünde): `npm install`
2. **Marka fontları**: `bash scripts/setup-fonts.sh`
3. **Ollama** (yerel LLM): <https://ollama.com> üzerinden kur, ardından bir model indir:
   ```bash
   ollama pull llama3.1        # veya: gemma2, qwen2.5, mistral...
   ```
   Ollama varsayılan olarak `http://localhost:11434` üzerinde çalışır.

## Kullanım

```bash
# Bir kez çalıştır (Ollama ile)
node tools/icerik-uretici/index.cjs

# Sürekli izle — yeni yazı yayınlandıkça taslak üretir (varsayılan 60s)
node tools/icerik-uretici/index.cjs --watch --interval=120

# Belirli bir yazı için
node tools/icerik-uretici/index.cjs --slug=kaygi-ile-basa-cikmak

# Mevcut taslakların üstüne yeniden üret
node tools/icerik-uretici/index.cjs --force

# Ollama olmadan (şablon tabanlı taslak — test/yedek)
node tools/icerik-uretici/index.cjs --no-llm
```

### Ortam değişkenleri

| Değişken | Varsayılan | Açıklama |
| --- | --- | --- |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API adresi |
| `OLLAMA_MODEL` | `llama3.1` | Kullanılacak model |
| `SITE_URL` | `https://ozsayepsikoloji.com` | Bağlantılarda kullanılan alan adı |

## Sürekli çalıştırma (opsiyonel)

- **macOS:** `launchd` ile `--watch` modunu açılışta başlat.
- **Linux:** `systemd` servis ya da `cron` (`@reboot ... --watch`).
- **Windows:** Görev Zamanlayıcı.

## Onay & yayın

1. `taslaklar/<slug>/` içeriğini incele (metin + görsel).
2. Beğenirsen `instagram.txt` / `facebook.txt` metnini kopyala, `gorsel.png`'i
   yükle ve Instagram/Facebook'ta **elle** paylaş.
3. `meta.json` içindeki `durum` alanını kendi takibin için güncelleyebilirsin.

`taslaklar/` klasörü `.gitignore`'dadır; depoya gönderilmez (yerel kuyruktur).

## Notlar

- Metinler yerel LLM ile üretildiği için **veri dışarı çıkmaz**.
- Üretici, sistem komutuyla markaya uygun (Cormorant Garamond + Nunito, "Figür +
  Kanat" amblemi) görsel oluşturur; ortak çizim kütüphanesi `scripts/lib/brand.cjs`.
- Klinik tanı/iddia içermeyen, sıcak ve KVKK uyumlu bir ses tonu istenir
  (bkz. sistem promptu, `index.cjs`).
