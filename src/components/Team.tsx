import ScrollReveal from "./ScrollReveal";

const teamMembers = [
  {
    name: "Melek Yıldız",
    title: "Psikolojik Danışman",
    bio: "Bireylerin yaşamlarında karşılaştıkları zorlukları aşmalarına, kişisel gelişimlerini desteklemelerine ve sağlıklı ilişkiler kurmalarına yardımcı olmaktadır. Empatik ve destekleyici yaklaşımıyla danışanlarına güvenli bir alan sunmaktadır.",
    areas: ["Bireysel Danışmanlık", "İlişki Sorunları", "Stres Yönetimi"],
  },
  {
    name: "Sacide Şahin",
    title: "Klinik Psikolog",
    bio: "Klinik psikoloji alanındaki uzmanlığıyla, ruhsal sağlık sorunlarının değerlendirilmesi ve tedavisinde bilimsel temelli yaklaşımlar uygulamaktadır. Danışanlarının iyileşme sürecinde güvenilir bir yol arkadaşı olmayı hedeflemektedir.",
    areas: ["Klinik Değerlendirme", "Psikoterapi", "Travma Terapisi"],
  },
];

export default function Team() {
  return (
    <section id="biz-kimiz" className="relative bg-cream py-24 lg:py-32">
      {/* Decorative elements */}
      <div className="pointer-events-none absolute left-0 top-1/2 h-96 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-sage/20 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-1/2 h-96 w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-sage/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
              Biz Kimiz
            </span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Uzman <span className="font-medium italic">Kadromuz</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-4 text-base text-forest/60">
              Alanında deneyimli uzmanlarımızla yanınızdayız.
            </p>
          </ScrollReveal>
        </div>

        {/* Team cards */}
        <div className="mt-16 grid gap-8 md:grid-cols-2">
          {teamMembers.map((member, idx) => (
            <ScrollReveal key={member.name} delay={idx + 2}>
              <div className="group relative overflow-hidden rounded-2xl bg-warm-white p-8 shadow-sm transition-all duration-500 hover:shadow-lg hover:shadow-sage/10 lg:p-10">
                {/* Accent border */}
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-sage via-forest to-sage opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Photo placeholder */}
                <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-sage/10 ring-4 ring-sage/5">
                  <svg
                    className="h-14 w-14 text-sage/40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>

                {/* Info */}
                <div className="text-center">
                  <h3 className="font-display text-2xl font-semibold text-forest">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium tracking-wider text-sage-dark uppercase">
                    {member.title}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-forest/60">
                    {member.bio}
                  </p>

                  {/* Areas */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {member.areas.map((area) => (
                      <span
                        key={area}
                        className="rounded-full border border-sage/30 px-3 py-1 text-xs text-forest/70"
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
