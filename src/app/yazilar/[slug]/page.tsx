import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getPostSlugs, getPostMeta, formatPostDate } from "@/lib/blog";
import { site, absoluteUrl } from "@/lib/site";

// generateStaticParams dışındaki bir slug'a erişim 404 döner.
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getPostMeta(slug);
  if (!meta) return {};
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/yazilar/${slug}` },
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.description,
      url: `/yazilar/${slug}`,
      publishedTime: meta.date,
    },
  };
}

export default async function YaziPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await getPostMeta(slug);
  if (!meta) notFound();

  const { default: Post } = await import(`@/content/yazilar/${slug}.mdx`);
  const author = site.experts.find((e) => e.slug === meta.authorSlug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.date,
    inLanguage: "tr-TR",
    mainEntityOfPage: absoluteUrl(`/yazilar/${slug}`),
    ...(author
      ? {
          author: {
            "@type": "Person",
            name: author.name,
            url: absoluteUrl(`/ekip/${author.slug}`),
          },
        }
      : {}),
    publisher: {
      "@type": "MedicalClinic",
      "@id": `${site.url}#klinik`,
      name: site.shortName,
      url: site.url,
    },
  };

  return (
    <main id="icerik" className="bg-warm-white">
      <article className="mx-auto max-w-3xl px-6 py-28 lg:px-8 lg:py-36">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="font-body text-sm text-forest-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-forest">
                Ana sayfa
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/yazilar" className="transition-colors hover:text-forest">
                Yazılar
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-forest">{meta.category}</li>
          </ol>
        </nav>

        {/* Başlık + künye */}
        <header className="mt-8">
          <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
            {meta.category}
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            {meta.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-body text-sm text-forest-muted">
            {author && (
              <>
                <Link
                  href={`/ekip/${author.slug}`}
                  className="font-medium text-forest underline decoration-sage/50 underline-offset-[3px] transition-colors hover:decoration-forest"
                >
                  {author.name}
                </Link>
                <span aria-hidden="true">·</span>
              </>
            )}
            <time dateTime={meta.date}>{formatPostDate(meta.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{meta.readingMinutes} dk okuma</span>
          </div>
          <div className="mt-8 h-px w-12 bg-sage/40" aria-hidden="true" />
        </header>

        {/* MDX gövde — stiller src/mdx-components.tsx üzerinden */}
        <Post />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-sage/15 bg-cream p-8 lg:p-10">
          <h2 className="font-display text-2xl leading-tight font-light text-forest">
            Bir adım atmak <span className="italic">ister misiniz?</span>
          </h2>
          <p className="mt-3 font-body text-base leading-relaxed text-forest-muted">
            Bu konuları güvenli ve gizli bir alanda konuşmak için bir ön görüşme
            planlayabilirsiniz.
          </p>
          <Link
            href="/#randevu"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3 font-body text-sm font-semibold text-cream transition-colors duration-300 hover:bg-forest-dark"
          >
            Online Randevu Al
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Geri dönüş */}
        <div className="mt-10">
          <Link
            href="/yazilar"
            className="group inline-flex items-center gap-2 font-body text-sm font-semibold text-forest"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-x-0.5 motion-reduce:transition-none"
            >
              &larr;
            </span>
            Tüm yazılar
          </Link>
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
