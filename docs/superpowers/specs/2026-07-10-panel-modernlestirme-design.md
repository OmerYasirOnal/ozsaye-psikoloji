# Uzman Paneli — Modernleştirme / Cila Geçişi
## Tasarım Dokümanı (Spec)

- **Tarih:** 2026-07-10
- **Durum:** Onaylandı (kullanıcı, ekran görüntüleri üzerinden)
- **Bağlam:** Panel (`/panel/**`) işlevsel olarak tamamlanmış (Faz 0-4 + admin görünürlüğü). Ekran görüntüleriyle gözden geçirildi: marka renk disiplinine tam uyuyor ama "iskelet gibi" — ikon yok, kart hiyerarşisi zayıf, giriş sayfası boş, native tarih input'u stilsiz, blog editörü metadata alanlarından görsel olarak ayrışmıyor, sekme başlıkları panel'e özel değil. Bu **yeniden tasarım değil, hedefli bir cila geçişi**.

## Amaç
Mevcut işlevi hiç değiştirmeden, panelin "profesyonel/modern" hissini artırmak — marka kurallarına (bkz. Global Constraints) tam sadakatle.

## Kapsam DIŞI (YAGNI)
- Yeni bir tarih seçici kütüphanesi (flatpickr vb.) eklenmeyecek — native `datetime-local` yalnız CSS ile cilalanır.
- Yeni bir ikon kütüphanesi eklenmeyecek — `ServiceIcon.tsx` deseni (inline SVG, `strokeWidth 1.25`, `sage`) tekrar kullanılır.
- Hiçbir işlevsel/davranışsal değişiklik yok (form akışları, yetki mantığı, veri modeli aynen kalır).
- Talep/blog listelerine sayfalama, arama, sıralama eklenmiyor.

## Kapsam ve somut kararlar

