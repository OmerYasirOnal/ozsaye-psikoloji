import Link from "next/link";

import ScrollReveal from "./ScrollReveal";
import { site, isReady } from "@/lib/site";

/**
 * Uzman adının kelimelerinin baş harflerinden (en fazla 2) büyük harf monogram
 * üretir. Ör. "Melek Yıldız" -> "MY", "Sacide Şahin" -> "SŞ".
 */
function monogram(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase("tr"))
    .join("");
}

export default function Team() {
  return (
    <section id="biz-kimiz" className="bg-warm-white py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <h2 className="font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Uzman <span className="italic">kadromuz</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <div aria-hidden="true" className="reveal-line mx-auto mt-6 h-px w-12 bg-sage/40" />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-6 font-body text-lg leading-relaxed text-forest-muted">
              Alanında deneyimli uzmanlarımızla yanınızdayız.
            </p>
          </ScrollReveal>
        </div>

        {/* Team cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:gap-10">
          {site.experts.map((expert, idx) => (
            <ScrollReveal key={expert.slug} delay={idx + 2}>
              <div className="group rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(31,59,46,0.15)] motion-reduce:transition-none lg:p-10">
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
                {/* Foto placeholder (dekoratif — aria-hidden): uzman monogramı */}
                <div
                  aria-hidden="true"
                  className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-2xl bg-sage/10"
                >
                  <span className="font-display text-3xl font-light text-sage">
                    {monogram(expert.name)}
                  </span>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-display text-2xl font-light text-forest">
                    {expert.name}
                  </h3>
                  <p className="mt-2 font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                    {expert.title}
                  </p>
                  {isReady(expert.bio) && (
                    <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
                      {expert.bio}
                    </p>
                  )}

                  {/* E-E-A-T kimlik sinyalleri (uzmanlık/güven) — yalnızca gerçek veri */}
                  {(() => {
                    const readyDegrees = expert.degrees.filter(isReady);
                    const readyCertifications =
                      expert.certifications.filter(isReady);
                    const hasCredentials =
                      isReady(expert.credentialsLine) ||
                      readyDegrees.length > 0 ||
                      readyCertifications.length > 0 ||
                      isReady(expert.membership);

                    if (!hasCredentials) return null;

                    return (
                      <dl className="mt-7 space-y-3 text-left font-body text-sm text-forest-muted">
                        {isReady(expert.credentialsLine) && (
                          <div>
                            <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                              Künye
                            </dt>
                            <dd className="mt-1 text-forest-muted">
                              {expert.credentialsLine}
                            </dd>
                          </div>
                        )}
                        {readyDegrees.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                              Eğitim
                            </dt>
                            <dd className="mt-1 text-forest-muted">
                              {readyDegrees.join(" · ")}
                              {isReady(expert.university)
                                ? `, ${expert.university}`
                                : ""}
                            </dd>
                          </div>
                        )}
                        {readyCertifications.length > 0 && (
                          <div>
                            <dt className="text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                              Sertifikalar
                            </dt>
                            <dd className="mt-1 text-forest-muted">
                              {readyCertifications.join(" · ")}
                            </dd>
                          </div>
                        )}
                        {isReady(expert.membership) && (
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
                    );
                  })()}

                  {/* Areas — yalnızca gerçek (placeholder olmayan) alanlar */}
                  {(() => {
                    const readyAreas = expert.areas.filter(isReady);
                    if (readyAreas.length === 0) return null;

                    return (
                      <div className="mt-7 flex flex-wrap justify-center gap-2">
                        {readyAreas.map((area) => (
                          <span
                            key={area}
                            className="rounded-full border border-sage/20 px-3 py-1 font-body text-xs text-forest-muted"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Profil bağlantısı */}
                  <Link
                    href={`/ekip/${expert.slug}`}
                    className="mt-8 inline-flex items-center gap-1.5 font-body text-sm font-medium text-forest underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest motion-reduce:transition-none"
                  >
                    {expert.name} profilini görüntüle
                    <span
                      aria-hidden="true"
                      className="no-underline transition-transform duration-300 group-hover:translate-x-0.5 motion-reduce:transition-none"
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
