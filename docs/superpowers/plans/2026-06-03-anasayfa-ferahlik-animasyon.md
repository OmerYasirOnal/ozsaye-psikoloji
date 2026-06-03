# Anasayfa Ferahlık + Animasyon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anasayfaya, mevcut `ScrollReveal`+CSS altyapısını genişleten, bağımlılıksız "sakin ama canlı" bir ferahlık+animasyon katmanı eklemek (reveal varyantları, hafif paralaks, büyüyen sage çizgi, tutarlı dikey ritim) — sakin botanik minimalizmden sapmadan.

**Architecture:** Yeni bağımlılık yok. İki yeni/genişletilmiş client primitifi (`ScrollReveal` varyantları, `Parallax`) + globals.css'te varyant/hairline/ritim kuralları. Hepsi transform/opacity, `prefers-reduced-motion` ve no-JS (`html.js` gating) güvenli.

**Tech Stack:** Next.js 16 (static export), React 19, Tailwind v4 (CSS-first @theme), TypeScript.

**Test note:** Bu projede test runner YOK. Her görevin doğrulaması: `npm run lint && npm run build` (yeşil) + görsel görevlerde Playwright ekran görüntüsü. Son görevde adversarial workflow review.

**Marka token'ları (globals.css):** forest `#1F3B2E`, sage `#A6B79B`, brand easing `cubic-bezier(0.22, 1, 0.36, 1)`.

---

## File Structure

- `src/components/ScrollReveal.tsx` (MODIFY) — `variant` prop'u ekle; `data-variant` yaz.
- `src/components/Parallax.tsx` (CREATE) — rAF-throttle, reduced-motion-aware hafif paralaks sarmalayıcı.
- `src/app/globals.css` (MODIFY) — `.reveal[data-variant]` kuralları, `.reveal-line` (büyüyen çizgi), reduced-motion eklemeleri, ferahlık ritmi yardımcıları.
- `src/components/Hero.tsx` (MODIFY) — botanik motifi `Parallax` ile sar.
- `src/components/{About,Services,ProcessSection,Team,FaqSection,Articles,Contact}.tsx` (MODIFY) — bölüm etiketi altına `.reveal-line`, uygun reveal varyantları/stagger, ferahlık ritmi.

---

## Task 1: ScrollReveal'e varyant desteği

**Files:**
- Modify: `src/components/ScrollReveal.tsx`
- Modify: `src/app/globals.css` (reveal kuralları)

- [ ] **Step 1: ScrollReveal'e `variant` prop'u ekle**

`src/components/ScrollReveal.tsx` içinde interface ve imza + render `div`:

```tsx
interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "up" | "fade" | "scale" | "left" | "right";
}

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: ScrollRevealProps) {
```

Ve dönüş `div`'ine `data-variant` ekle (mevcut `ref`/className korunur):

```tsx
  return (
    <div ref={ref} data-variant={variant} className={`reveal ${delayClass} ${className}`}>
      {children}
    </div>
  );
```

(useEffect/observer/güvenlik zamanlayıcısı/reduced-motion mantığı AYNEN kalır.)

- [ ] **Step 2: globals.css'te varyant kurallarını ekle**

`src/app/globals.css` içinde mevcut reveal bloğunu şu hale getir (mevcut `html.js .reveal` + `html.js .reveal.visible` bloklarının yerine):

```css
/* Scroll animation base — yalnızca JS doğrulandığında (html.js) gizlenir. */
html.js .reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
html.js .reveal[data-variant="fade"] { transform: none; }
html.js .reveal[data-variant="scale"] { transform: scale(0.98); }
html.js .reveal[data-variant="left"] { transform: translateX(-24px); }
html.js .reveal[data-variant="right"] { transform: translateX(24px); }

html.js .reveal.visible { opacity: 1; transform: none; }
```

(`.reveal.visible` artık `translateY(0)` yerine `transform: none` — tüm varyantları sıfırlar.)

- [ ] **Step 3: Doğrula (lint + build)**

Run: `npm run lint && npm run build`
Expected: ikisi de hatasız (exit 0). `out/` üretildi.

- [ ] **Step 4: Commit**

```bash
git add src/components/ScrollReveal.tsx src/app/globals.css
git commit -m "feat(anim): ScrollReveal'e varyant (up/fade/scale/left/right) desteği"
```

---

## Task 2: Parallax bileşeni

**Files:**
- Create: `src/components/Parallax.tsx`

- [ ] **Step 1: Parallax bileşenini oluştur**

`src/components/Parallax.tsx`:

