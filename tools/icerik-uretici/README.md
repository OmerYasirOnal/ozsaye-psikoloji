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

Durum makinesi:

```
taslak → bildirildi → onaylandi → paylasildi
                   ↘ reddedildi
```

Yalnız `onaylandi` taslaklar yayınlanabilir. `bildirildi` = Telegram'a onay için
gönderildi (tekrar-bildirim önlenir); `reddedildi` = ❌ Atla ile elenmiş.
Onay **elle** (terminalden `--onayla`) **veya** telefondan Telegram butonuyla
verilebilir — bkz. "Telegram onay botu".

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

## Telegram onay botu (telefondan onayla → otomatik yayınla)

Taslakları bilgisayara oturmadan, **telefondan** onaylayıp yayınlamak için
Telegram köprüsü. Mimari, kanıtlanmış bir kardeş projedeki desenin (promptane)
Node portudur: stdlib yerine global `fetch` + enjekte edilebilir ağ katmanı.

### Yeni akış

```
index.cjs (üret)
     │
telegram-bot.cjs notify        →  Telegram'a: görsel + başlık + [✅ Yayınla] [🎬 Görsel+Reels] [❌ Atla]
     │                              (+ reels.mp4 varsa önizleme videosu)
telefondan bir butona dokun
     │
telegram-bot.cjs poll  (launchd 120 sn'de bir)
     │
✅ → durum onaylandi → instagram-yayinla.cjs --yayinla --slug <slug> --tur <tur> → "✅ Yayınlandı: <permalink>"
❌ → durum reddedildi (yayınlanmaz)
```

Butona basmak, `instagram-yayinla.cjs`'i **onaylanmış tek taslak** için çalıştırır;
otomatik toplu yayın yoktur (insan kapısı korunur).

### Alt komutlar

```bash
node tools/icerik-uretici/telegram-bot.cjs whoami        # bota son yazan chat id'sini yazdır (kurulum)
node tools/icerik-uretici/telegram-bot.cjs send "mesaj"  # düz metin gönder
node tools/icerik-uretici/telegram-bot.cjs notify        # durumu 'taslak' olanları onaya gönder
node tools/icerik-uretici/telegram-bot.cjs notify <slug> # yalnız o taslağı gönder
node tools/icerik-uretici/telegram-bot.cjs notify --hepsi # tüm 'taslak' durumundakiler
node tools/icerik-uretici/telegram-bot.cjs notify <slug> --yeniden  # bildirilmişi tekrar gönder
node tools/icerik-uretici/telegram-bot.cjs poll          # onay dokunuşlarını işle (launchd tetikler)
```

`notify`, bildirdiği taslağın durumunu `bildirildi` yapar → tekrar bildirmez
(`--yeniden` zorlar). Bir taslağın gönderimi başarısız olursa **diğerleri
engellenmez**; başarısız olan `taslak` durumunda kalır ve sonraki koşuda
yeniden denenir. `poll` idempotenttir: işlenen `update_id`'ler
`taslaklar/.tg-offset` dosyasında tutulur, aynı dokunuş iki kez işlenmez.

### BotFather kurulumu (bir kez; ~3 dk)

1. Telegram'da **@BotFather** → `/newbot` → ad + kullanıcı adı ver → verilen
   **token**'ı al → `tools/icerik-uretici/.env.local` içine `TG_BOT_TOKEN=` yaz.
2. Yeni botuna Telegram'dan bir mesaj yaz (`/start`), sonra:
   ```bash
   node tools/icerik-uretici/telegram-bot.cjs whoami   # chat id'ni yazdırır
   ```
   Çıkan sayıyı `.env.local`'e `TG_CHAT_ID=` olarak yaz.
   - **Grup kullanıyorsan**: grup chat id'si **NEGATİFtir** (ör. `-1001234567890`);
     botu gruba ekle, gruba bir mesaj at, sonra `whoami`.

**Bot privacy ayarı (doğrulanmış davranış):** inline buton onayları
`callback_query` güncellemesi olarak gelir ve **bot privacy ayarından
ETKİLENMEZ** — callback'ler botun sahibine **her zaman** iletilir. Privacy modu
(BotFather `/setprivacy`) yalnızca **gruplarda botun hangi düz mesajları
göreceğini** kısıtlar; onay butonlarımızı etkilemez, dolayısıyla değiştirmene
gerek yok. (Tek istisna: bir **grupta** `whoami`'nin mesajını görebilmesi için
ya bota reply at ya da o tek seferlik kurulumda privacy'yi kapat; 1:1 sohbette
bu sorun yoktur.)

### Güvenlik modeli

- **Yalnız `TG_CHAT_ID` chat'inden gelen callback iş yapar.** Başka biri botu
  bulup butona bassa bile `answerCallbackQuery("Yetkisiz")` ile reddedilir ve
  loglanır (bkz. `decideCallback` → `authorized`).
