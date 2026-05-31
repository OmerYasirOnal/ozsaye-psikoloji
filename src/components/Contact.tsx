import ScrollReveal from "./ScrollReveal";

export default function Contact() {
  return (
    <section id="iletisim" className="relative bg-warm-white py-24 lg:py-32">
      {/* Decorative top border */}
      <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-sage/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
              İletişim
            </span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Bizimle{" "}
              <span className="font-medium italic">İletişime Geçin</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-4 text-base text-forest/60">
              Sorularınız veya randevu talepleriniz için bizimle iletişime
              geçebilirsiniz.
            </p>
          </ScrollReveal>
        </div>

        {/* Contact cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: (
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 10m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
              ),
              title: "Adres",
              lines: ["İstanbul, Türkiye"],
            },
            {
              icon: (
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              ),
              title: "Telefon",
              lines: ["+90 (5XX) XXX XX XX"],
            },
            {
              icon: (
                <>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4l-10 8L2 4" />
                </>
              ),
              title: "E-posta",
              lines: ["info@ozsayepsikoloji.com"],
            },
            {
              icon: (
                <>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </>
              ),
              title: "Çalışma Saatleri",
              lines: ["Pazartesi - Cuma", "09:00 - 19:00"],
            },
          ].map((item, idx) => (
            <ScrollReveal key={item.title} delay={idx + 1}>
              <div className="group rounded-xl border border-sage/10 bg-cream/50 p-6 text-center transition-all duration-300 hover:border-sage/30 hover:shadow-md">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage/10 transition-colors group-hover:bg-forest group-hover:text-cream">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-forest">
                  {item.title}
                </h3>
                {item.lines.map((line) => (
                  <p key={line} className="mt-1 text-sm text-forest/60">
                    {line}
                  </p>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Map placeholder */}
        <ScrollReveal delay={3}>
          <div className="mt-12 overflow-hidden rounded-2xl border border-sage/10 bg-sage/5">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-sage/40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <p className="mt-3 text-sm text-forest/40">
                  Harita burada görüntülenecek
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
