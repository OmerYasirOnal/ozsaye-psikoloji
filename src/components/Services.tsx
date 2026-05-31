import ScrollReveal from "./ScrollReveal";

const services = [
  {
    title: "Bireysel Psikoterapi",
    description:
      "Kişisel zorluklar, duygusal sorunlar ve yaşam geçişlerinde birebir terapi desteği.",
    icon: (
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    ),
  },
  {
    title: "Çift Terapisi",
    description:
      "İlişkilerdeki iletişim sorunları, çatışmalar ve bağlanma problemlerine yönelik terapi.",
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: "Aile Danışmanlığı",
    description:
      "Aile içi dinamikler, ebeveyn-çocuk ilişkisi ve aile içi iletişim sorunlarında destek.",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    title: "Çocuk & Ergen Terapisi",
    description:
      "Çocuk ve ergenlerin gelişimsel, duygusal ve davranışsal sorunlarına özel yaklaşım.",
    icon: (
      <>
        <path d="M12 2a5 5 0 0 1 5 5c0 2-1.5 3.5-3 4.5V14h-4v-2.5C8.5 10.5 7 9 7 7a5 5 0 0 1 5-5z" />
        <path d="M10 14v4a2 2 0 1 0 4 0v-4" />
      </>
    ),
  },
  {
    title: "Depresyon & Anksiyete",
    description:
      "Depresyon, kaygı bozuklukları ve panik atak tedavisinde uzman terapi desteği.",
    icon: (
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    ),
  },
  {
    title: "Travma Terapisi",
    description:
      "Travmatik yaşantılar, kayıp ve yas süreçlerinde iyileşmeye yönelik terapi.",
    icon: (
      <>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </>
    ),
  },
  {
    title: "Stres Yönetimi",
    description:
      "İş ve günlük yaşam stresinin yönetimi, tükenmişlik sendromu ve başa çıkma becerileri.",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  {
    title: "Kişisel Gelişim",
    description:
      "Öz farkındalık, kendini tanıma, özgüven geliştirme ve yaşam hedeflerine ulaşma.",
    icon: (
      <>
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
      </>
    ),
  },
];

export default function Services() {
  return (
    <section
      id="calisma-alanlari"
      className="relative bg-warm-white py-24 lg:py-32"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="absolute -left-16 top-1/4 h-64 w-64 text-sage/5"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <circle cx="100" cy="100" r="100" />
        </svg>
        <svg
          className="absolute -right-16 bottom-1/4 h-48 w-48 text-sage/5"
          viewBox="0 0 200 200"
          fill="currentColor"
        >
          <circle cx="100" cy="100" r="100" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
              Çalışma Alanlarımız
            </span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Hangi Konularda{" "}
              <span className="font-medium italic">Destek Sunuyoruz?</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-4 text-base text-forest/60">
              Uzman kadromuzla çeşitli psikolojik konularda profesyonel destek
              sağlıyoruz.
            </p>
          </ScrollReveal>
        </div>

        {/* Services grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, idx) => (
            <ScrollReveal key={service.title} delay={Math.min(idx + 1, 5)}>
              <div className="group relative h-full overflow-hidden rounded-xl border border-sage/10 bg-cream/50 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-sage/30 hover:bg-cream hover:shadow-lg hover:shadow-sage/10">
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-sage/10 transition-colors duration-300 group-hover:bg-forest group-hover:text-cream">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {service.icon}
                  </svg>
                </div>

                {/* Content */}
                <h3 className="font-display text-lg font-semibold text-forest">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/60">
                  {service.description}
                </p>

                {/* Hover arrow */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-sage-dark opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <span>Detay</span>
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
