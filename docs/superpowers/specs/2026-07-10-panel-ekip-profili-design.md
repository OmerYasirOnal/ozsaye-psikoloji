# Panelden Ekip Profili Düzenleme + Marka Görselleri
## Tasarım Dokümanı (Spec)

- **Tarih:** 2026-07-10
- **Durum:** Onaylandı (kullanıcı; alan kapsamı = içerik + fotoğraf; yetki = kendi profili + admin; spec-inceleme adımı kullanıcı isteğiyle atlandı)
- **Dal:** `panel-ekip-profili` (taban: main @ f7616d1)
- **Bağlam:** `site.ts`'te 34 `[DOLDUR]` placeholder var; site bu yüzden bilinçli noindex. İçerik alanlarının büyük kısmı uzman profillerine ait. Uzmanlar bunları panelden kendileri girebilirse `/ekip` gerçek içerikle dolar ve `dataReady` yolu açılır. Ek istek (kullanıcı): görselleri ben üreteyim ve yerleştireyim — **karar:** gerçek terapistlerin AI-üretimi sahte portresi YMYL sitede yanıltıcı olur, YAPILMAZ; fotoğraflar panel yüklemesiyle uzmanlardan gelir. Üretilecek görseller: **blog kapakları** (3 yayınlı yazı kapaksız) — marka paletiyle programatik (sharp) botanik-soyut kompozisyonlar.

## Kararlar
| Konu | Karar |
|---|---|
| Düzenlenebilir alanlar | İçerik: bio, credentialsLine, university, membership, degrees[], certifications[], areas[], sameAs[] + profil fotoğrafı (Blob/dev-uploads). Kimlik (slug/ad/unvan/kısa unvan) `site.ts`'te sabit. |
| Yetki | Uzman yalnız KENDİ profilini (`staff.expertSlug === slug`); admin (info@) ikisini de. |
| Veri modeli | Yeni `expert_profiles` tablosu (`expert_slug` unique). Boş başlar — placeholder SEED EDİLMEZ; `null` alan = bugünkü `isReady` gizleme davranışı. Liste alanları Postgres `text[]`. `imageUrl` null → mevcut monogram yer-tutucu (zaten şık, korunur). |
| Kaynak birleştirme | `src/lib/ekip.ts` (saf) + `src/lib/profil-db.ts` (DB): kimlik `site.experts`'ten + içerik DB'den. `/ekip`, `/ekip/[slug]`, `Team.tsx`, `JsonLd` tek bu kaynaktan okur. |
| site.ts sadeleşmesi | İçerik alanları (`bio/degrees/university/certifications/membership/areas/sameAs/credentialsLine/image`) `Expert` tipinden ve `experts` sabitinden KALDIRILIR (çift kaynak yok). `image` yolu da kalkar (DB `imageUrl` + monogram fallback yeter). `docs/klinikten-gereken-veriler.md` "uzmanlar panelden giriyor" olarak güncellenir. |
| SSG/tazeleme | `/ekip*` SSG kalır (2 sabit slug `generateStaticParams`); profil kaydında `revalidatePath` ("/ekip", "/ekip/[slug]", "/") — blogda kanıtlı desen. |
| Panel UI | `/panel/profil`: terapist → kendi formuna redirect; admin → iki uzman kartı. `/panel/profil/[slug]`: form (bio textarea; tek-satır alanlar; liste alanları satır-başına-madde textarea ↔ `text[]` çevirici saf+testli; fotoğraf yükle/kaldır). Nav'a "Profilim" (admin etiketi "Profiller") + `user` ikonlu link. |
| Fotoğraf yükleme | `/panel/profil/gorsel` endpoint'i — blog `gorsel/route.ts`'in birebir deseni (`saveImage`/`sniffImageType` yeniden kullanımı; oturumsuz 401; magic-bytes doğrulama; 4MB). Kamu render: `imageUrl` varsa `next/image` (`unoptimized`), yoksa monogram. |
| Blog kapakları | `scripts/uret-blog-kapaklari.ts` (sharp; palet: forest/cream/sage/blush; yazı-başına deterministik, sakin geometrik-botanik kompozisyon; 1200×630). Yerleştirme: dev'de `.uploads/blog/` + DB; prod'da Blob'a yükleme + `blog_posts.cover_image_url` güncelleme + revalidate — Final aşamasında kontrolör yapar. İnsan yüzü/figürü YOK. |

## Kapsam DIŞI (v1)
Ad/unvan/slug düzenleme; galeri/çoklu fotoğraf; profil önizleme; NAP/ücret (site.ts'te kalır); `dataReady`'yi otomatik çevirme (hâlâ elle, NAP girilince).

## Global kısıtlar
- Renk disiplini (CLAUDE.md) aynen; tüm metin Türkçe; yeni npm bağımlılığı YOK (sharp zaten devDep).
- Yetki: yazma action'ı `verifySession`→`getStaffByEmail`→(own|admin) kontrolü; upload endpoint'i oturum kontrolü.
- `server-only`, Vitest'in doğrudan import ettiği modüllere KONMAZ (`ekip.ts`, `profil-db.ts`, `storage.ts` deseni).
- Next 16: `params`/`searchParams` Promise. Migration dosyaları commit'lenir.
- **Prod sıralaması (kritik):** `expert_profiles` migration'ı prod Neon'a **merge'den ÖNCE** uygulanır — tablo yokken deploy olan kod `/ekip`'i 500 yapar.

## Kabul kriterleri
- [ ] Uzman kendi profilini panelden düzenler (bio/listeler/fotoğraf); kaydedince `/ekip/[slug]` + anasayfa anında güncellenir; diğer uzmanın profiline yazamaz (403/hata); admin ikisini de düzenler.
- [ ] Boş alanlar kamuda gizli (bugünkü davranış); fotoğraf yoksa monogram.
- [ ] JsonLd Person alanları birleşik kaynaktan; dataReady=false iken yayınlanmama davranışı değişmez.
- [ ] `site.ts`'te uzman içerik placeholder'ı kalmaz ([DOLDUR] sayısı ciddi düşer); docs güncel.
- [ ] 3 blog yazısının marka-uyumlu kapak görseli üretildi ve (dev+prod) yerleştirildi; blog listesi/detayı/panelde görünür.
- [ ] Birim testler (çeviriciler, birleştirme, profil-db yetki/upsert); tsc+lint+test+build temiz; canlı tarayıcı doğrulaması + ekran görüntüleri; prod migration uygulandı.
