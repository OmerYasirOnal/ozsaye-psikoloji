import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { site } from "@/lib/site";

// Uzman detay sayfası. Kaynak: site.experts (slug ile bulunur).
// robots: kök layout dataReady durumuna göre noindex/index yönetir; burada
// ayarlanmaz (miras alınır).

/** Bir değerin gerçek veri mi (placeholder [DOLDUR] değil mi) olduğunu döndürür. */
function isReady(value: string): boolean {
  return value.trim().length > 0 && !value.trim().startsWith("[DOLDUR]");
}

export function generateStaticParams() {
  return site.experts.map((expert) => ({ slug: expert.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const expert = site.experts.find((e) => e.slug === slug);

  if (!expert) {
    return { title: "Uzman bulunamadı" };
  }

  return {
    title: expert.name,
    description: `${expert.title} — ${site.shortName}`,
    alternates: { canonical: `/ekip/${slug}` },
  };
}

export default async function ExpertDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expert = site.experts.find((e) => e.slug === slug);

  if (!expert) {
    notFound();
  }

  // JSON-LD yalnızca gerçek veri hazır olduğunda (dataReady) üretilir; künye
  // placeholder olduğu sürece yapısal veri yayılmaz.
  const sameAs = expert.sameAs.filter(isReady);
  const knowsAbout = expert.areas.filter(isReady);

  const personJsonLd = site.dataReady
    ? {
        "@context": "https://schema.org",
        "@type": "Person",
        name: expert.name,
        jobTitle: expert.title,
        worksFor: {
          "@type": "MedicalClinic",
          name: site.shortName,
          url: site.url,
        },
        ...(isReady(expert.university)
          ? { alumniOf: expert.university }
          : {}),
        ...(knowsAbout.length > 0 ? { knowsAbout } : {}),
        ...(sameAs.length > 0 ? { sameAs } : {}),
      }
    : null;

  return (
    <main id="icerik" className="bg-warm-white">
      {personJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      )}

      <div className="mx-auto max-w-6xl px-6 py-28 lg:px-8 lg:py-36">
        {/* Breadcrumb */}
        <nav aria-label="Sayfa konumu" className="font-body text-sm text-forest-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="underline decoration-sage/50 underline-offset-[5px] transition-colors hover:decoration-forest"
              >
                Ana sayfa
              </Link>
            </li>
            <li aria-hidden="true" className="text-sage">
              /
            </li>
            <li>
              <Link
                href="/ekip"
                className="underline decoration-sage/50 underline-offset-[5px] transition-colors hover:decoration-forest"
              >
                Ekip
              </Link>
            </li>
            <li aria-hidden="true" className="text-sage">
              /
            </li>
            <li aria-current="page" className="text-forest">
              {expert.name}
            </li>
          </ol>
        </nav>

        <div className="mt-14 grid gap-12 lg:grid-cols-[18rem_1fr] lg:gap-16">
          {/* Foto yuvası */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            {/*
              FOTOĞRAF: gerçek portre görseli henüz yok; aşağıdaki SVG geçici
              yer tutucudur. Görsel hazır olduğunda (public yolu
              expert.image, ör. "/uzmanlar/melek-yildiz.jpg") bu yuvayı
              next/image ile değiştirin. Örnek:

                import Image from "next/image";

                <Image
                  src={expert.image}
                  alt={expert.name + " portresi"}
                  width={288}
                  height={360}
                  className="aspect-[4/5] w-full rounded-2xl border border-sage/15 object-cover"
                />
            */}
            <div
              aria-hidden="true"
              className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-sage/15 bg-sage/10"
            >
              <svg
                className="h-16 w-16 text-sage"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          </div>

          {/* Künye + içerik */}
          <div>
            <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
              Uzman kadromuz
            </p>
            <h1 className="mt-5 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              {expert.name}
            </h1>
            <div aria-hidden="true" className="mt-6 h-px w-12 bg-sage/40" />

            <p className="mt-6 font-body text-base text-forest-muted lg:text-lg">
              {expert.title}
            </p>
            {isReady(expert.credentialsLine) && (
              <p className="mt-2 font-body text-base leading-relaxed text-forest-muted">
                {expert.credentialsLine}
              </p>
            )}

            {/* Biyografi */}
            <p className="mt-8 max-w-3xl font-body text-base leading-relaxed text-forest-muted lg:text-lg">
              {expert.bio}
            </p>

            {/* E-E-A-T künye bloğu */}
            <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {isReady(expert.university) && (
                <CredentialBlock label="Eğitim kurumu">
                  <p className="font-body text-base leading-relaxed text-forest-muted">
                    {expert.university}
                  </p>
                </CredentialBlock>
              )}

              {expert.degrees.length > 0 && (
                <CredentialBlock label="Dereceler">
                  <ul className="space-y-2">
                    {expert.degrees.map((degree) => (
                      <li
                        key={degree}
                        className="font-body text-base leading-relaxed text-forest-muted"
                      >
                        {degree}
                      </li>
                    ))}
                  </ul>
                </CredentialBlock>
              )}

              {expert.certifications.length > 0 && (
                <CredentialBlock label="Sertifikalar">
                  <ul className="space-y-2">
                    {expert.certifications.map((cert) => (
                      <li
                        key={cert}
                        className="font-body text-base leading-relaxed text-forest-muted"
                      >
                        {cert}
                      </li>
                    ))}
                  </ul>
                </CredentialBlock>
              )}

              {isReady(expert.membership) && (
                <CredentialBlock label="Üyelik">
                  <p className="font-body text-base leading-relaxed text-forest-muted">
                    {expert.membership}
                  </p>
                </CredentialBlock>
              )}
            </dl>

            {/* Çalışma alanları */}
            {expert.areas.length > 0 && (
              <section aria-labelledby="calisma-alanlari" className="mt-12">
                <h2
                  id="calisma-alanlari"
                  className="font-display text-2xl font-light text-forest lg:text-3xl"
                >
                  Çalışma <span className="italic">alanları</span>
                </h2>
                <div aria-hidden="true" className="mt-4 h-px w-12 bg-sage/40" />
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {expert.areas.map((area) => (
                    <li key={area} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
                      />
                      <span className="font-body text-base leading-relaxed text-forest-muted">
                        {area}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* CTA */}
            <div className="mt-14 rounded-2xl border border-sage/15 bg-cream p-8 lg:p-10">
              <h2 className="font-display text-2xl font-light text-forest lg:text-3xl">
                Birlikte <span className="italic">başlayalım</span>
              </h2>
              <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-forest-muted">
                {expert.name} ile çalışmak ya da size uygun süreci konuşmak için
                randevu talebi oluşturabilirsiniz.
              </p>
              <div className="mt-8">
                <Link
                  href="/#randevu"
                  className="group inline-flex items-center gap-2 rounded-full bg-forest px-8 py-3.5 font-body text-sm font-semibold tracking-wide text-cream transition-colors duration-300 hover:bg-forest-dark motion-reduce:transition-none"
                >
                  Randevu oluştur
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>

            {/* Ekibe dönüş */}
            <div className="mt-12 border-t border-sage/20 pt-10">
              <Link
                href="/ekip"
                className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-forest transition-colors duration-300 hover:text-forest-light motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none"
                >
                  ←
                </span>
                Tüm ekibe dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/** E-E-A-T künye alanı: eyebrow etiketli, ince sage hairline'lı sade blok. */
function CredentialBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
        {label}
      </dt>
      <div aria-hidden="true" className="mt-3 h-px w-8 bg-sage/40" />
      <dd className="mt-3">{children}</dd>
    </div>
  );
}
