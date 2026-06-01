import type { Metadata } from "next";
import Link from "next/link";

import { getAllPosts, formatPostDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Yazılar",
  description:
    "Özsaye Psikoloji ekibinden terapi süreci, kaygı, ilişkiler ve ruh sağlığı üzerine sade, güvenilir ve yanıt biçimli yazılar.",
  alternates: { canonical: "/yazilar" },
};

export default async function YazilarPage() {
  const posts = await getAllPosts();

  return (
    <main id="icerik" className="bg-warm-white">
      <section className="mx-auto max-w-6xl px-6 py-28 lg:px-8 lg:py-36">
        {/* Başlık */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
            Yazılar
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            Düşünmeye değer <span className="italic">notlar</span>
          </h1>
          <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
            Terapi süreci, kaygı, ilişkiler ve ruh sağlığı üzerine sade ve
            güvenilir yazılar.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="mt-16 text-center font-body text-base text-forest-muted">
            Yakında yeni yazılar burada olacak.
          </p>
        ) : (
          <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/yazilar/${post.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(43,82,51,0.15)] motion-reduce:transition-none lg:p-10"
              >
                <span className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
                  {post.category}
                </span>
                <h2 className="mt-4 font-display text-2xl leading-snug font-medium text-forest">
                  {post.title}
                </h2>
                <p className="mt-3 flex-1 font-body text-base leading-relaxed text-forest-muted">
                  {post.excerpt}
                </p>
                <span className="mt-6 flex items-center gap-2 font-body text-sm text-forest-muted">
                  <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} dk okuma</span>
                </span>
                <span className="mt-4 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-forest">
                  Devamını oku
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    &rarr;
                  </span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
