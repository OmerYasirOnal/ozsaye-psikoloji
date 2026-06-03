"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  /** Kayma hızı (0.04–0.10 önerilir). Sonuç ±MAX_SHIFT px ile sınırlanır. */
  speed?: number;
  className?: string;
}

const MAX_SHIFT = 28; // px — sakin minimalizm için küçük tutulur

/**
 * İçeriği scroll'a göre çok hafif dikey kaydırır (derinlik hissi).
 * Yalnızca transform/translate3d (compositor dostu), rAF-throttle, passive.
 * prefers-reduced-motion: reduce → tamamen kapalı (öğe default konumda).
 */
export default function Parallax({
  children,
  speed = 0.06,
  className = "",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    const start = () => {
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      update();
    };
    const stop = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.style.transform = ""; // devinim istenmediğinde inline kaymayı temizle
    };
    // İlk durum + oturum içi tercih değişimine tepki ver (reduced-motion AÇILIRSA dur).
    const apply = () => (mql.matches ? stop() : start());
    apply();
    mql.addEventListener("change", apply);
    return () => {
      mql.removeEventListener("change", apply);
      stop();
    };
  }, [speed]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
