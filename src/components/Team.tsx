import ScrollReveal from "./ScrollReveal";
import { site } from "@/lib/site";

export default function Team() {
  return (
    <section id="biz-kimiz" className="bg-warm-white py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Uzman <span className="italic">kadromuz</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <div aria-hidden="true" className="mx-auto mt-6 h-px w-12 bg-sage/40" />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-6 font-body text-lg leading-relaxed text-forest-muted">
              Alanında deneyimli uzmanlarımızla yanınızdayız.
            </p>
          </ScrollReveal>
        </div>

        {/* Team cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {site.experts.map((expert, idx) => (
            <ScrollReveal key={expert.slug} delay={idx + 2}>
              <div className="rounded-2xl border border-sage/15 bg-warm-white p-8 transition-colors duration-300 hover:border-sage/30 lg:p-10">
                {/*
                  FOTOĞRAF: gerçek portre görseli henüz yok; aşağıdaki SVG geçici
                  yer tutucudur. Görsel hazır olduğunda (public yolu
                  site.experts[].image, ör. "/uzmanlar/melek-yildiz.jpg") bu SVG
                  bloğunu next/image ile değiştirin. Örnek:

                    import Image from "next/image";

                    <Image
                      src={expert.image}
                      alt={expert.name + " portresi"}
                      width={112}
                      height={112}
                      className="mx-auto mb-6 h-28 w-28 rounded-2xl object-cover"
                    />
                */}
                {/* Foto placeholder (dekoratif — aria-hidden) */}
                <div
                  aria-hidden="true"
                  className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-2xl bg-sage/10"
                >
                  <svg
                    className="h-12 w-12 text-sage"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-display text-2xl font-light text-forest">
                    {expert.name}
                  </h3>
                  <p className="mt-2 font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                    {expert.title}
                  </p>
                  <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
                    {expert.bio}
                  </p>

                  {/* E-E-A-T kimlik sinyalleri (uzmanlık/güven) */}
                  <dl className="mt-7 space-y-3 text-left font-body text-sm text-forest-muted">
                    {expert.credentialsLine && (
                      <div>
                        <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                          Künye
                        </dt>
                        <dd className="mt-1 text-forest-muted">
                          {expert.credentialsLine}
                        </dd>
                      </div>
                    )}
                    {expert.degrees.length > 0 && (
                      <div>
                        <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                          Eğitim
                        </dt>
                        <dd className="mt-1 text-forest-muted">
                          {expert.degrees.join(" · ")}
                          {expert.university ? `, ${expert.university}` : ""}
                        </dd>
                      </div>
                    )}
                    {expert.certifications.length > 0 && (
                      <div>
                        <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                          Sertifikalar
                        </dt>
                        <dd className="mt-1 text-forest-muted">
                          {expert.certifications.join(" · ")}
                        </dd>
                      </div>
                    )}
                    {expert.membership && (
                      <div>
                        <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                          Üyelik
                        </dt>
                        <dd className="mt-1 text-forest-muted">
                          {expert.membership}
                        </dd>
                      </div>
                    )}
                  </dl>

                  {/* Areas */}
                  <div className="mt-7 flex flex-wrap justify-center gap-2">
                    {expert.areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-sage/20 px-3 py-1 font-body text-xs text-forest-muted"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
