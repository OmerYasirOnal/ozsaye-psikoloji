import ScrollReveal from "./ScrollReveal";

export default function About() {
  return (
    <section id="hakkimizda" className="relative bg-warm-white py-24 lg:py-32">
      {/* Decorative element */}
      <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-sage/5" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Image side */}
          <ScrollReveal>
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-sage/10">
                <div className="flex h-full items-center justify-center">
                  <svg
                    className="h-32 w-32 text-sage/30"
                    viewBox="0 0 100 140"
                    fill="currentColor"
                  >
                    <path d="M50 0 C20 30 5 70 15 110 C25 130 40 140 50 140 C60 140 75 130 85 110 C95 70 80 30 50 0Z" />
                    <path
                      d="M50 20 L50 120"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.5"
                    />
                    <path
                      d="M50 50 L35 35 M50 70 L65 55 M50 90 L35 75"
                      stroke="white"
                      strokeWidth="1.5"
                      fill="none"
                      opacity="0.3"
                    />
                  </svg>
                </div>
              </div>
              {/* Floating accent card */}
              <div className="absolute -bottom-6 -right-6 rounded-xl bg-forest p-6 text-cream shadow-xl">
                <p className="font-display text-3xl font-bold">10+</p>
                <p className="mt-1 text-xs font-light tracking-wider text-cream/70 uppercase">
                  Yıllık Deneyim
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Text side */}
          <div>
            <ScrollReveal delay={1}>
              <span className="inline-block rounded-full bg-sage/15 px-4 py-1.5 text-xs font-semibold tracking-widest text-forest uppercase">
                Hakkımızda
              </span>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
                İç Dünyanızda Size
                <br />
                <span className="font-medium italic">Eşlik Ediyoruz</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <p className="mt-6 text-base leading-relaxed text-forest/70">
                Özsaye Psikoloji olarak, bireylerin kendilerini güvende
                hissettikleri bir ortamda iç dünyalarını keşfetmelerine yardımcı
                oluyoruz. Her bireyin benzersiz hikayesine saygı duyarak,
                bilimsel temelli ve etik değerlere bağlı bir yaklaşımla
                çalışıyoruz.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={4}>
              <p className="mt-4 text-base leading-relaxed text-forest/70">
                Amacımız, danışanlarımızın kendi potansiyellerini keşfetmeleri,
                yaşam kalitelerini artırmaları ve duygusal iyilik hallerine
                ulaşmaları için profesyonel destek sunmaktır.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={5}>
              <div className="mt-10 grid grid-cols-2 gap-6">
                {[
                  { title: "Bilimsel Yaklaşım", desc: "Kanıta dayalı terapi yöntemleri" },
                  { title: "Gizlilik", desc: "Tam gizlilik ve güvenli ortam" },
                  { title: "Bireysel Odak", desc: "Size özel terapi planı" },
                  { title: "Etik Değerler", desc: "Mesleki etik ilkelere bağlılık" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sage" />
                    <div>
                      <p className="text-sm font-semibold text-forest">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-forest/50">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
