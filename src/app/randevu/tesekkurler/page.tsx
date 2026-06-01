import type { Metadata } from "next";
import Link from "next/link";

// Teşekkür sayfası randevu formu başarıyla gönderildiğinde gösterilir
// (actions.ts -> submitAppointment başarıda buraya redirect eder).
// Arama motorlarında dizine eklenmemeli: noindex.
export const metadata: Metadata = {
  title: "Teşekkürler",
  robots: {
    index: false,
    follow: false,
  },
};

const steps = [
  {
    title: "En kısa sürede aranacaksınız",
    desc: "Uzmanlarımızdan biri, uygun randevu saatini belirlemek üzere sizinle telefon yoluyla iletişime geçecek.",
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
  },
  {
    title: "Hafta içi 09:00 - 19:00 arası dönüş",
    desc: "Talebinizi hafta sonu veya mesai dışında ilettiyseniz, size bir sonraki iş günü içinde geri dönüş yapacağız.",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
];

export default function TesekkurlerPage() {
  return (
    <main
      id="icerik"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-warm-white px-6 py-28"
    >
      {/* Tek hafif atmosfer */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-10%] h-[56vh] w-[56vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(146,181,148,0.14),transparent_68%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        {/* Onay ikonu */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest text-cream">
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        <p className="mt-8 font-body text-xs font-medium tracking-[0.25em] text-forest-muted uppercase">
          Randevu Talebi
        </p>

        <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest sm:text-5xl lg:text-6xl">
          Başvurunuz <span className="italic">alındı.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl font-body text-lg leading-relaxed text-forest-muted">
          Randevu talebiniz bize ulaştı. İlginiz için teşekkür ederiz; bu, kendi
          özünüze doğru atılan değerli bir adım.
        </p>

        {/* Sıradaki adımlar */}
        <div className="mx-auto mt-12 max-w-xl rounded-2xl border border-sage/15 bg-cream p-8 text-left sm:p-10">
          <h2 className="font-display text-2xl font-light text-forest">
            Sıradaki <span className="italic">adımlar</span>
          </h2>
          <div className="mt-4 h-px w-12 bg-sage/40" />

          <ul className="mt-6 space-y-5">
            {steps.map((step) => (
              <li key={step.title} className="flex gap-4">
                <span
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/10 text-forest"
                  aria-hidden="true"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {step.icon}
                  </svg>
                </span>
                <div>
                  <h3 className="font-body text-base font-semibold text-forest">
                    {step.title}
                  </h3>
                  <p className="mt-1 font-body text-sm leading-relaxed text-forest-muted">
                    {step.desc}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* KVKK koruma notu */}
        <p className="mx-auto mt-8 flex max-w-xl items-start justify-center gap-2 font-body text-sm leading-relaxed text-forest-muted">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-sage"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>
            Paylaştığınız tüm bilgiler, 6698 sayılı Kişisel Verilerin Korunması
            Kanunu (KVKK) kapsamında gizlilik ilkesiyle korunur ve yalnızca
            randevunuzun planlanması amacıyla kullanılır.
          </span>
        </p>

        <div className="mt-12">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-forest-dark"
          >
            <svg
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