```tsx
"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  /** Kayma hızı (0.04–0.10 önerilir). Sonuç ±MAX px ile sınırlanır. */
  speed?: number;
  className?: string;
}

const MAX_SHIFT = 28; // px — sakin minimalizm için küçük tutulur

/**
 * İçeriği scroll'a göre çok hafif dikey kaydırır (derinlik hissi).
 * Yalnızca transform/translate3d (compositor dostu), rAF-throttle, passive.
 * prefers-reduced-motion: reduce → tamamen kapalı (öğe default konumda).
 */
export default function Parallax({ children, speed = 0.06, className = "" }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, -offset * speed));
      el.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Doğrula (lint + build)**

Run: `npm run lint && npm run build`
Expected: hatasız. (Henüz kullanılmıyor; sadece derlenmeli.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Parallax.tsx
git commit -m "feat(anim): hafif rAF paralaks bileşeni (reduced-motion-aware)"
```

---

## Task 3: Büyüyen sage çizgi (reveal-line)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: `.reveal-line` kurallarını ekle**

`src/app/globals.css` içinde reveal varyant bloğunun hemen ardına:

```css
/* Bölüm etiketi altı büyüyen sage çizgi — içeren .reveal görünür olunca açılır.
   JS yoksa (html.js yok) tam görünür kalır. */
.reveal-line {
  display: block;
  height: 2px;
  width: 2.5rem;
  background-color: #A6B79B;
  transform-origin: left center;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
html.js .reveal-line { transform: scaleX(0); }
html.js .reveal.visible .reveal-line { transform: scaleX(1); }
```

- [ ] **Step 2: Reduced-motion bloğuna savunma ekle**

`src/app/globals.css` içindeki `@media (prefers-reduced-motion: reduce)` bloğuna (mevcut `html.js .reveal { ... }` satırının yanına) ekle:

```css
  html.js .reveal-line { transform: none !important; }
```

- [ ] **Step 3: Doğrula (lint + build)**

Run: `npm run lint && npm run build`
Expected: hatasız.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(anim): bölüm etiketi altı büyüyen sage çizgi (.reveal-line)"
```

---

## Task 4: Ferahlık ritmi (boşluk pass'i)

**Files:**
- Modify: `src/components/{About,Services,ProcessSection,Team,AppointmentForm,FaqSection,Articles,Contact}.tsx` (yalnızca section padding + grid gap sınıfları)

**Kural (DRY):** Her bölümün kök `<section>`'ında dikey ritmi tutarlı ve cömert ölçeğe getir; kart ızgaralarında lg gap'i artır. Palet/yapı/metin DEĞİŞMEZ.

- [ ] **Step 1: Bölüm dikey ritmini birörnekleştir**

Her section kökünde `py-*` değerlerini şu hedefe hizala: **`py-28 lg:py-40`** (hâlihazırda `py-24 lg:py-32` veya `py-28 lg:py-36` olanları bu hedefe çek). Örnek (Articles.tsx kök section):

```tsx
<section id="yazilar" className="relative bg-cream py-28 lg:py-40">
```

(`AppointmentForm` zaten `py-28 lg:py-36` → `py-28 lg:py-40`; `ProcessSection`/`Team`/`Contact`/`FaqSection`/`Services`/`About` köklerini de aynı hedefe getir.)

- [ ] **Step 2: Kart ızgara gap'lerini artır**

Kart grid'i olan bölümlerde (Services, Team, Articles) grid sınıfına `lg:gap-10` ekle/yükselt. Örnek (Articles grid):

```tsx
<div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
```

- [ ] **Step 3: Başlık→gövde nefesini artır**

Bölüm başlıklarının altındaki ilk paragraf/eyebrow→H2 boşluğunu bir kademe artır (ör. `mt-4 → mt-6`, `mt-6 → mt-8`) — yalnızca sıkışık görünen yerlerde.

- [ ] **Step 4: Doğrula (lint + build + ekran görüntüsü)**

Run: `npm run lint && npm run build`
Sonra statik sunucu + Playwright ile anasayfayı aç, tam-sayfa ekran görüntüsü al; bölümlerin daha ferah/tutarlı boşluklu olduğunu göz ile doğrula.
Expected: build hatasız; düzen daha ferah, taşma/bozulma yok.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "design(anim): anasayfa dikey ritmi + kart gap'leri ferahlatıldı"
```

---

## Task 5: Anasayfaya animasyonları bağla

**Files:**
- Modify: `src/components/Hero.tsx` (paralaks)
- Modify: `src/components/{About,Services,ProcessSection,Team,FaqSection,Articles,Contact}.tsx` (eyebrow altı `.reveal-line` + reveal varyant/stagger)

