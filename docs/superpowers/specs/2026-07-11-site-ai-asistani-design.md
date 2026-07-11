# Site AI Asistanı (SSS/Yönlendirme Botu)
## Tasarım Dokümanı (Spec)

- **Tarih:** 2026-07-11 · **Durum:** Onaylandı (kullanıcı) · **Dal:** `site-ai-asistani` (önerilen)
- **Amaç:** Sitede tüm sayfalarda erişilebilir küçük bir sohbet widget'ı — ziyaretçilerin "hangi hizmet bana uygun?", "randevu nasıl alınır?", "ücretler nedir?", "hangi uzmana gitmeliyim?" gibi sorularına, **yalnızca site içeriğine dayanarak** cevap verir. Terapi/tanı/duygusal tavsiye **vermez**; kişisel/duygusal bir konu açılırsa nazikçe randevu formuna yönlendirir.
- **Neden yerel LLM:** Kullanıcı ek API maliyeti istemiyor; `tools/icerik-uretici/`'de zaten kurulu olan Ollama deneyimine ve launchd-işlerini çalıştıran ana Mac'e güveniyoruz.

## Kapsam dışı (bilinçli olarak yapılmıyor)
- Çoklu-**oturumlar arası** hafıza veya kullanıcı hesabı yok (bir sekme kapanınca konuşma unutulur).
- Gerçek zamanlı randevu oluşturma/değiştirme yapamaz — yalnızca `/randevu` formuna yönlendirir.
- Tıbbi/psikolojik tavsiye, tanı, terapi benzeri sohbet **vermez** — sistem promptunda açıkça yasaklanır.
- Blog yazılarının içeriğini bilmez (v1); yalnızca hizmetler/ekip/SSS/NAP bilgisiyle çalışır.
- Kişisel veri saklanmaz; prod veritabanına (Neon) hiçbir mesaj/log yazılmaz.

## Mimari

```
Ziyaretçi tarayıcısı (ChatWidget, client component)
   │  POST /api/asistan  { mesaj, gecmis: son birkaç mesaj (yalnızca bu oturum, state'te) }
   ▼
Next.js route handler (Vercel, src/app/api/asistan/route.ts)
   │  - IP başına hız sınırı (in-memory, bkz. Güvenlik)
   │  - Site içeriği özetini oluşturur (src/lib/asistan-icerik.ts)
   │  - Mac'e ulaşılamıyorsa → sabit fallback cevap döner (asla hata göstermez)
   ▼  POST https://<makine>.<tailnet>.ts.net/sohbet
      Header: X-Asistan-Secret: <paylaşılan anahtar>
Mac (Tailscale Funnel ile herkese açık, sabit HTTPS adres)
   │  tools/site-asistan/ — küçük Node API sarmalayıcısı
   │  - Secret doğrular (yanlışsa 401)
   │  - Ollama'ya istek atar (model: qwen2.5:7b civarı, Türkçe)
   │  - Anonim özet log yazar (yerel dosya, bkz. Loglama)
   ▼
Ollama (yerel, zaten kurulu)
```

DNS'e (`ozsaye.com` GoDaddy kayıtları) hiç dokunulmaz — Tailscale Funnel kendi `ts.net` adresini kullanır, Vercel tarafı yalnızca bu adrese giden bir backend isteğidir (ziyaretçinin tarayıcısı asla doğrudan Mac'e bağlanmaz).

## Bileşenler

