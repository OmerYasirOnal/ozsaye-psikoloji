import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";

// Statik export: tüm slug'lar build sırasında üretilir, listede olmayan
// yollar 404 döner.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = `/yazilar/${slug}/`;
  return {
    title: `${post.title} | Öz & Saye Psikoloji`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.date || undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
  };
}

export default async function YaziDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Arama motorları/AI için BlogPosting yapısal verisi (JSON-LD).
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date || undefined,
    inLanguage: "tr-TR",
    author: post.author
      ? { "@type": "Person", name: post.author }
      : { "@type": "Organization", name: "Öz & Saye Psikoloji" },
    publisher: {
      "@type": "Organization",
      name: "Öz & Saye Psikoloji",
      logo: {
        "@type": "ImageObject",
        url: "https://ozsayepsikoloji.com/icon.svg",
      },
    },
    mainEntityOfPage: `https://ozsayepsikoloji.com/yazilar/${slug}/`,
    keywords: post.tags.join(", "),
  };

  return (
    <article className="relative bg-cream py-16 lg:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Üst gezinme */}
        <Link
          href="/yazilar/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-sage-dark transition-colors hover:text-forest"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Tüm Yazılar
        </Link>

        {/* Başlık alanı */}
        <header className="mt-8">
          <span className="inline-block rounded-full bg-forest/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
            {post.category}
          </span>
          <h1 className="mt-5 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-forest/50">
            {post.author && <span>{post.author}</span>}
            {post.author && <span className="h-1 w-1 rounded-full bg-sage" />}
            <span>{post.formattedDate}</span>
            <span className="h-1 w-1 rounded-full bg-sage" />
            <span>{post.readingTime} okuma</span>
          </div>
        </header>

        {/* Gövde */}
        <div
          className="prose-ozsaye mt-10"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* Alt CTA */}
        <div className="mt-16 rounded-2xl bg-forest p-8 text-center text-cream lg:p-10">
          <h2 className="font-display text-2xl font-light lg:text-3xl">
            Profesyonel destek almak ister misiniz?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-cream/70">
            Güvenli bir alanda, size özel bir süreçte yanınızdayız. Randevu için
            bizimle iletişime geçebilirsiniz.
          </p>
          <Link
            href="/#randevu"
            className="mt-6 inline-block rounded-full bg-cream px-8 py-3 text-sm font-semibold text-forest transition-all hover:bg-warm-white"
          >
            Online Randevu
          </Link>
        </div>
      </div>
    </article>
  );
}
