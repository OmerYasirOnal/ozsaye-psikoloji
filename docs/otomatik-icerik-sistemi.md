# Otomatik İçerik & Çok Platformlu Yayın Sistemi

Bu doküman, Öz & Saye Psikoloji için **Local LLM (Ollama)** ile Türkçe içerik
üreten ve bu içerikleri **web sitesi (blog/haberler)**, **Instagram** ve
**Facebook** üzerinde yayınlayan otomasyon sistemini anlatır.

> **Akış felsefesi:** Üret → **Onayla** → Yayınla. İçerik bir psikoloji
> kliniğine ait olduğu için, hiçbir şey insan onayı olmadan sosyal medyaya
> gönderilmez. LLM üretir, siz onaylarsınız, sistem yayınlar.

---

## 1. Neden iki parçalı bir mimari?

Web sitesi **statik** olarak (`output: "export"`) derlenip **GoDaddy paylaşımlı
Apache** sunucusuna **FTP** ile yüklenir (`.github/workflows/deploy-godaddy.yml`).
Statik bir host üzerinde sürekli çalışan bir sunucu veya Local LLM
**barındırılamaz**. Bu yüzden sistem iki parçaya ayrılır:

```
┌─────────────────────────────────────────────┐        ┌──────────────────────┐
│  KENDİ BİLGİSAYARINIZ (sürekli çalışan)       │        │  GitHub + GoDaddy     │
│                                               │        │                      │
│  Ollama (Local LLM)                           │        │                      │
│      │ üret                                   │        │                      │
│      ▼                                        │        │                      │
│  automation/  ──►  inceleme kuyruğu (pending) │        │                      │
│      │  (siz onaylarsınız)                    │        │                      │
│      ▼                                        │        │                      │
│  yayıncılar:                                  │        │                      │
│   • website ─ markdown yaz + git push ───────────────► main'e push           │
│   • facebook ─ Graph API ───────────────────────►  (Actions FTP deploy)      │
│   • instagram ─ Graph API                     │        │      │              │
│                                               │        │      ▼              │
└─────────────────────────────────────────────┘        │  ozsayepsikoloji.com │
                                                         └──────────────────────┘
```

- **Web sitesi içeriği**, `content/yazilar/*.md` dosyaları olarak repoya yazılır.
  Bu dosya `main` branch'ine push edilince GitHub Actions otomatik build alıp
  FTP ile siteye yükler. Yeni yazı sitede `/yazilar/<slug>/` adresinde yayınlanır.
- **Sosyal medya**, Meta Graph API üzerinden doğrudan yayınlanır.

---

## 2. Web sitesi blog/haber altyapısı (bu repoda)

| Dosya | Görev |
|-------|-------|
| `content/yazilar/*.md` | Yazılar (frontmatter + markdown gövde). Otomasyon buraya yazar. |
| `src/lib/blog.ts` | Markdown'ı build sırasında okuyup HTML'e çevirir. |
| `src/app/yazilar/page.tsx` | Tüm yazıların listelendiği sayfa (`/yazilar/`). |
| `src/app/yazilar/[slug]/page.tsx` | Yazı detay sayfası + BlogPosting JSON-LD. |
| `src/app/sitemap.ts` / `robots.ts` | Yazıları içeren otomatik sitemap + robots. |
| `src/components/Articles.tsx` | Anasayfadaki "Güncel Yazılar" bölümü (en yeni 3 yazı). |

Yeni bir `.md` eklendiğinde, bir sonraki build'de sayfa, liste, sitemap ve
anasayfa otomatik güncellenir. Statik export ile her yazı kendi
`/yazilar/<slug>/index.html` dosyası olarak üretilir.

### Frontmatter şeması

```yaml
---
title: "Yazı başlığı"
description: "140-160 karakter meta açıklama"
date: "2026-06-02"
category: "Anksiyete"
author: "Psk. Dan. Melek Yıldız"
tags: ["kaygı", "nefes"]
---
Markdown gövde buraya...
```

---

## 3. Otomasyon servisi (`automation/`)

Kendi bilgisayarınızda çalışan, kendi `package.json`'ı olan ayrı bir Node
projesidir. Kurulum ve komutlar için `automation/README.md` dosyasına bakın.