- Yayın hatasında durum `bildirildi`ye **geri alınır** ve Telegram'a **PII'siz**
  ("token/URL/ayrıntı yok") kısa bir uyarı gider; tekrar denenebilir. Teşhis
  ayrıntısı (publisher stdout/stderr kuyruğu) yalnız **yerel loga** yazılır.
- **Sahte başarıya karşı doğrulama:** publisher `exit 0` dönse bile yayın ancak
  `meta.json`'daki durum gerçekten `paylasildi` olduysa başarı sayılır
  (publisher, plan-dışı kalan taslakta da 0 dönebilir — ör. `gorsel.png` yoksa).
- **Uzun slug'lar:** Telegram `callback_data` sınırı **64 bayttır** (aşan buton
  mesajın TAMAMINI 400 ile düşürür). Uzun slug butonda otomatik kısaltılır,
  `poll` tarafında **tek önek eşleşmesiyle** gerçek klasöre geri çözülür;
  eşleşme belirsizse **asla yayınlanmaz** ("Taslak bulunamadı").
- `TG_BOT_TOKEN`/`TG_CHAT_ID` yoksa komutlar **hızlı ve net Türkçe hata** ile
  durur (`exit 1`) — kör çalışmaz.

### launchd ile otomasyon (macOS)

İki job (`tools/icerik-uretici/launchd/`):

| plist | ne yapar | tetik |
| --- | --- | --- |
| `com.ozsaye.telegram-poll.plist` | `poll` — onay dokunuşlarını işler | her 120 sn + yükleme |
| `com.ozsaye.icerik-uret.plist` | `uret-ve-bildir.sh`: üret → `notify --hepsi` | her gün 09:30 |

Kurulum:

```bash
# 0) Log dizinini oluştur (loglar/ .gitignore'dadır):
mkdir -p loglar

# 1) plist'lerdeki yolları KENDİ checkout'una göre kontrol et. Varsayılan:
#    /Users/omeryasironal/Projects/özsaye_psikoloji  ve  /opt/homebrew/bin/node
#    Farklıysa iki plist'te + gerekiyorsa uret-ve-bildir.sh'te düzenle.
#    (launchd PATH'i dardır; bu yüzden node'un TAM yolu gömülüdür — `which node`.)

# 2) Kopyala ve yükle:
cp tools/icerik-uretici/launchd/com.ozsaye.telegram-poll.plist ~/Library/LaunchAgents/
cp tools/icerik-uretici/launchd/com.ozsaye.icerik-uret.plist   ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.ozsaye.telegram-poll.plist
launchctl load ~/Library/LaunchAgents/com.ozsaye.icerik-uret.plist

# Durumu gör / logu izle:
launchctl list | grep ozsaye
tail -f loglar/telegram-poll.log

# Kaldırma:
launchctl unload ~/Library/LaunchAgents/com.ozsaye.telegram-poll.plist
launchctl unload ~/Library/LaunchAgents/com.ozsaye.icerik-uret.plist
```

> Not: `poll`, yalnız DB/token gerektiren gerçek yayını **buton onayıyla**
> tetikler; kendi başına içerik üretmez. Üretim + bildirim ayrı job'dur (09:30).

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
| `TG_BOT_TOKEN` | Telegram botu | BotFather token'ı (`whoami`/`send`/`notify`/`poll`) |
| `TG_CHAT_ID` | Telegram botu | İzinli chat id (`send`/`notify`/`poll`; güvenlik kapısı) |

## Notlar

- **DRY-RUN varsayılandır**; gerçek yayın yalnız `--yayinla` + kimlik bilgileriyle.
  Kimlik eksikse araç **hızlı ve net Türkçe hata** ile durur.
- Metinler yerel LLM ile üretilirse **veri dışarı çıkmaz**; sıcak, KVKK uyumlu,
  klinik tanı/iddia içermeyen ses tonu istenir (bkz. sistem promptu, `index.cjs`).
- `taslaklar/` `.gitignore`'dadır (yerel onay kuyruğu; depoya gönderilmez).
- Saf mantık `lib/*.cjs` altında ve Vitest ile test edilir (ağ/DB/ffmpeg/Ollama
  gerektirmez): `lib/instagram.cjs`, `lib/ig-client.cjs`, `lib/durum.cjs`,
  `lib/reels.cjs`, `lib/telegram.cjs` (ağ katmanı enjekte edilen `fetch` ile,
  `applyCallback` orkestrasyonu enjekte edilen `spawn` ile test edilir).
- Telegram botu: `taslaklar/.tg-offset` (getUpdates offset'i) ve `loglar/*.log`
  (launchd) `.gitignore`'dadır.
