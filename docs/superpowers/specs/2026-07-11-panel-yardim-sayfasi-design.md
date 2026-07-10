# Panel Yardım Sayfası (`/panel/yardim`)
## Tasarım Dokümanı (Spec) — tek görevlik uygulama brief'i olarak da kullanılır

- **Tarih:** 2026-07-11 · **Durum:** Onaylandı (kullanıcı) · **Dal:** `panel-yardim-sayfasi`
- **Amaç:** İki teknik-olmayan uzmanın (Melek/Sacide) panelde takıldığında bakacağı, Türkçe, sakin bir kullanım rehberi — panele gömülü, her zaman erişilebilir.

## Dosyalar
- Create: `src/app/panel/(protected)/yardim/page.tsx` — statik sunucu bileşeni (DB/istemci JS YOK); `export const metadata: Metadata = { title: "Yardım" };` (layout şablonu "Yardım · Panel" üretir).
- Modify: `src/components/ServiceIcon.tsx` — yeni `help` anahtarı (soru işareti daire içinde):
  ```tsx
  help: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  ),
  ```
- Modify: `src/app/panel/(protected)/layout.tsx` — nav'ın SONUNA (Profilim'den sonra) link: `href="/panel/yardim"`, `ServiceIcon name="help"` (h-4 w-4 text-sage), etiket "Yardım" (rol ayrımı yok).

## Sayfa yapısı
Başlık `<h1 class="font-display text-2xl text-forest">Yardım</h1>` + kısa karşılama paragrafı (`text-forest-muted`): "Panelin tüm özellikleri aşağıda anlatılıyor — bir başlığa dokunarak açabilirsiniz."

Her bölüm bir `<details>` kartı (TakvimGorunumu deseni birebir): `rounded-lg border border-stone bg-warm-white`, `<summary>` = `flex cursor-pointer list-none items-center gap-2 px-5 py-4 [&::-webkit-details-marker]:hidden` + ilgili `ServiceIcon` (h-5 w-5 text-sage) + `font-medium text-forest` başlık; içerik `border-t border-stone px-5 py-4` içinde `text-forest-muted text-sm leading-relaxed` paragraf/listeler (`space-y-3`; madde listeleri `list-disc pl-5 space-y-1`). Kartlar arası `space-y-4`. Tüm kartlar varsayılan KAPALI. Sayfa `max-w-3xl` ile sınırlandırılabilir (uzun satır okunabilirliği).

## Bölüm içerikleri (uygulayıcı bu METİNLERİ kullanır; hafif üslup düzeltmesi serbest, TEKNİK GERÇEKLER değiştirilemez)

**1. Panele giriş nasıl çalışır?** (ikon: `user`)
- Şifre yoktur. `/panel/giris`'te e-posta adresinizi yazın; adresinize tek kullanımlık bir giriş bağlantısı gelir. Bağlantı **15 dakika** geçerlidir ve **bir kez** kullanılabilir.
- Bağlantı gelmediyse: spam/gereksiz klasörünü kontrol edin; birkaç dakika bekleyip yeniden isteyin.
- Giriş yaptıktan sonra oturumunuz uzun süre açık kalır — her seferinde bağlantı istemeniz gerekmez.

**2. Randevu talepleri** (ikon: `calendar`)
- Siteden gelen her randevu talebi "Talepler"e düşer; ayrıca e-posta bildirimi alırsınız. Hastaya da başvurusunun alındığına dair otomatik bir e-posta gider.
- Durumlar: **Yeni** (henüz dönüş yapılmadı) → **Arandı** (hastayla görüşüldü) → **Planlandı** (randevu tarihi belirlendi) → **Tamamlandı**. Uygun olmayanlar için **İptal**.
- Talep detayında tek dokunuşla "Arandı olarak işaretle" ve "İptal et" düğmeleri vardır; "Planlandı" için Yönet bölümünden tarih seçmeniz gerekir.
- **Önemli:** Planlanan tarihi kaydettiğinizde **hastaya otomatik bilgilendirme e-postası gider** (tarih değiştirirseniz yeni tarihle tekrar gider). Yalnız iç not düzenlemek e-posta göndermez.
- **İç not** yalnızca panele giren ekip üyelerine görünür — hasta asla görmez.
- Ara / WhatsApp / E-posta düğmeleri hastanın iletişim bilgileriyle tek dokunuşta açılır.
- "Takvim görünümü"nü açarak planlanmış randevularınızı ay üzerinde görebilirsiniz; üstteki oklarla ay değiştirilir.

