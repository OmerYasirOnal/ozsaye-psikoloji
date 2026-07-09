# İçerik Üretici — Blog → Instagram (taslak + onay + yayın)

Yayınlanan blog yazılarından (**kaynak: DB `blog_posts`, `status='published'`)
**Instagram** için Türkçe **taslak** üretir: gönderi metni, marka görseli ve
**sessiz Reels videosu**. Çıktılar `taslaklar/<slug>/` altına yazılır.

> **Güvenlik ilkesi — otomatik yayın YOK.** Bu sistem hiçbir şeyi kendiliğinden
> paylaşmaz. Önce taslak üretilir, sen incelersin, **elle onaylarsın**, ancak
> ondan sonra yayınlanabilir (insan kapısı). "Hepsini otomatik paylaş" modu ruh
> sağlığı içeriği için **bilinçli olarak yoktur** ve eklenmemelidir.

## Akış

```
DB blog_posts (status=published)
        │  node index.cjs                (üret)
        ▼
taslaklar/<slug>/
   ├── instagram.txt   (metin + hashtag'ler = Instagram başlığı)
   ├── facebook.txt    (metin + bağlantı + hashtag'ler)
   ├── gorsel.png      (1080×1080 marka görseli)
   ├── reels.mp4       (1080×1920, ~17 s, SESSİZ marka videosu)
   └── meta.json       (durum: "taslak")
        │  node index.cjs --onayla <slug>   (İNCELE → ONAYLA; durum: "onaylandi")
        ▼
   node instagram-yayinla.cjs            (dry-run: planı göster)
   node instagram-yayinla.cjs --yayinla  (GERÇEK yayın; durum: "paylasildi")
```

Durum makinesi: `taslak` → `onaylandi` → `paylasildi`. Yalnız `onaylandi`
taslaklar yayınlanabilir.

## Kurulum (kendi bilgisayarın / mini-PC)

