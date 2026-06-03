import Link from "next/link";
import { services } from "@/lib/services";
import { ServiceIcon } from "@/components/ServiceIcon";
import ScrollReveal from "./ScrollReveal";

export default function Services() {
  return (
    <section id="calisma-alanlari" className="bg-warm-white py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
              Çalışma Alanlarımız
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Hangi konularda{" "}
              <span className="italic">destek sunuyoruz?</span>
            </h2>
            <span aria-hidden="true" className="reveal-line mx-auto mt-6 block h-px w-12 bg-sage/40" />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
              Uzman kadromuzla çeşitli psikolojik konularda profesyonel destek
              sağlıyoruz.
            </p>
          </ScrollReveal>
        </div>

        {/* Services grid */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, idx) => (
            <ScrollReveal key={s.slug} delay={Math.min(idx + 1, 5)}>
              <Link
                href={`/hizmetler/${s.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(31,59,46,0.15)] motion-reduce:transition-none lg:p-10"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/10">
                  <ServiceIcon name={s.iconKey} className="h-6 w-6 text-sage" />
                </span>
                <h3 className="mt-6 font-display text-xl font-medium text-forest">
                  {s.title}
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-forest-muted">
                  {s.shortDesc}
                </p>
                <span className="mt-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-forest">
                  Detaylar
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                  >
                    →
                  </span>
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
