import type { Metadata } from "next";
import Link from "next/link";

import { isReady, site } from "@/lib/site";

/** Adın ilk en fazla 2 kelimesinin baş harflerinden büyük harfli monogram üretir. */
function monogram(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export const metadata: Metadata = {
  title: "Ekibimiz",
  description: site.description,
  alternates: {
    canonical: "/ekip",
  },
  // robots ayarlanmaz: kök layout dataReady durumuna göre noindex/index
  // yönetir ve bu sayfaya miras kalır.
};

export default function EkipPage() {
  return (
    <main id="icerik" className="bg-warm-white py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Sayfa başlığı */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
            Ekibimiz
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
            Sizi dinlemeye hazır <span className="italic">uzmanlarımız</span>
          </h1>
          <div
            aria-hidden="true"
            className="mx-auto mt-6 h-px w-12 bg-sage/40"
          />
          <p className="mt-6 font-body text-lg leading-relaxed text-forest-muted">
            Alanında deneyimli uzmanlarımızla yanınızdayız. Birlikte
            çalışacağınız kişiyi yakından tanımak için profilini inceleyin.
          </p>
        </div>

        {/* Ekip kartları */}
        <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
          {site.experts.map((expert) => (
            <Link
              key={expert.slug}
              href={`/ekip/${expert.slug}`}
              className="group flex flex-col rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(43,82,51,0.15)] lg:p-10"
            >
              {/*
                FOTOĞRAF: gerçek portre görseli henüz yok; aşağıdaki monogram
                geçici yer tutucudur. Görsel hazır olduğunda (public yolu
                site.experts[].image, ör. "/uzmanlar/melek-yildiz.jpg") bu
                bloğu next/image ile değiştirin.
              */}
              <div
                aria-hidden="true"
                className="mb-7 flex h-24 w-24 items-center justify-center rounded-2xl bg-sage/10"
              >
                <span className="font-display text-3xl font-light text-sage">
                  {monogram(expert.name)}
                </span>
              </div>

              <h2 className="font-display text-2xl font-light text-forest">
                {expert.name}
              </h2>
              <p className="mt-2 font-body text-base leading-relaxed text-forest-muted">
                {expert.title}
              </p>
              {isReady(expert.bio) && (
                <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
                  {expert.bio}
                </p>
              )}

              <span className="mt-7 inline-flex items-center gap-1.5 font-body text-sm font-medium text-forest">
                Profili görüntüle
                <span
                  aria-hidden="true"
                  className="transition-transform duration-300 motion-reduce:transition-none group-hover:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>

        {/* Anasayfaya dönüş */}
        <div className="mx-auto mt-16 max-w-4xl border-t border-sage/15 pt-10 text-center">
          <Link
            href="/"
            className="font-body text-sm text-forest underline decoration-sage/50 underline-offset-[5px] transition-colors hover:decoration-forest"
          >
            Anasayfaya dön
          </Link>
        </div>
      </div>
    </main>
  );
}