| Modül | Görev |
|-------|-------|
| `src/llm.js` | Ollama ile konuşur (JSON modunda üretim). |
| `src/prompts.js` | **"Studio" prompt'ları** — marka sesi + etik kurallar. |
| `src/topics.js` | Psikoloji konu havuzu. |
| `src/generate.js` | Konu seç → LLM ile üret → `pending` kuyruğa ekle. |
| `src/queue.js` | Dosya tabanlı inceleme kuyruğu (pending/approved/published/rejected). |
| `src/review.js` | Onay/ret/görsel ekleme komutları. |
| `src/publishers/website.js` | Markdown yaz + git commit/push (FTP deploy tetikler). |
| `src/publishers/meta.js` | Facebook Sayfası + Instagram yayını. |
| `src/publish.js` | Onaylıları platformlara yayınlar (kısmi tekrar güvenli). |
| `src/scheduler.js` | Sürekli mod: zamanlanmış üretim + yayın (node-cron). |
| `src/cli.js` | Komut satırı arayüzü. |

### Studio prompt'u

`src/prompts.js` içindeki `SYSTEM_PROMPT`, LLM'e şunları dayatır:

- Akıcı, doğru Türkçe; sıcak ve profesyonel marka sesi.
- **Teşhis koymama, tedavi vaadinde bulunmama**, sansasyon ve damgalamadan kaçınma.
- Kriz konularında profesyonel desteğe/acil hatlara yönlendirme.
- Uydurma vaka/danışan örneği yasak.
- Yalnızca istenen JSON şemasında çıktı (başlık, kategori, açıklama, etiketler,
  blog gövdesi, Instagram metni, Facebook metni, hashtag'ler).

Bu prompt'u markanıza göre özgürce düzenleyebilirsiniz; sistemin "studio" katmanı budur.

---

## 4. Yayın akışı (özet)

```bash
# 1) Üret (Ollama gerekir)
ozsaye generate                 # veya: ozsaye generate "kendi konunuz"

# 2) İncele ve onayla
ozsaye review                   # bekleyenleri listele
ozsaye show <id>                # içeriği tam gör
ozsaye image <id> <görsel-url>  # (Instagram için) herkese açık görsel ekle
ozsaye approve <id>             # onayla

# 3) Yayınla
ozsaye publish                  # web→git push, Facebook, Instagram

# Sürekli mod (zamanlanmış üretim + onaylıların otomatik yayını)
ozsaye start
```

**Önemli — Instagram görseli:** Instagram API'si paylaşım için **herkese açık bir
görsel URL'si** zorunlu kılar. Sistem metin/altyazı üretir; görseli siz
sağlarsınız (`ozsaye image`). Görsel yoksa Instagram atlanır, web ve Facebook
yayını devam eder. (Görsel üretimi/otomasyonu bu fazın kapsamı dışındadır.)

---

## 5. Meta (Facebook + Instagram) kurulum adımları

1. Facebook **Sayfası** oluşturun (klinik sayfanız).
2. Instagram hesabınızı **Business/Creator**'a çevirip bu Facebook Sayfasına bağlayın.
3. <https://developers.facebook.com> → **Uygulama oluştur** (tip: Business).
4. **Graph API Explorer** ile uzun ömürlü bir **Sayfa Erişim Token'ı** alın.
   Gerekli izinler: `pages_manage_posts`, `pages_read_engagement`,
   `instagram_basic`, `instagram_content_publish`.
5. **Sayfa ID**'sini ve **Instagram Business hesap ID**'sini not edin.
6. Bu değerleri `automation/.env` içine girin (`FB_PAGE_ID`,
   `FB_PAGE_ACCESS_TOKEN`, `IG_USER_ID`, `IG_ACCESS_TOKEN`).

> Uygulamanın canlı (Live) moda alınması ve bazı izinler için Meta **App
> Review** gerekebilir. Token'lar süreli olabilir; uzun ömürlü token kullanın
> ve gerektiğinde yenileyin.

---

## 6. Güvenlik ve sınırlar

- `.env` ve çalışma zamanı kuyruğu (`automation/data/`) **gitignore**'dadır;
  token'lar repoya girmez.
- `DRY_RUN=true` ile hiçbir şey gerçekten gönderilmeden tüm akış test edilebilir.
- Web yayını yalnızca `WEBSITE_DEPLOY_BRANCH`'e (varsayılan `main`) push eder;
  GoDaddy deploy bu push ile tetiklenir.
- **X/Twitter** bu fazın dışındadır (API ücretli). İleride aynı kalıpla
  `src/publishers/x.js` eklenerek `publish.js`'e bağlanabilir.

---

## 7. Sonraki adımlar (öneri)

- Görsel otomasyonu (örn. şablon + marka renkleriyle otomatik kapak görseli).
- X/Twitter yayıncısı.
- Basit bir web tabanlı onay paneli (CLI yerine).
- Üretilen içeriğin kalite kontrolü için ikinci bir LLM "editör" geçişi.
