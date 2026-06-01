# Özsaye Psikoloji — Bilgi Toplama Formu (yayına hazırlık)

Bu form, web sitesini yayına almak için gereken **gerçek bilgileri** toplar.
Doldurulmuş hali geliştiriciye geri gönderilir; o da `src/lib/site.ts`'e işleyip
siteyi yayına hazır hale getirir (o ana kadar site arama motorlarına kapalıdır).

**Nasıl kullanılır**
- **Bölüm 1**'i klinikten bir kişi (yönetici) doldurur.
- **Bölüm 2**'yi **her uzman kendi için** doldurur → 2 kopya (Melek Yıldız, Sacide Şahin).
- **Bölüm 3**'teki fotoğrafları ekleyin.
- Boşlukları (`……`) doldurup geri gönderin; bilmediğiniz/olmayan alana "yok" yazın.

---

## BÖLÜM 1 — Klinik & İletişim  (klinik geneli — 1 kez)

1. **Klinik adı** (tabela/resmî): ……  · _ör: Özsaye Psikoloji Danışmanlık Merkezi_
2. **Yasal/ticari ünvan** (fatura/sözleşmedeki, varsa): ……
3. **Slogan** (kısa): ……  · _mevcut: "Güvenli bir bölgede kendi özüne doğru"_
4. **Telefon**: ……  · _ör: 0212 123 45 67 ya da 0537 123 45 67_
5. **İletişim e-postası**: ……  · _ör: iletisim@ozsayepsikoloji.com_
6. **Açık adres**: ……
   _cadde/sokak + no + kat/daire · mahalle · ilçe · il · posta kodu_
7. **Çalışma saatleri**: ……
   _ör: Pazartesi–Cuma 09:00–19:00 · Cumartesi 10:00–14:00 · Pazar kapalı_
8. **Instagram** linki: ……   ·   **LinkedIn** linki: ……   _(yoksa "yok")_
9. **Google Haritalar konumu**: işletmeyi Haritalar'da bulup paylaşım linkini yapıştırın: ……  _(henüz yoksa "yok")_
10. **Seans ücreti** sitede görünsün mü?
    - Evet → bireysel seans ücreti: ……  · seans süresi: ……  _(ör: 50 dakika)_  · not: ……
    - Hayır → "Görüşmede belirlenir" yazılmasını ister misiniz? (Evet/Hayır): ……

### Bölüm 1B — Teknik kararlar (web sorumlusu)
11. **Alan adı (domain)**: ……  · _ör: www.ozsayepsikoloji.com — yoksa "henüz alınmadı"_
12. Randevu formu bildirimleri hangi **e-posta kutusuna** düşsün: ……
13. (Teknik) E-posta gönderimi için Resend hesabı/API key var mı? — yoksa kurulumda yönlendirilir.

---

## BÖLÜM 2 — Uzman Künyesi  (HER uzman kendi için ayrı doldurur)

> Melek Yıldız ve Sacide Şahin için ayrı ayrı doldurun.

- **Ad Soyad**: ……
- **Ünvan (tam)**: ……  · _ör: Klinik Psikolog / Psikolojik Danışman_
- **Kısa ünvan**: ……  · _ör: Kl. Psk. / Psk. Dan._
- **Mezun olunan üniversite(ler) ve bölüm/derece**: ……
  _ör: İstanbul Üniv., Psikoloji (Lisans); X Üniv., Klinik Psikoloji (Yüksek Lisans)_
- **Sertifikalar / terapi eğitimleri** (virgülle): ……  · _ör: EMDR Terapi Eğitimi, BDT Sertifikası_
- **Meslek örgütü üyeliği** (varsa): ……  · _ör: Türk Psikologlar Derneği üyesi_
- **Kısa biyografi / yaklaşım** (2–4 cümle): ……
- **Çalışma / uzmanlık alanları** (virgülle): ……  · _ör: Kaygı bozuklukları, çift terapisi, travma_
- **Profil linkleri** (LinkedIn / kişisel site / psikolog dizini): ……  _(yoksa "yok")_
- **Portre fotoğrafı**: ekte gönderin _(öneri: kare, net, profesyonel; ~800×800 px)_

---

## BÖLÜM 3 — Görseller
- Her uzmanın **portre fotoğrafı** (kare tercih edilir).
- (Opsiyonel) **Ofis/görüşme odası/bekleme alanı** fotoğrafları — aydınlık, ferah 2–4 kare.

---

_Doldurulmuş formu + fotoğrafları geri gönderdiğinizde site.ts'e işlenecek, `site.dataReady=true` yapılacak ve site indekslenmeye/yayına hazır hale gelecektir._