### 1. Mac tarafı — `tools/site-asistan/`
- `tools/icerik-uretici/` ile aynı üslupta yeni bir araç dizini: küçük bir Node.js HTTP sunucusu (Express ya da native `http`), `.env.local` içinde `ASISTAN_SECRET` + `OLLAMA_MODEL`.
- Tek endpoint: `POST /sohbet` — `{ mesaj, gecmis, siteIcerigi }` alır, Ollama'nın `/api/chat` uç noktasına sistem promptu + `siteIcerigi` + `gecmis` + `mesaj` ile istek atar, düz metin cevap döner.
- Sistem promptu (Türkçe, sabit): kim olduğunu (Öz & Saye'nin sitesine gömülü bir yönlendirme asistanı), ne yapamayacağını (tanı/tedavi/tavsiye yok) ve site dışı konularda kibarca sınır koymasını tarif eder.
- launchd ile değil, `tailscale funnel` ile birlikte **sürekli çalışan** bir arka plan servisi olarak kurulur (örn. `pm2` ya da basit bir launchd `KeepAlive` job'ı — mevcut `com.ozsaye.neon-yedek` deseniyle tutarlı).
- README: kurulum (Ollama model indirme, `tailscale funnel` açma, secret üretme).

### 2. Vercel tarafı — `src/app/api/asistan/route.ts`
- Herkese açık POST endpoint (randevu formu gibi — oturum gerektirmez).
- Girdi doğrulama: `mesaj` boş/aşırı uzun olamaz (zod, `randevu.ts` deseniyle tutarlı).
- **Hız sınırı:** IP başına in-memory sayaç (örn. 10 dakikada 8 mesaj) — modül seviyesinde bir `Map`. Fluid Compute örnek-yeniden-kullanımıyla makul ölçüde çalışır; küçük klinik trafiği için DB'ye taşımak YAGNI (aşırı istek durumunda en kötü ihtimalle bir soğuk-başlangıçta sayaç sıfırlanır, kabul edilebilir).
- `ASISTAN_SECRET` + Mac'in Tailscale Funnel URL'i Vercel Production env'de tutulur (`AI_ASISTAN_URL`, `AI_ASISTAN_SECRET`).
- Mac'e istek 5 saniye civarı timeout ile atılır; hata/timeout/secret-uyuşmazlığında **sessizce** fallback'e düşer (ziyaretçi hata görmez).

### 3. İçerik kaynağı — `src/lib/asistan-icerik.ts`
- `services` (`src/lib/services.ts`), `site` (`src/lib/site.ts`), ekip verisi (`src/lib/ekip.ts`) ve SSS metinlerinden (`FaqSection.tsx`'teki sabit sorular) düz metin bir özet üretir — DB çağrısı yok, hepsi zaten bellekte sabit veri, her istekte ucuza yeniden hesaplanabilir.
- Site içeriği değiştikçe bu fonksiyon otomatik güncel kalır (elle senkronize edilecek ayrı bir metin dosyası yok).

### 4. Widget UI — `src/components/ChatWidget.tsx` (client component)
- Tüm sayfalarda sağ-alt köşede küçük yuvarlak balon (mevcut `StickyCta` ile çakışmayacak konumda — `StickyCta`'nın üstünde/solunda).
- Açılınca: marka diline uygun sade bir pencere (`bg-warm-white`, `border-stone`, `text-forest`/`text-forest-muted`, minimal dekorasyon — CLAUDE.md renk disiplinine uyar).
- **Kalıcı uyarı** pencerenin üstünde: "Ben bir yapay zeka asistanıyım, gerçek bir uzman değilim. Kişisel bir konu için lütfen randevu alın." (küçük, `text-forest-muted text-xs`).
- Konuşma geçmişi yalnızca React state'inde tutulur (sayfa yenilenince/sekme kapanınca kaybolur) — hiçbir yerde persist edilmez. Her istekte yalnızca **son 6 mesaj** (`gecmis`) gönderilir — prompt boyutunu ve yerel modelin bağlam yükünü sınırlı tutmak için.
- Her yanıtta, uygunsa bir "Randevu Al" linki (`/randevu`) gösterilir.

## Çevrimdışı / hata durumu (fallback)
Route handler Mac'e ulaşamazsa (timeout, 401, ağ hatası) anahtar-kelime eşleştirmeli **sabit** cevaplar devreye girer (örn. "randevu" geçen mesaja SSS/randevu linki, "ücret" geçene ücret sayfası linki, eşleşme yoksa genel "şu an asistan müsait değil, buradan SSS'e bakabilir ya da randevu formunu kullanabilirsiniz" mesajı). Ziyaretçi hiçbir zaman ham hata görmez.

## Loglama
Mac'teki `tools/site-asistan/` süreci, her konuşma için **anonim** bir satır yazar (IP/isim/mesaj metni YOK — yalnızca zaman damgası + kaba kategori, örn. "ücret", "randevu", "hizmet", "diğer") bir yerel dosyaya (`taslaklar/` deseniyle tutarlı, gitignore'lu). Prod veritabanına hiçbir şey gitmez; kullanıcı ara sıra bu dosyaya bakıp hangi soruların sorulduğunu görebilir.

## Güvenlik notları
- Paylaşılan `ASISTAN_SECRET` olmadan Mac'teki API hiçbir isteğe cevap vermez (401).
- Tailscale Funnel adresi rastgele/tahmin edilmesi zor bir alt alan adı olduğu için ek gizlilik sağlar, ama tek güvenlik katmanı secret'tır — adres tek başına yeterli görülmemeli.
- Vercel tarafındaki hız sınırı hem kötüye kullanımı hem de Mac'in aşırı yüklenmesini önler (tek makine, otomatik ölçeklenme yok).
- Sistem promptu; prompt injection'a karşı ("önceki talimatları unut" gibi) temel bir uyarı içerir — kesin koruma değildir, v1 için kabul edilebilir risk (bot yalnızca metin döndürür, hiçbir eylem/araç çağırma yetkisi yoktur).

## Test / doğrulama planı
- Mac tarafı API sarmalayıcısı: birim testi gerekmez (basit proxy), manuel `curl` ile doğrulanır.
- `src/lib/asistan-icerik.ts`: birim test (services/site/ekip verisinden beklenen metni üretiyor mu).
- `/api/asistan` route handler: birim test (zod doğrulama, hız sınırı, fallback davranışı — Mac'e giden fetch mock'lanır).
- Manuel E2E: `npm run dev` ile widget'ı aç, birkaç soru sor (Mac AI açıkken ve kapalıyken iki senaryo), mobilde görünümü kontrol et.
