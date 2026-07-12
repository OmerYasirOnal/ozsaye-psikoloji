import Cta from "./Cta";
import ExpertAvatar from "./ExpertAvatar";
import ScrollReveal from "./ScrollReveal";
import { birlesikProfil } from "@/lib/ekip";
import { getTumProfiller } from "@/lib/profil-db";
import { site } from "@/lib/site";

export default async function Team() {
  // Kimlik site.experts'ten, içerik panelden (expert_profiles). Tek sorguyla
  // tüm profiller okunur; içerik yoksa (null) tüm alanlar kamuda gizli kalır.
  const profiller = await getTumProfiller();

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
          {site.experts.map((expert, idx) => {
            const profil = birlesikProfil(
              expert,
              profiller.get(expert.slug) ?? null,
            );

            return (
              <ScrollReveal key={expert.slug} delay={idx + 2}>
                <div className="group rounded-2xl border border-sage/15 bg-warm-white p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-sage/40 hover:shadow-[0_10px_30px_-12px_rgba(31,59,46,0.15)] motion-reduce:transition-none lg:p-10">
                  <ExpertAvatar
                    name={expert.name}
                    imageUrl={profil.imageUrl}
                    size="md"
                    className="mx-auto mb-7"
                  />

                  {/* Info */}
                  <div className="text-center">
                    <h3 className="font-display text-2xl font-light text-forest">
                      {expert.name}
                    </h3>
                    <p className="mt-2 font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                      {expert.title}
                    </p>
                    {profil.credentialsLine && (
                      <p className="mt-5 font-body text-base leading-relaxed text-forest-muted">
                        {profil.credentialsLine}
                      </p>
                    )}

                    {/* Profil bağlantısı */}
                    <Cta href={`/ekip/${expert.slug}`} variant="ghost" className="mt-8">
                      {expert.name} profilini görüntüle
                    </Cta>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
