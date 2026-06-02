import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { getAllPosts, formatDateTR } from "@/lib/blog";

export default function Articles() {
  const articles = getAllPosts().slice(0, 3);

  if (articles.length === 0) return null;

  return (
    <section id="yazilar" className="relative bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div>
            <ScrollReveal>
              <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
                Yazılar
              </span>
            </ScrollReveal>
            <ScrollReveal delay={1}>
              <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
                Güncel <span className="font-medium italic">Yazılarımız</span>
              </h2>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={2}>
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-forest/20 px-6 py-3 text-sm font-semibold text-forest transition-all hover:border-forest hover:bg-forest hover:text-cream"
            >
              Tüm Yazılar
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </ScrollReveal>
        </div>

        {/* Articles grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, idx) => (
            <ScrollReveal key={article.slug} delay={idx + 1}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-warm-white transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-sage/10"
              >
                {/* Image placeholder */}
                <div className="relative h-48 overflow-hidden bg-sage/10">
                  <div className="flex h-full items-center justify-center">
                    <svg
                      className="h-12 w-12 text-sage/30 transition-transform duration-500 group-hover:scale-110"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  </div>
                  {/* Category badge */}
                  <span className="absolute left-4 top-4 rounded-full bg-forest/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
                    {article.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3 text-xs text-forest/50">
                    <span>{formatDateTR(article.date)}</span>
                    <span className="h-1 w-1 rounded-full bg-sage" />
                    <span>{article.readTime} okuma</span>
                  </div>

                  <h3 className="font-display text-xl font-semibold leading-snug text-forest transition-colors group-hover:text-forest-light">
                    {article.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-relaxed text-forest/60">
                    {article.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-sage-dark transition-colors group-hover:text-forest">
                    Devamını Oku
                    <svg
                      className="h-3 w-3 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
