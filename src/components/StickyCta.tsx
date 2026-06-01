"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/**
 * Mobil cihazlarda (lg altinda) ekranin altina sabitlenen randevu CTA cubugu.
 * Kullanici ~600px asagi kayinca yumusakca belirir; masaustunde hic render edilmez.
 * Header (z-50) altinda kalmasi icin z-40 kullanir.
 */
export default function StickyCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    // Ilk yuklemede mevcut konuma gore durumu ayarla
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 transition-all duration-500 motion-reduce:transition-none lg:hidden ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0 motion-reduce:translate-y-0"
      }`}
      style={{
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto max-w-xl px-4 pt-3">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-forest px-4 py-3 text-cream shadow-[0_-4px_24px_rgba(30,58,36,0.25)] ring-1 ring-cream/10">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg leading-tight font-medium">
              İlk adımı <span className="italic text-sage-light">birlikte</span> atalım
            </p>
            <p className="truncate font-body text-xs text-sage-light">
              Güvenli ve gizli bir görüşme
            </p>
          </div>
          <Link
            href="/#randevu"
            aria-label="Online randevu al"
            className="flex min-h-[44px] shrink-0 items-center rounded-full bg-cream px-5 text-sm font-semibold text-forest transition-colors duration-300 hover:bg-cream-light motion-reduce:transition-none"
          >
            Online Randevu Al
          </Link>
        </div>
      </div>
    </div>
  );
}
