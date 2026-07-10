# Randevu Talep Deneyimi Yenileme — Panel Ajanda + Durum Akışı + Liste Netliği
## Tasarım Dokümanı (Spec)

- **Tarih:** 2026-07-10
- **Durum:** Onaylandı (kullanıcı; yaklaşım A + açılır-kapanır ajanda takvimi)
- **Dal:** `panel-talep-deneyimi` (taban: main @ 1e45e36 — PR #38 panel modernleştirme dahil)
- **Bağlam:** Kullanıcı uçtan uca randevu akışını gözden geçirdi; dert noktaları (a) uzman panelindeki talep ekranlarının yetersizliği, (b) genel profesyonellik/dil. Hasta formunun soruları ve süreç anlatımı bilinçli olarak kapsam DIŞI bırakıldı (kullanıcı seçimi). Ek istek: panelde açılır-kapanır bir randevu takvimi (ajanda görünümü).

## Amaç
Uzmanın talep ekranlarını "form + düz liste"den, bir bakışta durum/öncelik/ajanda okunan bir iş takip aracına çevirmek — davranışsal riski düşük, kütüphanesiz, mevcut yetki (IDOR) modeline tam sadık.

## Kapsam DIŞI (v2)
- Tercih tarihine ayrı DB kolonu (migration) — v1'de kendi ürettiğimiz metin önekinden ayrıştırılır.
- Hastaya online/yüz yüze sorusu, hasta formu/süreç anlatımı değişiklikleri.
- Özel tarih-saat seçici bileşeni (native `datetime-local` kalır — PR #38 cilasıyla).
- Takvimde sürükle-bırak, hafta görünümü, dışa aktarma (iCal vb.).
- Yeni npm bağımlılığı — YASAK; takvim dahil her şey saf Tailwind/TSX.

## Bölümler

### 1. Açılır-kapanır randevu takvimi (`/panel/talepler` üstünde)
- **Açılır-kapanır mekanizma:** native `<details>/<summary>` — JS gerektirmez, klavye/ekran-okuyucu erişilebilirliği tarayıcıdan gelir. `<summary>` bir kart başlığı gibi stillenir: takvim ikonu (`ServiceIcon`e eklenecek `calendar` anahtarı) + "Takvim görünümü" + açık/kapalı göstergesi. **Varsayılan kapalı**; URL'de `?ay=` parametresi varsa `open` (ay gezintisi linkle çalıştığından, gezinince açık kalması bu şekilde sağlanır).
- **İçerik:** ay ızgarası (Pzt başlangıçlı, Türkçe kısa gün adları), önceki/sonraki ay okları `?ay=YYYY-MM` linkleri (sunucu bileşeni kalır; `searchParams` Next 16'da `await` edilir). Bugün hücresi ince forest çerçeveyle işaretli. Ay başlığı Türkçe ("Temmuz 2026", `Intl.DateTimeFormat("tr-TR")`).
- **Veri:** yalnız **`status = "scheduled"`** talepler, ilgili ayın [başlangıç, bitiş) aralığında `scheduledAt` ile; sorgu `src/lib/talepler-db.ts`'e eklenecek `listPlanliTakvim(expertSlug, isAdmin, ayBaslangic, ayBitis)` — SELECT yalnız `id, patientName, scheduledAt, expertSlug`; **`kapsamKosulu` aynen uygulanır** (uzman kendi + farketmez havuzu; admin hepsi).
- **Gün hücresi:** o güne düşen randevular hasta adıyla minik link (`/panel/talepler/[id]`), saat önekiyle ("14:30 Ayşe K." — soyad baş harfi, satır taşmasın). 3'ten fazlaysa "+N" satırı (link değil, sadece sayaç). Gün bazlama **Europe/Istanbul** dilimiyle yapılır (UTC saklanan `scheduledAt` İstanbul gününe çevrilir — mevcut `istanbulInputDegeri`/`istanbulTarihSaat` desenleriyle tutarlı).
- **Saf yardımcılar** (`src/lib/takvim.ts`, birim testli): `ayIzgarasi(yil, ay)` → Pzt-hizalı hafta dizileri; `ayEtiketi`, `oncekiAy/sonrakiAy`, `istanbulGunAnahtari(date)` → "YYYY-MM-DD". Geçersiz `?ay=` değeri sessizce içinde bulunulan aya düşer.

### 2. Talep detayı — görsel durum akışı + tek tık ilerletme
- **Adım göstergesi (stepper):** detay başlığının altında yatay 4 adım: Yeni → Arandı → Planlandı → Tamamlandı. Geçilen/mevcut adımlar forest (dolu daire + `text-forest` etiket), gelecek adımlar stone çizgili (`text-forest-muted`). `cancelled` durumunda stepper soluk kalır ve yanında "İptal edildi" rozeti görünür. Saf sunum bileşeni (`DurumAdimlari.tsx`), durum → görsel eşlemesi `DURUM_DEGERLERI` sırasından türetilir; **`DurumRozeti`'ye dokunulmaz.**
- **Tek tık aksiyonlar** (mevcut duruma göre, stepper'ın hemen altında):
  - `new` → "Arandı olarak işaretle"
  - `contacted` → tek tık YOK; "Planlamak için aşağıdan tarih seçin" yönlendirme metni (Planlandı tarih gerektirir)
  - `scheduled` → "Tamamlandı olarak işaretle"
  - `done` / `cancelled` → tek tık yok
  - Her durumda (done/cancelled hariç) sakin ikincil aksiyon: "İptal et" (stone çizgili buton).
- **Sunucu tarafı:** `talepler/actions.ts`'e yeni action `talebiDurumIlerlet(id, durum)` — aynı kimlik/zod/kapsam deseni (`verifySession` → `getStaffByEmail` → zod → `updateTalep(id, slug, isAdmin, { status })`). Yalnız-durum güncellemesi `scheduledAt`/`internalNote`'u SİLMEZ (mevcut `updateTalep` kısmi güncelleme sözleşmesi). Yalnız yukarıdaki geçişlere izin verilir: `new→contacted`, `scheduled→done`, `(new|contacted|scheduled)→cancelled`; başka geçiş isteği Türkçe hatayla reddedilir (formdaki select üzerinden tam serbestlik zaten var). `revalidatePath` mevcut action'la aynı.
- **Mevcut "Yönet" formu KALIR** (durum select'i dahil — tam manuel kontrol/kurtarma yolu, ör. iptalden geri alma). Stepper + tek tık, formun üstüne gelen kısayoldur.
- **Düzen:** masaüstünde (lg) iki sütun: solda İletişim + Talep notu, sağda Yönet; KVKK kaydı en altta tam genişlik. Mobilde bugünkü tek sütun sıra korunur.

### 3. Liste satırları — göreli zaman + tercih tarihi
- **Göreli zaman:** `goreliZaman(tarih, simdi)` saf fonksiyonu (`src/lib/talepler.ts`'e; birim testli): <1 dk "az önce" · <60 dk "X dakika önce" · aynı İstanbul günü "X saat önce" · takvim-günü farkı 1 "dün" · <7 gün "X gün önce" · aksi "8 Tem" (`Intl` tr, İstanbul). Liste satırındaki mutlak tarih yerine geçer; mutlak tam tarih detay sayfasında zaten var.
- **Tercih tarihi çipi:** `tercihEdilenTarih(preferredNote)` saf fonksiyonu (birim testli): notun ilk satırındaki kendi ürettiğimiz `Tercih edilen tarih: <değer>` önekini ayrıştırır; değer "belirtilmedi"/boş/geçersizse `null` (çip çıkmaz), `YYYY-MM-DD` ise Türkçe kısa biçim döner ("15 Tem"). Satırda stone-çizgili minik çip: "Tercih: 15 Tem". `listTalepler` seçimine `preferredNote` eklenir (salt-okuma, davranış değişikliği yok).
- Not: bu ayrıştırma yalnız v1 köprüsüdür; ileride kolon eklenirse (v2) fonksiyon tek çağrı yerinden sökülür.

### 4. Filtre çipleri sayıları + nav rozeti
- **Çipler:** `/panel/talepler` filtre çipleri sayı gösterir — "Tümü (4) · Yeni (1) · Arandı (1)…" (`talepSayilari` yeniden kullanılır; "Tümü" = değerlerin toplamı). Sayfa zaten dinamik; +1 sorgu kabul edilebilir.
- **Nav rozeti:** `(protected)/layout.tsx` nav'ındaki "Talepler" linkine, **yalnız yeni talep sayısı > 0 iken** küçük forest dolu rozet (`bg-forest text-warm-white` yuvarlak, sayı). Layout `getStaffByEmail` + `talepSayilari` çağırır (dashboard'la aynı desen; istek başına 2 küçük ek sorgu — kabul). Rozet `aria-label`'lı ("N yeni talep").

### 5. Dil / mikro-cila
- Görünen tüm "Farketmez" etiketleri → **"Fark etmez"** (TDK): `uzmanEtiketi` null dalı, `UZMAN_SECENEKLERI["farketmez"]` görünen değeri, hasta formundaki `<option>` etiketi, e-posta şablonlarındaki görünüm. **Slug/DB değeri `farketmez` DEĞİŞMEZ** (form value, expertSlug null eşlemesi aynen).
- Buton/durum metinleri ton taraması: emir kipi tutarlılığı ("Talebi güncelle", "Arandı olarak işaretle"); değişenler spec-üstü değil, uygulamada tek commit'lik metin düzeltmesi olarak yapılır.

## Global kısıtlar (her bölüme uygulanır)
- Renk disiplini (CLAUDE.md): metin yalnız `text-forest`/`text-forest-muted`; opaklık-metin yasak; `sage` yalnız ikon/aksan; yüzeyler warm-white/cream/forest. Forest zeminde ikincil metin `text-sage-light`.
- `DurumRozeti.ROZET_SINIF` ve `RANDEVU_AKSAN_SINIFI` değiştirilemez (review'dan geçmiş); stepper renkleri aynı forest/stone ailesinden türetilir.
- Yetki: her yeni sorgu `kapsamKosulu(expertSlug, isAdmin)` kullanır; her yeni action `verifySession`+`getStaffByEmail` ile başlar.
- Yeni npm bağımlılığı yok; `server-only` düz Vitest'ten import edilen dosyalara konmaz (Faz 0 kuralı).
- Tüm arayüz metni Türkçe; Next 16 `searchParams`/`params` Promise.

## Kabul kriterleri
- [ ] Takvim: kapalı açılır/açık kapanır; ay gezintisi çalışır ve takvim açık kalır; planlanmış randevular doğru İstanbul gününde, doğru kapsamla görünür; hücre linki detaya gider; geçersiz `?ay=` bugünkü aya düşer.
- [ ] Stepper mevcut durumu doğru gösterir; tek tık geçişler çalışır ve not/tarihi silmez; izinsiz geçiş reddedilir; İptal çalışır; "Yönet" formu tam işlevli kalır.
- [ ] Liste: göreli zaman + (varsa) tercih çipi; çipler sayılı; nav rozeti yalnız yeni>0 iken.
- [ ] "Fark etmez" her görünen yerde; slug/DB değişmedi.
- [ ] Birim testler: `ayIzgarasi`/gün bazlama, `goreliZaman`, `tercihEdilenTarih`, `talebiDurumIlerlet` geçiş kuralları (mevcut DB test desenleriyle).
- [ ] `tsc` + lint + test + build temiz; canlı tarayıcı doğrulaması + ekran görüntüleri; davranış regresyonu yok (mevcut 184 test yeşil).
