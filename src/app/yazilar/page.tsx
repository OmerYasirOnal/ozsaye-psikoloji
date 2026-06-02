import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Yazılar & Haberler | Öz & Saye Psikoloji",
  description:
    "Psikoloji, terapi ve ruh sağlığı üzerine güncel yazılar, haberler ve uzman görüşleri. Öz & Saye Psikoloji ekibinden içerikler.",
  alternates: { canonical: "/yazilar/" },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/yazilar/",
    title: "Yazılar & Haberler | Öz & Saye Psikoloji",
    description:
      "Psikoloji, terapi ve ruh sağlığı üzerine güncel yazılar, haberler ve uzman görüşleri.",
  },
};

export default function YazilarPage() {
  const posts = getAllPosts();

  return (
    <section className="relative bg-cream py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Başlık */}
        <div className="max-w-3xl">
          <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
            Yazılar &amp; Haberler
          </span>
          <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            Ruh Sağlığı Üzerine{" "}
            <span className="font-medium italic">Güncel Yazılarımız</span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-forest/60">
            Psikoloji, terapi ve günlük yaşamda iyi oluş üzerine uzman
            ekibimizin hazırladığı içerikler.
          </p>
        </div>

        {/* Yazı listesi */}
        {posts.length === 0 ? (
          <p className="mt-16 text-forest/60">Henüz yazı yayınlanmadı.</p>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-warm-white transition-all duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-sage/10"
              >
                <Link href={`/yazilar/${post.slug}/`} className="flex h-full flex-col">
                  {/* Kapak / yer tutucu */}
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
                    <span className="absolute top-4 left-4 rounded-full bg-forest/90 px-3 py-1 text-[10px] font-semibold tracking-wider text-cream uppercase">
                      {post.category}
                    </span>
                  </div>

                  {/* İçerik */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3 flex items-center gap-3 text-xs text-forest/50">
                      <span>{post.formattedDate}</span>
                      <span className="h-1 w-1 rounded-full bg-sage" />
                      <span>{post.readingTime} okuma</span>
                    </div>

                    <h2 className="font-display text-xl leading-snug font-semibold text-forest transition-colors group-hover:text-forest-light">
                      {post.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-relaxed text-forest/60">
                      {post.description}
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
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
