# Devam Notları — Sonraki Oturum İçin Başlangıç Noktası

> Amaç: Yeni bir Claude Code oturumu (veya başka biri) projeyi sıfırdan
> okumadan kaldığı yerden devam edebilsin. Son güncelleme: Haziran 2026.

---

## 1. Projenin Şu Anki Durumu

- **Site canlı:** statik Next.js 16 sitesi GoDaddy'de yayında.
- **Marka kimliği tamam:** logo kiti (11 varyant), palet, tipografi, marka rehberi.
- **Sosyal medya seti tamam:** Instagram (7) + LinkedIn (2) şablonları.
- **Blog/Haberler modülü tamam:** 3 başlangıç yazısı.
- **SEO/AIO temel altyapısı tamam:** statik render, sitemap, robots, OG, favicon.
- **Deploy sistemi tamam:** GitHub Actions → GoDaddy FTP otomatik yayın.
- **Teklif/yapılanlar dokümanı tamam:** `docs/teklif-ve-yapilanlar.md` (PR #9, merge edildi).
- **Depo public:** kaynak kod herkese açık (müşteriye link verilebilir).

### Canlı Bağlantılar
| | Bağlantı |
|---|---|
| Web | https://ozsayepsikoloji.com |
| Instagram | https://instagram.com/ozsayepsikoloji |
| GitHub | https://github.com/OmerYasirOnal/ozsaye-psikoloji |

---

## 2. Bekleyen Kararlar (Müşteriden / Ömer'den Onay Gerek)

- [ ] **Fiyatların netleştirilmesi:** `teklif-ve-yapilanlar.md` içindeki rakamlar
      "öneri" olarak işaretli (kurulum 20.000 TL; aylık 4.000/7.000/12.000 TL).
      Müşteriyle son rakam belirlenince doküman güncellenecek.
- [ ] **Instagram handle teyidi:** `@ozsayepsikoloji` varsayıldı; gerçek hesap
      farklıysa doküman + (ileride) `Footer`/`Contact` linkleri düzeltilecek.

---

## 3. Anlaşılan Müşteri Talepleri (Henüz Uygulanmadı)

> Kaynak: WhatsApp görüşmesi (Sacide & Melek Hoca).

- [ ] **Üçüncü / feminen renk:** Palete yumuşak bir aksan eklenmesi istendi —
      "uçuk pembe" veya "vişne çürüğü" tonu (feminenlik katması için).
      **Dikkat:** Marka rehberi (`docs/marka-kimligi.md`) "paletten sapma" diyor;
      palet `src/app/globals.css` içinde `@theme inline` ile tek kaynaktan yönetiliyor.
      Yeni renk bir **aksan tokenı** olarak eklenmeli (ana forest/cream/sage korunarak).
- [ ] **Giriş (Hero) krem zeminini biraz daha açık tona çekmek.**
- [ ] **Logoyu üç renkli yapma fikri** (opsiyonel; müşteri "olsa daha güzel olur" dedi).
      Logo üretimi: `node scripts/generate-logo-kit.cjs` (çizim `scripts/lib/brand.cjs`).

---

## 4. Klinikten Gereken Gerçek Veriler

(Detay: `docs/seo-aio-inceleme-yol-haritasi.md` → "Uygulama Öncesi Klinikten Gereken Veri")

- [ ] Gerçek telefon + tam açık adres (mahalle/sokak/ilçe/il/posta kodu)
- [ ] Uzman fotoğrafları + ofis/danışma odası görselleri
- [ ] Uzman kimlik bilgileri (üniversite, lisans/yüksek lisans, sertifika, TPD üyeliği)
- [ ] Sosyal medya profil URL'leri (Instagram, LinkedIn)
- [ ] Seans ücret/süre bilgisi (şeffaflık bölümü için)
- [ ] E-posta servisi (Resend vb.) API key + doğrulanmış domain (randevu formu için)

---

## 5. Teknik Yol Haritası (4 Faz)

Tam liste: **`docs/seo-aio-inceleme-yol-haritasi.md`** (79 madde). Özet öncelik sırası:

1. **Faz 1 — Altyapı/güven (P0):** `metadataBase`, JSON-LD (`MedicalBusiness` + `Person`),
   merkezi NAP kaynağı (`src/lib/site.ts`), font optimizasyonu.
2. **Faz 2 — Çalışan randevu akışı (P0):** Server Action + Zod + KVKK açık rıza +
   e-posta bildirimi + teşekkür sayfası. *(Şu an form sahte — hiçbir yere veri göndermiyor.)*
3. **Faz 3 — Erişilebilirlik (WCAG 2.2 AA) + gerçek görseller (P1).**
4. **Faz 4 — İçerik mimarisi + derin SEO/AIO (P1–P2):** hizmet/uzman/blog detay sayfaları.

> **En kritik açıklar:** (1) randevu formu backend'i yok, (2) KVKK aydınlatma/rıza yok
> (sağlık verisi topluyor — yasal zorunluluk), (3) NAP/görseller placeholder.
> Bunlar gerçek veri gelmeden tamamlanamaz.

---

## 6. Komutlar & Üretim Script'leri

```bash
npm run dev        # geliştirme sunucusu
npm run build      # statik çıktı (out/ klasörü) — deploy için
npm run lint       # ESLint
# (Test framework kurulu DEĞİL.)

node scripts/generate-logo-kit.cjs      # logo varyantları
node scripts/generate-instagram.cjs     # Instagram seti
node scripts/generate-brand-assets.cjs  # og.png + LinkedIn görselleri
bash scripts/setup-fonts.sh             # marka fontlarını kurar (görsel script'ler için ön koşul)
```

> **Önemli (AGENTS.md):** Bu Next.js 16; API'ler eğitim verisinden farklı olabilir.
> Kod yazmadan önce `node_modules/next/dist/docs/` altındaki ilgili rehberi oku.

---

## 7. İlgili Dokümanlar

| Dosya | İçerik |
|---|---|
| `docs/teklif-ve-yapilanlar.md` | Müşteriye sunulan teklif + yapılanlar + fiyat |
| `docs/seo-aio-inceleme-yol-haritasi.md` | 79 maddelik SEO/AIO/erişilebilirlik yol haritası |
| `docs/marka-kimligi.md` | Marka rehberi (logo/renk/tipografi/şablonlar) |
| `docs/godaddy-deploy-rehberi.md` | Deploy adımları (elle + otomatik) |
| `CLAUDE.md` / `AGENTS.md` | Proje konvansiyonları + Next.js 16 uyarısı |

---

## 8. "Buradan Devam Et"

Sıradaki en mantıklı iş, müşteriden gerçek veriler geldikçe **Faz 1 + Faz 2**'yi
uygulamak (güven sinyalleri + çalışan/KVKK uyumlu randevu formu). Veri gelmeden
yapılabilecek tek koddışı-bağımsız iş: anlaşılan **feminen aksan rengi** + **Hero
krem tonu** ayarı (Bölüm 3) — ama önce Ömer'in renk onayı alınmalı.
