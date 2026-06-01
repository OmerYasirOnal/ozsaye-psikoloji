import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sayfa Bulunamadı",
};

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-white px-6">
      {/* Tek hafif atmosfer (Hero ile aynı dil) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(146,181,148,0.14),transparent_68%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Botanik imza */}
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
          Hata 404
        </p>

        <h1 className="mt-6 font-display text-5xl leading-[1.06] font-light tracking-tight text-forest sm:text-6xl">
          Sayfa
          <br />
          <span className="italic">bulunamadı.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-md font-body text-lg leading-relaxed text-forest-muted">
          Aradığınız sayfa taşınmış ya da hiç var olmamış olabilir. Sizi güvenli
          bir alana, ana sayfamıza geri götürelim.
        </p>

        <div className="mt-10 flex justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-forest-dark"
          >
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 12H5m7-7l-7 7 7 7" />
            </svg>
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
