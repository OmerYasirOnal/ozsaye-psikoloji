# Claude Code Prompt — Öz & Saye Psikoloji final logo entegrasyonu

Repo: `OmerYasirOnal/ozsaye-psikoloji`

Amaç:
Son onaylanan Öz & Saye Psikoloji logosunu siteye ve sosyal medya assetlerine entegre et.

Onaylanan yön:
- Beyaz arka plan.
- Logo komple küçük/standart oranda, merkezde ve nefes alan boşlukla kullanılmalı.
- Üstteki amblem yazıya göre daha küçük kalmalı.
- Yapraklarla ortadaki insan figürü arasındaki boşluk azaltılmalı.
- Ortadaki insan figürü daha kıvrımlı ve sağa doğru hafif yatık hissedilmeli.
- Sağ taraftaki ikinci pembe yaprak korunmalı.
- Yazı: `Öz & Saye`
- Alt yazı: `PSİKOLOJİ`
- Türkçe karakterler korunmalı.

Renk paleti:
- Forest Green: `#1F3B2E`
- Sage Green: `#A6B79B`
- Soft Blush: `#D8A7A5`
- White: `#FFFFFF`
- Warm Ivory: `#F5F2EB`

Kullanılacak dosyalar:
- `02_primary_logo_white.png`: ana logo.
- `03_primary_logo_transparent.png`: transparan logo.
- `site_icon_512_transparent.png`: site/app icon.
- `favicon_32x32.png`, `favicon_48x48.png`, `favicon_64x64.png`: favicon.
- `open_graph_1200x630_white.jpg`: link önizleme.
- `instagram_profile_1080_white.jpg`: Instagram profil.
- `x_profile_400_white.jpg`: X profil.
- `instagram_post_1080_white.jpg`: ilk post.
- `instagram_story_1080x1920_white.jpg`: story.

Yapılacaklar:
1. `public/` klasöründeki mevcut logo/og/favicon dosyalarını final assetlerle güncelle.
2. Header ve Footer logo kullanımını mobil/desktop için kontrol et.
3. Logo küçük ekranda okunur kalmalı; profil ikonunda fazla yazı sıkışırsa `site_icon_512_transparent.png` kullanılmalı.
4. `layout.tsx` metadata Open Graph ve Twitter görsellerini `open_graph_1200x630_white.jpg` ile hizala.
5. Eski logo varyasyonlarını `brand/archive/` altına taşı.
6. `npm run lint` ve `npm run build` çalıştır.
7. Yeni branch aç, commit at ve PR oluştur.

PR başlığı:
`Final logo asset entegrasyonu`
