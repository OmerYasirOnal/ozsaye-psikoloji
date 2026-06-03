# Anasayfa Ferahlık + Animasyon Sistemi — Tasarım (Spec)

**Tarih:** 2026-06-03
**Kapsam:** Anasayfa (`/`) — yeniden kullanılabilir bir "sakin ama canlı" ferahlık+animasyon katmanı. Alt sayfalara (`/hizmetler`, `/ekip`, `/blog`, kurumsal) yayma **sonraki tur** (bu spec'in dışında).
**Yaklaşım:** A — mevcut `ScrollReveal` + globals.css altyapısını genişlet; **yeni bağımlılık yok**.

## Amaç
Anasayfayı daha **ferah, iç açıcı ve canlı** hale getirmek; scroll boyunca sakin, sürekli bir "açılma" hissi vermek — **sakin botanik minimalizm** ilkesinden (CLAUDE.md) sapmadan.

## İlkeler / Kısıtlar (değişmez)
- Marka paleti aynı (forest/cream/sage/blush). Renk disiplini korunur (opaklık-tabanlı metin yasağı vb.).
- Dekorasyon minimal: yüzen yaprak/grain/gradient ayraç **yok**; en fazla **tek ince sage hairline** ve Hero'daki tek filiz motifi.
- Animasyonlar **sade ve yumuşak**, asla gösterişçi. Hareketler küçük; tek italik vurgu kuralı korunur.
- Statik export (`output: export`) güvenli; sunucu/Server Action yok.
- Erişilebilirlik birinci sınıf: `prefers-reduced-motion`, no-JS fallback, klavye/odak korunur.

## Mimari — Yeniden Kullanılabilir Primitifler

### 1. `ScrollReveal` — varyantlar
Mevcut `src/components/ScrollReveal.tsx` genişletilir: `variant` prop'u eklenir.
- `up` (varsayılan — mevcut translateY(24px)), `fade` (yalnız opacity), `scale` (%2 ölçek 0.98→1 + opacity), `left`/`right` (yan öğeler için ≤24px translateX).
- Mevcut `delay` (kademeli stagger), IntersectionObserver, güvenlik zamanlayıcısı (~2sn), reduced-motion kısa devresi **korunur**.
- CSS: `html.js .reveal[data-variant="..."]` kuralları; yalnızca transform/opacity, marka easing'i `cubic-bezier(.22,1,.36,1)`. Mesafeler küçük (≤24px, ölçek ≤%2).

### 2. `Parallax` — hafif rAF hook'u/bileşeni
Yeni `src/components/Parallax.tsx` (client). Scroll'a göre öğeyi **çok hafif** (`speed` ile, tepe ≤~24px) `transform: translate3d(0, …, 0)` ile kaydırır.
- Scroll dinleyici `{ passive: true }` + `requestAnimationFrame` throttle (`ticking` guard). Yalnızca öğe viewport civarındayken hesaplar.
- `prefers-reduced-motion: reduce` → **tamamen kapalı** (no-op; öğe default konumda). `matchMedia` change olayını da dinler.
- Uygulama: Hero botanik/filiz motifi + en çok 1-2 bölüm aksanı. Amaç incelikli derinlik, asla sarsıcı değil.

### 3. Büyüyen sage çizgi (hairline)
Bölüm etiketleri (eyebrow: "Hakkımızda", "Çalışma Alanlarımız" vb.) altında ince sage çizgi; ScrollReveal görünür olunca genişliği `0 → ~2.5rem` (w-10) açılır.
- Küçük, yeniden kullanılabilir bir öğe/yardımcı sınıf (`.hairline-grow`), `.visible` ile tetiklenir; transform/opacity (scaleX) tabanlı, reduced-motion'da anında.
- İlkendeki "tek ince sage hairline" iznine birebir uyar.

## Ferahlık Geçişi (boşluk + ritim)
- Bölüm dikey ritmi tutarlı, cömert bir ölçeğe oturtulur (sıkışık bölümlerde biraz daha nefes; bölümler arası tutarlı).
- Başlık (eyebrow/H2) → gövde arası biraz daha boşluk.
- Kart ızgaralarında biraz daha `gap` ve gerektiğinde iç padding.
- Tümü mevcut Tailwind/token sınırlarında; **palet/yapı/içerik değişmez**.

## Anasayfaya Uygulama
- **Hero:** motif hafif paralaks + giriş orkestrasyonunun cilalanması (mevcut `hero-animate` ile uyumlu).
- **About / Services / ProcessSection / Team / FaqSection / Articles / Contact:** tutarlı reveal varyantları + kademeli gecikmeler + her bölüm etiketine büyüyen çizgi + ferahlık ritmi.
- Sonuç: scroll boyunca sakin, sürekli, iç açıcı bir akış.

## Erişilebilirlik & Performans
- Yalnızca transform/opacity (compositor dostu); scroll rAF-throttle; IntersectionObserver temizliği + güvenlik ağı (mevcut).
- `prefers-reduced-motion`: globals.css blanket reset zaten tüm geçiş/animasyonları etkisiz kılıyor; paralaks hook'u ayrıca no-op. Reveal/çizgi anında görünür.
- No-JS: `html.js` gating zaten içeriği görünür tutuyor; paralaks öğeleri JS'siz default konumda render olur.
- **Yeni bağımlılık yok**; bundle'a yalnızca küçük bir client hook eklenir.

## Doğrulama
1. `npm run lint && npm run build` yeşil.
2. Playwright ekran görüntüleri: anasayfa üst/scroll/mobil — ferah düzen + reveal'ların tetiklenmesi + paralaksın incelikli oluşu.
3. Adversarial workflow review (a11y / performans / tutarlılık / marka uyumu) — deploy öncesi.
4. PR → CI → merge → deploy → canlı doğrulama.

## Kapsam Dışı (YAGNI)
- Alt sayfalara yayma (sonraki tur, mekanik).
- Yeni sayfa/içerik, palet değişikliği, animasyon kütüphanesi, yapısal değişiklik — **yok**.

## Riskler
- Paralaks mobilde/yavaş cihazda jank riski → hareket çok küçük, rAF-throttle, reduced-motion kapalı; gerekirse dokunmatik/dar viewport'ta paralaks devre dışı.
- "Çok canlı" → minimalizmden sapma riski → mesafeler küçük tutulur, adversarial review marka uyumunu denetler.
