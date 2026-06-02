import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, formatDateTR } from "@/lib/blog";
import { site } from "@/lib/site";

const siteUrl = site.url;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };

  const url = `${siteUrl}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      locale: "tr_TR",
      url,
      siteName: "Öz & Saye Psikoloji",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ["/og.png"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = `${siteUrl}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    inLanguage: "tr-TR",
    datePublished: post.date,
    dateModified: post.date,
    keywords: post.tags.join(", "),
    articleSection: post.category,
    image: `${siteUrl}/og.png`,
    author: { "@type": "Organization", name: post.author, url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Öz & Saye Psikoloji",
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <>
      <main id="icerik" className="bg-cream pt-32 pb-24 lg:pt-40">
        <article className="mx-auto max-w-3xl px-6 lg:px-8">
          <nav className="mb-8 text-sm text-forest-muted">
            <Link href="/" className="transition-colors hover:text-forest">
              Anasayfa
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href="/blog" className="transition-colors hover:text-forest">
              Yazılar
            </Link>
          </nav>

          <header>
            <span className="inline-block rounded-full bg-sage/15 px-3 py-1 text-[11px] font-semibold tracking-widest text-forest uppercase">
              {post.category}
            </span>
            <h1 className="mt-5 font-display text-4xl leading-tight font-medium text-forest lg:text-5xl">
              {post.title}
            </h1>
            <div className="mt-5 flex items-center gap-3 text-sm text-forest-muted">
              <span>{formatDateTR(post.date)}</span>
              <span className="h-1 w-1 rounded-full bg-sage" aria-hidden="true" />
              <span>{post.readTime} okuma</span>
              <span className="h-1 w-1 rounded-full bg-sage" aria-hidden="true" />
              <span>{post.author}</span>
            </div>
          </header>

          <div
            className="article-prose mt-10"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <div className="mt-14 rounded-2xl bg-forest p-8 text-center text-cream">
            <p className="font-display text-2xl font-medium">
              Desteğe ihtiyaç duyduğunuzda buradayız.
            </p>
            <p className="mt-2 text-sm text-sage-light">
              Online veya yüz yüze görüşme için bizimle iletişime geçebilirsiniz.
            </p>
            <Link
              href="/#randevu"
              className="mt-6 inline-block rounded-full bg-cream px-7 py-3 text-sm font-semibold text-forest transition-all hover:bg-warm-white"
            >
              Online Randevu
            </Link>
          </div>

          <div className="mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-forest-muted transition-colors hover:text-forest"
            >
              <svg
                className="h-4 w-4 rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              Tüm Yazılar
            </Link>
          </div>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
