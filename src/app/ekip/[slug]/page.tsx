import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isReady, site } from "@/lib/site";

// Uzman detay sayfası. Kaynak: site.experts (slug ile bulunur).
// robots: kök layout dataReady durumuna göre noindex/index yönetir; burada
// ayarlanmaz (miras alınır).
// isReady (placeholder filtresi) @/lib/site tek kaynağından gelir.

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

  // Monogram: ad kelimelerinin baş harfleri (en fazla 2, büyük harf). Foto
  // yer tutucusu için. Ör. "Melek Yıldız" -> "MY", "Sacide Şahin" -> "SŞ".
  const monogram = expert.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");

  // Placeholder uzman alanları yalnızca gerçek veri girildiğinde gösterilir;
  // [DOLDUR] iken hiç render edilmez (sahte künye/beyan görünmesin).
  const bio = isReady(expert.bio) ? expert.bio : null;
  const university = isReady(expert.university) ? expert.university : null;
  const membership = isReady(expert.membership) ? expert.membership : null;
  const credentialsLine = isReady(expert.credentialsLine)
    ? expert.credentialsLine
    : null;
  const degrees = expert.degrees.filter(isReady);
  const certifications = expert.certifications.filter(isReady);
  const areas = expert.areas.filter(isReady);

  // JSON-LD yalnızca gerçek veri hazır olduğunda (dataReady) üretilir; künye
  // placeholder olduğu sürece yapısal veri yayılmaz.
  const sameAs = expert.sameAs.filter(isReady);
  const knowsAbout = areas;

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
        ...(university ? { alumniOf: university } : {}),
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
              FOTOĞRAF: gerçek portre görseli henüz yok; aşağıdaki monogram
              (uzmanın ad baş harfleri) geçici yer tutucudur. Görsel hazır
              olduğunda (public yolu expert.image, ör.
              "/uzmanlar/melek-yildiz.jpg") bu yuvayı next/image ile değiştirin.
              Örnek:

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
              <span className="font-display text-6xl font-light tracking-wide text-sage lg:text-7xl">
                {monogram}
              </span>
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
            {credentialsLine && (
              <p className="mt-2 font-body text-base leading-relaxed text-forest-muted">
                {credentialsLine}
              </p>
            )}

            {/* Biyografi */}
            {bio && (
              <p className="mt-8 max-w-3xl font-body text-base leading-relaxed text-forest-muted lg:text-lg">
                {bio}
              </p>
            )}

            {/* E-E-A-T künye bloğu */}
            <dl className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {university && (
                <CredentialBlock label="Eğitim kurumu">
                  <p className="font-body text-base leading-relaxed text-forest-muted">
                    {university}
                  </p>
                </CredentialBlock>
              )}

              {degrees.length > 0 && (
                <CredentialBlock label="Dereceler">
                  <ul className="space-y-2">
                    {degrees.map((degree) => (
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

              {certifications.length > 0 && (
                <CredentialBlock label="Sertifikalar">
                  <ul className="space-y-2">
                    {certifications.map((cert) => (
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

              {membership && (
                <CredentialBlock label="Üyelik">
                  <p className="font-body text-base leading-relaxed text-forest-muted">
                    {membership}
                  </p>
                </CredentialBlock>
              )}
            </dl>

            {/* Çalışma alanları */}
            {areas.length > 0 && (
              <section aria-labelledby="calisma-alanlari" className="mt-12">
                <h2
                  id="calisma-alanlari"
                  className="font-display text-2xl font-light text-forest lg:text-3xl"
                >
                  Çalışma <span className="italic">alanları</span>
                </h2>
                <div aria-hidden="true" className="mt-4 h-px w-12 bg-sage/40" />
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {areas.map((area) => (
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
