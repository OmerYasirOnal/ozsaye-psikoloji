import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ServiceIcon } from "@/components/ServiceIcon";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Çalışma Alanlarımız",
  description:
    "Özsaye Psikoloji çalışma alanları: bireysel psikoterapi, çift terapisi, aile danışmanlığı, çocuk ve ergen terapisi ve daha fazlasında profesyonel destek.",
  alternates: {
    canonical: "/hizmetler",
  },
};

export default function HizmetlerPage() {
  return (
    <>
      <Header />
      <main id="icerik" className="bg-cream">
        <section className="py-28 lg:py-36">
          <div className="mx-auto max-w-6xl px-6 lg:px-8">
            {/* Sayfa başlığı */}
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
                Çalışma Alanlarımız
              </p>
              <h1 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
                Hangi konularda{" "}
                <span className="italic">yanınızdayız?</span>
              </h1>
              <div
                aria-hidden="true"
                className="mx-auto mt-8 h-px w-12 bg-sage/40"
              />
              <p className="mt-8 font-body text-base leading-relaxed text-forest-muted lg:text-lg">
                Bireysel, ilişkisel ve ailevi pek çok konuda güvenli ve yargısız
                bir alanda destek sunuyoruz. Aşağıdaki çalışma alanlarından
                birine göz atarak sürecin sizin için nasıl ilerleyebileceğini
                keşfedebilirsiniz.
              </p>
            </div>

            {/* Hizmet kartları */}
            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/hizmetler/${service.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(43,82,51,0.15)] motion-reduce:transition-none lg:p-10"
                >
                  <ServiceIcon name={service.iconKey} className="h-7 w-7 text-sage" />
                  <h2 className="mt-6 font-display text-xl font-medium text-forest">
                    {service.title}
                  </h2>
                  <p className="mt-3 font-body text-base leading-relaxed text-forest-muted">
                    {service.shortDesc}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-forest">
                    Detaylar
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