**3. Blog yazısı yazmak** (ikon: `document`)
- "Blog" → "Yeni Yazı": başlık yazınca adres (URL) kendiliğinden oluşur; kategori/etiket/özet doldurun, içeriği zengin metin düzenleyicide yazın (kalın, başlık, liste, alıntı, bağlantı, görsel ekleme).
- **"Taslak olarak kaydet"** sitede YAYINLAMAZ — dilediğiniz kadar üzerinde çalışın. Hazır olunca yazının düzenleme sayfasından **Yayınla**'yı kullanın; yazı sitede **anında** görünür. Yayından kaldırmak da aynı yerden mümkündür.
- Yazı listesindeki kapak görselleri şimdilik bizim tarafımızdan ekleniyor; yeni yazınıza kapak isterseniz bize iletmeniz yeterli.

**4. Profilim — sitedeki tanıtım sayfanız** (ikon: `user`)
- "Profilim"de yazdıklarınız, sitedeki **Ekip** sayfanızda ve uzman tanıtım sayfanızda yayımlanır; kaydettiğiniz anda site güncellenir. Boş bıraktığınız alanlar sitede hiç görünmez.
- Diplomalar/Sertifikalar/Çalışma alanları kutularında **her satıra bir madde** yazın (virgül değil, alt satır).
- Fotoğraf: PNG, JPEG veya WebP; en fazla **4 MB**. Yüklediğiniz anda sitede görünür; "Fotoğrafı kaldır" ile eski görünüme dönersiniz.
- Herkes yalnız kendi profilini düzenler (info@ hesabı her ikisini de düzenleyebilir).

**5. Sık karşılaşılan durumlar** (ikon: `check`)
- *Giriş bağlantısı gelmedi:* spam klasörü + birkaç dakika bekleyip yeniden isteyin. Hâlâ yoksa bize yazın.
- *Bir talebi yanlışlıkla iptal ettim:* talep detayındaki Yönet bölümünden durumu tekrar doğru değere çevirebilirsiniz — hiçbir şey silinmez.
- *Fotoğraf yüklenmiyor:* dosya 4 MB'tan büyük veya PNG/JPEG/WebP dışında olabilir; telefonla çekilmiş fotoğraflarda "küçük boyut" seçeneğini deneyin.
- *Kaydettim ama sitede göremiyorum:* birkaç saniye bekleyip site sayfasını yenileyin.

**6. Destek** (ikon: `heart`)
- Çözemediğiniz her konuda Ömer'e WhatsApp'tan yazabilirsiniz — ekran görüntüsü eklerseniz daha hızlı yardımcı olur.

## Kısıtlar / kabul
- Renk disiplini (yalnız `text-forest`/`text-forest-muted`; sage yalnız ikon), tüm metin Türkçe, yeni bağımlılık yok, istemci JS yok (`"use client"` YOK).
- Kabul: sayfa `/panel/yardim`'da açılır; nav'da "Yardım" ikonlu link; tüm kartlar aç/kapa çalışır (native details); sekme başlığı "Yardım · Panel"; tsc+lint+test+build temiz; içerikteki teknik gerçekler (15 dk, tek kullanım, 4 MB, formatlar, otomatik hasta mailleri, taslak/yayın davranışı, iç not gizliliği, kendi-profili yetkisi) bire bir doğru.