### 1. Giriş sayfası (`src/app/panel/giris/page.tsx`)
Sayfa dikey ortalı bir karta dönüşür: `min-h-screen flex items-center justify-center`, kart `max-w-md rounded-lg border border-stone bg-warm-white p-8 shadow-sm`. Kartın üstünde `next/image` ile `/logo.png` (Header.tsx'teki gibi, küçük boyutta — ör. `w-16 h-auto`, `priority` gerekmez). Başlık ortalanır. Form ve hata/uyarı metinleri aynı kalır.

### 2. Panel kabuğu (`(protected)/layout.tsx`)
- **Metadata şablonu** eklenir: `export const metadata: Metadata = { title: { template: "%s · Panel", default: "Panel" }, robots: { index: false, follow: false } }`. Bu, alt sayfaların yalnız kendi başlığını (`export const metadata = { title: "..." }`) set etmesini yeterli kılar; robots her sayfaya otomatik miras kalır (giriş sayfasındaki tekrarı kaldırılabilir ama zorunlu değil — zaten aynı değer, çakışma yok).
- Nav linklerine (Gösterge/Talepler/Blog) küçük sage inline-SVG ikon eklenir (ServiceIcon.tsx deseni; yeni anahtarlar: `gosterge` [grid/pano], `talepler` [liste/takvim], `blog` [kalem/döküman] — 16-18px, `strokeWidth 1.25`, metinle `gap-1.5`).

### 3. Sayfa başlıkları (yeni `export const metadata`)
- `(protected)/page.tsx` (dashboard): `title: "Gösterge"`
- `talepler/page.tsx`: `title: "Randevu Talepleri"`
- `talepler/[id]/page.tsx`: `title: "Talep Detayı"` (hasta adını başlığa koymak YAGNI — sabit yeter, bu iç bir araç)
- `blog/page.tsx`: `title: "Blog Yazıları"`
- `blog/yeni/page.tsx`: `title: "Yeni Yazı"`
- `blog/[id]/duzenle/page.tsx`: `title: "Yazıyı Düzenle"`

### 4. Durum/görünürlük vurgusu (kartlarda sol-kenar aksanı)
`DurumRozeti.tsx`'in zaten kurulu ve **bağımsız review'dan geçmiş** 3 katmanlı renk mantığı (`new`=dolu forest, `contacted`/`scheduled`=forest-çizgili, `done`/`cancelled`=stone-çizgili) **birebir** kartlara taşınır — **yeni bir renk icat edilmez**:
- Dashboard'daki 5 durum kartına (`(protected)/page.tsx`) ve talep liste satırlarına (`talepler/page.tsx`) `border-l-4` eklenir: `new` → `border-l-forest`, `contacted`/`scheduled` → `border-l-forest` (rozet zaten forest-çizgili, kart da aynı tonu kullanır — ayrım rozetin dolgu/çizgi farkında kalır), `done`/`cancelled` → `border-l-stone`.
- Blog liste satırlarına (`blog/page.tsx`) aynı mantık: `published` → `border-l-forest`, `draft` → `border-l-stone`.
- Her liste öğesine küçük bir sage ikon eklenir: talep satırına kişi ikonu (`user`, `ServiceIcon.tsx`'te zaten var), blog satırına döküman/kalem ikonu.

### 5. Blog liste — kapak küçük resmi
`src/lib/blog-admin.ts`'teki `listPostsAdmin()` seçimine `coverImageUrl` eklenir (şema zaten destekliyor, `blogPosts.coverImageUrl`). `blog/page.tsx`'te her satırın solunda `next/image` ile 56×56 yuvarlak köşeli (`rounded-md object-cover`) küçük resim; `coverImageUrl` yoksa aynı boyutta `bg-cream` üzerine sage döküman ikonu olan bir yer tutucu kutu.

### 6. Talep detayı — tarih input'u cilası
`globals.css`'e kapsamlı bir kural eklenir (yalnız CSS, JS/kütüphane yok):
```css
input[type="datetime-local"] {
  color-scheme: light; /* sistem koyu temasında ikon tersine dönmesin */
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
  opacity: 1;
}
```
(Firefox'ta `::-webkit-*` no-op kalır, zaten kendi native görünümünü kullanır — davranış bozulmaz, sadece Chromium/Brave/Safari'de cila.)

### 7. Blog editörü — görsel ayrım
`Editor.tsx`'in dış sarmalayıcısına (araç çubuğu + içerik alanı birlikte) `rounded-lg border border-stone shadow-sm` eklenir ki tek bir "editör kartı" gibi görünsün (şu an araç çubuğu ile içerik alanı arasında görsel süreklilik zayıf). Araç çubuğuna `bg-cream rounded-t-lg` (içerik alanı zaten `bg-warm-white`), böylece iki bölge net ayrışır. `PostForm.tsx`'teki "İçerik" etiketi diğer alan etiketleriyle aynı kalır (`text-forest font-medium`) — yalnızca editörün kendisi görsel olarak öne çıkar, metadata alanlarından (başlık/slug/kategori/etiket/özet) ayrı bir "bölüm" hissi vermez çünkü tek bir form akışı olarak kalmalı (YAGNI: ayrı adım/sekme YOK).

## Global Constraints (her göreve otomatik uygulanır)
- **Renk disiplini (CLAUDE.md, ihlal edilemez):** metin yalnız `text-forest` (başlık) + `text-forest-muted` (gövde); opaklık-tabanlı metin rengi (`text-forest/NN`) yasak; `sage`/`sage-dark` metin olarak yasak — yalnız aksan (ince çizgi/ikon/işaret, tam da bu görevdeki ikonlar). Yüzeyler yalnız warm-white/cream/forest.
- **`DurumRozeti`'nin renk sınıflandırması değiştirilemez** (PR #27 bağımsız review'dan geçti — bkz. bileşendeki yorum). Kart aksanları bu sınıflandırmayı birebir yansıtır, yeni bir şema icat etmez.
- Tüm yeni metin Türkçe.
- Yeni npm bağımlılığı **yok** (ikon/tarih için harici kütüphane eklenmez).
- Next 16: `params`/`searchParams` hâlâ Promise; mevcut örüntüler korunur.

## Kabul kriterleri
- [ ] Giriş sayfası: logo + kart görünümü, `npm run dev` üzerinde doğrulanır.
- [ ] Panel nav'ında 3 ikon; sekme başlığı her sayfada farklı ve doğru (`... · Panel`).
- [ ] Dashboard + talep listesi + blog listesi satırlarında durum-uyumlu sol-kenar aksanı; blog liste satırlarında kapak küçük resmi (veya yer tutucu).
- [ ] Tarih input'u Brave/Chrome'da belirgin şekilde daha cilalı görünüyor (ekran görüntüsüyle karşılaştırma).
- [ ] Blog editörü tek bir "kart" gibi görünüyor (araç çubuğu + içerik birleşik).
- [ ] `npm run lint` + `npx tsc --noEmit` + `npm test` + `npm run build` temiz.
- [ ] Hiçbir davranış/veri akışı değişmedi — yalnız görsel.
- [ ] Önceki ekran görüntüleriyle (`.superpowers/sdd/panel-screenshots/`) karşılaştırmalı yeni ekran görüntüleri alınır.

## Bilinen, kapsam dışı bırakılan gözlem
Konsolda bir hydration uyarısı (`<html className>` sunucu/istemci uyuşmazlığı) görüldü — muhtemelen otomasyon taray��cısına özgü (uzantı/profil kaynaklı), uygulamanın kendi kodunda değil. Bu görev kapsamında araştırılmayacak; final review'da tekrar gözlemlenirse ayrıca ele alınır.