- [ ] **Step 1: Hero motifini Parallax ile sar**

`src/components/Hero.tsx` içinde botanik/filiz motif öğesini `Parallax` ile sar (import ekle):

```tsx
import Parallax from "./Parallax";
// ...motif JSX'i:
<Parallax speed={0.05} className="...mevcut konum sınıfları...">
  {/* mevcut filiz/motif svg/öğesi */}
</Parallax>
```

(Hero "use client" değilse ve motif statikse: `Parallax` client bileşeni olduğundan Hero'yu değiştirmeye gerek yok; sadece motif `Parallax` ile sarılır. Hero server component kalabilir — client child render edebilir.)

- [ ] **Step 2: Her bölüm etiketinin (eyebrow) altına `.reveal-line` ekle**

Eyebrow'u zaten bir `ScrollReveal` içinde olan her bölümde (About, Services, ProcessSection, Team, FaqSection, Articles, Contact), eyebrow `<p>`/`<span>`'ın hemen ardına çizgiyi ekle. Örnek (Services eyebrow ScrollReveal'i):

```tsx
<ScrollReveal>
  <span className="...mevcut eyebrow sınıfları...">Çalışma Alanlarımız</span>
  <span className="reveal-line mt-4" aria-hidden="true" />
</ScrollReveal>
```

(Çizgi eyebrow ile aynı `ScrollReveal` içinde olmalı ki `.visible` ile büyüsün. `aria-hidden` dekoratif.)

- [ ] **Step 3: Reveal varyant/stagger'ı tutarlılaştır**

Kart grid'lerinde kartlar zaten `delay={idx+...}` ile staggered (Services/Team/Articles). Yan yerleşimli öğelerde (ör. About'taki görsel/metin sütunları) uygun olduğunda `variant="left"`/`variant="right"`; öne çıkan tekil bloklarda `variant="scale"` kullan. Aşırıya kaçma — çoğu yerde varsayılan `up` kalsın.

- [ ] **Step 4: Doğrula (lint + build + ekran görüntüleri)**

Run: `npm run lint && npm run build`
Statik sunucu + Playwright: anasayfa üst (Hero), scroll edilmiş orta bölümler, mobil (390px) ekran görüntüleri. Doğrula: paralaks incelikli, çizgiler bölüm girişinde büyüyor, reveal'lar tetikleniyor, 0 konsol hatası, mobilde bozulma yok.
Expected: build hatasız; animasyonlar sakin ve tutarlı.

- [ ] **Step 5: Commit**

```bash
git add src/components
git commit -m "feat(anim): anasayfaya paralaks + büyüyen çizgi + reveal varyantları bağlandı"
```

---

## Task 6: Adversarial review, PR ve deploy

**Files:** (yok — doğrulama/teslim)

- [ ] **Step 1: Adversarial workflow review**

`Workflow` ile 3-4 mercekli review çalıştır: (a) erişilebilirlik (reduced-motion gerçekten kapalı mı; no-JS; klavye/odak), (b) performans (yalnız transform/opacity; rAF; layout thrash yok; paralaks jank), (c) marka uyumu (sakin minimalizmden sapma var mı; hareketler küçük mü), (d) tutarlılık (easing/süre/stagger tutarlı). Yüksek/orta bulguları düzelt.

- [ ] **Step 2: Bulguları düzelt + tekrar build**

Bulgular varsa düzelt; `npm run lint && npm run build` tekrar yeşil olsun. Gerekirse ekran görüntüsüyle teyit et.

- [ ] **Step 3: PR aç → CI → merge → deploy**

```bash
git push -u origin anasayfa-ferahlik-animasyon
gh pr create --base main --title "Anasayfa ferahlık + animasyon katmanı" --body "..."
```
CI (Lint & Build) yeşil olunca `gh pr merge <n> --merge`. Deploy (GoDaddy FTP) main push'ta tetiklenir.

- [ ] **Step 4: Canlı doğrulama**

Deploy conclusion'ını `gh run view <id> --json conclusion` ile AYRI doğrula (watch exit-kodu maskeleyebilir). Canlıda anasayfayı Playwright ile aç; animasyon/ferahlık + paralaks + çizgileri teyit et.

---

## Notlar
- **Reduced-motion** ve **no-JS** her primitifte korunmalı (globals.css blanket reset + `html.js` gating + Parallax matchMedia no-op).
- **YAGNI:** Alt sayfalara yayma bu planın dışında (sonraki tur).
- Marka paleti/yapısı/metni değişmez; yeni bağımlılık eklenmez.
