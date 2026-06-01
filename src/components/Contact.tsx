import type { ReactNode } from "react";
import { isReady, site } from "@/lib/site";
import ScrollReveal from "./ScrollReveal";

type ContactCard = {
  icon: ReactNode;
  title: string;
  /** Düz metin satırları veya bağlantılı içerik. */
  content: ReactNode;
};

/** Düz (bağlantısız) iletişim metni için ortak gövde stili. */
const plainTextClass =
  "mt-2 font-body text-sm leading-relaxed text-forest-muted";
/** Bağlantılı iletişim metni için ortak bağlantı stili. */
const linkClass =
  "text-forest-muted underline decoration-sage/40 underline-offset-4 transition-colors duration-300 hover:text-forest hover:decoration-forest";

const cards: ContactCard[] = [
  {
    icon: (
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
    ),
    title: "Adres",
    content: (
      <p className={plainTextClass}>
        {isReady(site.address.streetAddress)
          ? site.address.full
          : "Adres bilgisi yakında"}
      </p>
    ),
  },
  {
    icon: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    title: "Telefon",
    content: isReady(site.phone.e164) ? (
      <p className="mt-2 font-body text-sm leading-relaxed">
        <a href={site.phone.href} className={linkClass}>
          {site.phone.display}
        </a>
      </p>
    ) : (
      <p className={plainTextClass}>Telefon yakında</p>
    ),
  },
  {
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M22 4l-10 8L2 4" />
      </>
    ),
    title: "E-posta",
    content: isReady(site.email.address) ? (
      <p className="mt-2 font-body text-sm leading-relaxed">
        <a href={site.email.href} className={linkClass}>
          {site.email.address}
        </a>
      </p>
    ) : (
      <p className={plainTextClass}>E-posta yakında</p>
    ),
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    title: "Çalışma Saatleri",
    content: (
      <div className="mt-2 space-y-1">
        {site.openingHours.map((hour) => (
          <p
            key={hour.label}
            className="font-body text-sm leading-relaxed text-forest-muted"
          >
            {hour.label}
          </p>
        ))}
      </div>
    ),
  },
];

export default function Contact() {
  return (
    <section id="iletisim" className="bg-cream py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Bölüm başlığı */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Bizimle <span className="italic">iletişime geçin</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <div
              aria-hidden="true"
              className="mx-auto mt-6 h-px w-12 bg-sage/40"
            />
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <p className="mt-6 font-body text-base leading-relaxed text-forest-muted">
              Sorularınız veya randevu talepleriniz için bizimle iletişime
              geçebilirsiniz.
            </p>
          </ScrollReveal>
        </div>

        {/* İletişim kartları */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx + 1}>
              <div className="rounded-2xl border border-sage/15 bg-warm-white p-8 lg:p-10">
                <svg
                  aria-hidden="true"
                  className="h-6 w-6 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  {item.icon}
                </svg>
                <h3 className="mt-5 font-display text-lg font-light text-forest">
                  {item.title}
                </h3>
                {item.content}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Harita */}
        <ScrollReveal delay={3}>
          {site.mapEmbedSrc ? (
            <div className="mt-12 overflow-hidden rounded-2xl border border-sage/15">
              <iframe
                src={site.mapEmbedSrc}
                loading="lazy"
                title="Ofis konumu haritası"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
            </div>
          ) : (
            <div className="mt-12 overflow-hidden rounded-2xl border border-sage/15 bg-warm-white">
              <div className="flex h-64 flex-col items-center justify-center px-6 text-center">
                <svg
                  aria-hidden="true"
                  className="h-8 w-8 text-sage"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="mt-4 font-body text-sm text-forest-muted">
                  Konum bilgisi yakında
                </p>
              </div>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}
