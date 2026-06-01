import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceIcon } from "@/components/ServiceIcon";
import { getService, getServiceSlugs } from "@/lib/services";
import { site } from "@/lib/site";

/**
 * Hizmet (çalışma alanı) detay sayfası — /hizmetler/[slug].
 *
 * Tasarım: "Sakin Botanik Minimalizm". Sade/editöryal okuma düzeni
 * (max-w-3xl), yalnızca text-forest (başlık) + text-forest-muted (gövde);
 * sage yalnızca ince hairline/ikon/işaret aksanı olarak kullanılır. SSS, ana
 * sayfadaki FaqSection diliyle birebir uyumlu erişilebilir akordeon.
 *
 * Robots: kök layout site.dataReady durumuna göre index/noindex'i yönetir;
 * burada robots ayarlanmaz (miras alınır).
 */

/** Tüm hizmet slug'larını derleme zamanında üret. */
export async function generateStaticParams() {
  return getServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) {
    return { title: "Çalışma Alanı Bulunamadı" };
  }

  return {
    title: service.title,
    description: service.metaDescription,
    alternates: { canonical: `/hizmetler/${slug}` },
  };
}

export default async function HizmetDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);

  if (!service) notFound();

  // intro'yu \n\n ile paragraflara böl.
  const introParagraphs = service.intro
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  // Service + FAQPage yapısal verisi — içerik genel ve doğrudur, bu nedenle
  // her zaman yayınlanır. JSON-LD'de site.name (placeholder) değil
  // site.shortName kullanılır.
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.metaDescription,
    serviceType: service.title,
    provider: {
      "@type": "MedicalClinic",
      "@id": site.url + "#klinik",
      name: site.shortName,
      url: site.url,
    },
    areaServed: "Türkiye",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <main id="icerik" className="bg-warm-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="mx-auto max-w-3xl px-6 py-28 lg:px-8 lg:py-36">
        {/* Breadcrumb */}
        <nav aria-label="Sayfa konumu" className="font-body text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-forest-muted">
            <li>
              <Link
                href="/"
                className="underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest"
              >
                Ana sayfa
              </Link>
            </li>
            <li aria-hidden="true" className="text-sage">
              /
            </li>
            <li>
              <Link
                href="/hizmetler"
                className="underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest"
              >
                Çalışma Alanları
              </Link>
            </li>
            <li aria-hidden="true" className="text-sage">
              /
            </li>
            <li aria-current="page" className="text-forest">
              {service.title}
            </li>
          </ol>
        </nav>

        {/* Başlık bloğu */}
        <header className="mt-12">
          <ServiceIcon name={service.iconKey} className="h-10 w-10 text-sage" />
          <p className="mt-8 font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
            Çalışma Alanı
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            {service.title}
          </h1>
          <div aria-hidden="true" className="mt-8 h-px w-12 bg-sage/40" />
        </header>

        {/* Giriş */}
        <div className="mt-8 space-y-5">
          {introParagraphs.map((paragraph, idx) => (
            <p
              key={idx}
              className="font-body text-lg leading-relaxed text-forest-muted"
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Bölümler */}
        <div className="mt-16 space-y-16">
          {service.sections.map((section, idx) => (
            <section key={section.heading} aria-labelledby={`bolum-${idx}`}>
              {idx > 0 && (
                <div
                  aria-hidden="true"
                  className="mb-16 h-px w-12 bg-sage/40"
                />
              )}
              <h2
                id={`bolum-${idx}`}
                className="font-display text-2xl font-light text-forest lg:text-3xl"
              >
                {section.heading}
              </h2>
              <div className="mt-5 space-y-4">
                {section.body.map((paragraph, pIdx) => (
                  <p
                    key={pIdx}
                    className="font-body text-base leading-relaxed text-forest-muted"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sıkça Sorulan Sorular */}
        {service.faq.length > 0 && (
          <section aria-labelledby="sss-baslik" className="mt-24">
            <h2
              id="sss-baslik"
              className="font-display text-2xl font-light text-forest lg:text-3xl"
            >
              Sıkça Sorulan Sorular
            </h2>
            <div aria-hidden="true" className="mt-5 h-px w-12 bg-sage/40" />

            <div className="mt-10 border-t border-sage/15">
              {service.faq.map((item) => (
                <details key={item.q} className="group border-b border-sage/15">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
                    <h3 className="font-display text-lg font-medium text-forest lg:text-xl">
                      {item.q}
                    </h3>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-sage transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
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
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </summary>
                  <p className="pb-7 font-body text-base leading-relaxed text-forest-muted">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Alt CTA */}
        <div className="mt-20 border-t border-sage/15 pt-12">
          <p className="font-body text-base leading-relaxed text-forest-muted">
            Bu süreç hakkında konuşmak ya da bir randevu planlamak isterseniz,
            ilk adımı birlikte atabiliriz.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="/#randevu"
              className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-cream transition-all duration-300 hover:bg-forest-dark motion-reduce:transition-none"
            >
              Randevu Al
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
              >
                →
              </span>
            </Link>
            <Link
              href="/hizmetler"
              className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-forest underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest"
            >
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              >
                ←
              </span>
              Tüm çalışma alanları
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