1. **Node bağımlılıkları** (proje kökünde): `npm install`
2. **Marka fontları**: `bash scripts/setup-fonts.sh`
   (sudo'suz: `BRAND_FONT_DIR=./.fonts bash scripts/setup-fonts.sh` ve çalıştırırken
   aynı `BRAND_FONT_DIR`'i ayarla.)
3. **ffmpeg** (Reels için): `brew install ffmpeg` (yoksa reels adımı zarifçe atlanır).
4. **Ollama** (yerel LLM, opsiyonel): <https://ollama.com> → `ollama pull llama3.1`
   (yoksa `--no-llm` ile şablon tabanlı metin üretilir).
5. **Ortam değişkenleri**: `cp tools/icerik-uretici/.env.local.example tools/icerik-uretici/.env.local`
   ve doldur. `DATABASE_URL` / `BLOB_READ_WRITE_TOKEN` proje kökü `.env.local`'de
   zaten varsa burada tekrar gerekmez (öncelik: process.env > araç-yerel > kök).

## Kullanım

### 1) Üret
```bash
node tools/icerik-uretici/index.cjs                 # yayınlı yazılardan taslak üret
node tools/icerik-uretici/index.cjs --no-llm        # Ollama olmadan (şablon)
node tools/icerik-uretici/index.cjs --slug=<slug>   # tek yazı
node tools/icerik-uretici/index.cjs --watch         # sürekli izle (yeni yazı geldikçe)
node tools/icerik-uretici/index.cjs --force         # mevcut taslakların üstüne yaz
```

### 2) İncele & onayla
```bash
# taslaklar/<slug>/ içeriğini aç: instagram.txt, gorsel.png, reels.mp4
node tools/icerik-uretici/index.cjs --durum            # tüm taslakların durumu
node tools/icerik-uretici/index.cjs --onayla <slug>    # yayına onayla
```

### 3) Yayınla
```bash
# DRY-RUN (VARSAYILAN) — hiçbir ağ isteği yapmaz, yalnız planı basar:
node tools/icerik-uretici/instagram-yayinla.cjs
node tools/icerik-uretici/instagram-yayinla.cjs --tur ikisi   # görsel + reels planı

# GERÇEK yayın (kimlik bilgisi gerekli — aşağıya bak):
node tools/icerik-uretici/instagram-yayinla.cjs --yayinla                 # 1 taslak (görsel)
node tools/icerik-uretici/instagram-yayinla.cjs --yayinla --tur ikisi     # görsel + reels
node tools/icerik-uretici/instagram-yayinla.cjs --yayinla --adet 2        # en çok 2 taslak
node tools/icerik-uretici/instagram-yayinla.cjs --slug=<slug> --yayinla   # yalnız bu taslak
```
`--tur`: `gorsel` (vars.) · `reels` · `ikisi`. `--adet N`: bu çağrıda en çok N
taslak (vars. 1 — hız güvenliği). Reels başlığı = `instagram.txt`.

## Instagram token (bir kez; ~15 dk)

"**Instagram API with Instagram Login**" varyantı kullanılır — **Facebook Sayfası
GEREKMEZ**, doğrudan Instagram **profesyonel** (İşletme/Yaratıcı) hesabıyla çalışır.

1. Instagram hesabını **profesyonel** yap (uygulama → Ayarlar → Hesap türü).
2. <https://developers.facebook.com> → **Create App**.
3. Uygulamaya **Instagram** ürününü ekle → "**API setup with Instagram business
   login**".
4. Instagram hesabını bağla ve **Generate access token** ile **uzun ömürlü**
   (60 gün) token'ı al → `.env.local`'e `IG_ACCESS_TOKEN=` olarak yaz.
5. `IG_USER_ID`'yi al:
   ```bash
   curl "https://graph.instagram.com/v23.0/me?fields=user_id,username&access_token=TOKEN"
   ```
   Dönen `user_id`'yi `.env.local`'e `IG_USER_ID=` olarak yaz.
6. **Development mode yeterlidir** — kendi bağlı hesabın için yayın yapmak
   **App Review GEREKTİRMEZ**. (App Review yalnız başkalarının hesapları / genel
   dağıtım için gerekir.)

Ayrıca medya barındırma için `BLOB_READ_WRITE_TOKEN` (Vercel Blob) gerekir:
Instagram, görsel/videoyu **genel bir URL'den** çeker; bu yüzden dosyalar önce
Vercel Blob'a (`instagram/<slug>/...`) yüklenir.

### Token yenileme (60 günde bir)
Uzun ömürlü token **60 gün** geçerlidir; süresi dolmadan yenile:
```bash
node tools/icerik-uretici/instagram-yayinla.cjs --token-yenile        # yeni token'ı yazdır
node tools/icerik-uretici/instagram-yayinla.cjs --token-yenile --yaz  # .env.local'e yaz
```

## Reels hakkında (v1 — sessiz slayt-video)

- 1080×1920, ~17 s, **H.264/yuv420p/30fps**, **sessiz**.
- 3–4 marka-tipografi karesi (giriş → başlık → özet → çağrı) `sharp` ile render
  edilip `ffmpeg` **xfade (fade)** ile birleştirilir.
- **Müzik bilinçli olarak eklenmez** (lisans). Yayından önce müziği **Instagram
  uygulaması içinden** ekleyebilirsin — sessiz video buna izin verir.
- `ffmpeg` yoksa reels adımı **atlanır** (görsel + metin yine üretilir).

## Ortam değişkenleri

| Değişken | Gerekli? | Açıklama |
| --- | --- | --- |
| `DATABASE_URL` | üretim için | Yayınlı yazıları okur (kök `.env.local`'de olabilir) |
| `IG_ACCESS_TOKEN` | gerçek yayın | Uzun ömürlü Instagram token'ı |
| `IG_USER_ID` | gerçek yayın | Instagram profesyonel hesap kullanıcı kimliği |
| `BLOB_READ_WRITE_TOKEN` | gerçek yayın | Vercel Blob (medyayı genel URL'ye yükler) |
| `IG_API_VERSION` | hayır | Varsayılan `v23.0` |
| `IG_HANDLE` | hayır | Görsel imzası (vars. `@ozsayepsikoloji`) |
| `OLLAMA_URL` / `OLLAMA_MODEL` | hayır | Yerel LLM (vars. `http://localhost:11434` / `llama3.1`) |
| `SITE_URL` | hayır | Bağlantı alan adı (vars. `https://ozsaye.com`) |
| `FFMPEG_PATH` | hayır | `ffmpeg` PATH'te değilse yolu |

## Notlar

- **DRY-RUN varsayılandır**; gerçek yayın yalnız `--yayinla` + kimlik bilgileriyle.
  Kimlik eksikse araç **hızlı ve net Türkçe hata** ile durur.
- Metinler yerel LLM ile üretilirse **veri dışarı çıkmaz**; sıcak, KVKK uyumlu,
  klinik tanı/iddia içermeyen ses tonu istenir (bkz. sistem promptu, `index.cjs`).
- `taslaklar/` `.gitignore`'dadır (yerel onay kuyruğu; depoya gönderilmez).
- Saf mantık `lib/*.cjs` altında ve Vitest ile test edilir (ağ/DB/ffmpeg/Ollama
  gerektirmez): `lib/instagram.cjs`, `lib/ig-client.cjs`, `lib/durum.cjs`, `lib/reels.cjs`.
