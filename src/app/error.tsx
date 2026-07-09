"use client"; // Hata sınırları Client Component olmalı

import { useEffect } from "react";
import Link from "next/link";

/**
 * Segment (kök) hata sınırı. Kök layout'un içinde render olur; Header/Footer
 * chrome'u görünür kalır (bkz. SiteChrome). Beklenmedik bir çalışma-zamanı
 * hatası (ör. randevu action'ında geçici bir DB kesintisi) yakalanınca bu
 * sakin, Türkçe, marka-uyumlu sayfa gösterilir.
 *
 * Not: `reset()` hata durumunu temizleyip segmenti yeniden render eder. Kalıcı
 * bir sorunda kullanıcı asla kilitlenmesin diye ayrıca "Ana sayfaya dön" linki
 * garanti bir çıkış sağlar. (Next 16.2 `unstable_retry()` yeniden veri çekimi de
 * yapar; kararlı isimli `reset` tercih edildi.)
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Yalnızca hata nesnesini kaydet (hasta verisi/PII içermez); teşhis için.
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-6 py-28">
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Botanik imza (Hero filiz motifi) */}
        <svg
          aria-hidden="true"
          className="mx-auto mb-8 h-9 w-9 text-sage"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22V10" />
          <path d="M12 12c-3.3 0-6-2.7-6-6 3.3 0 6 2.7 6 6Z" />
          <path d="M12 10.5c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
        </svg>

        <p className="font-body text-xs font-medium tracking-[0.25em] text-forest-muted uppercase">
          Beklenmedik bir hata
        </p>

        <h1 className="mt-6 font-display text-5xl leading-[1.06] font-light tracking-tight text-forest sm:text-6xl">
          Bir şeyler
          <br />
          <span className="italic">ters gitti.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-md font-body text-lg leading-relaxed text-forest-muted">
          Üzgünüz, beklenmedik bir sorunla karşılaştık. Bu genellikle geçici bir
          durumdur — lütfen birazdan tekrar deneyin. Sürerse bize doğrudan
          ulaşabilirsiniz.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <button
            type="button"
            onClick={() => reset()}
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-forest-dark"
          >
            <svg
              className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <path d="M21 3v6h-6" />
            </svg>
            Tekrar dene
          </button>

          <Link
            href="/"
            className="font-body text-sm font-semibold tracking-wide text-forest-muted underline decoration-sage underline-offset-4 transition-colors duration-300 hover:text-forest"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
