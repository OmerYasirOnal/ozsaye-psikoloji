import ScrollReveal from "./ScrollReveal";
import { site, isReady } from "@/lib/site";

const steps = [
  {
    title: "Başvuru & Randevu Talebi",
    description:
      "Randevu formunu doldurup ya da telefonla bize ulaşarak süreci başlatırsınız. Talebinizi aldıktan sonra en kısa sürede size geri dönüş yaparız.",
  },
  {
    title: "Ön Görüşme & Eşleştirme",
    description:
      "Kısa bir ön görüşmede ihtiyacınızı ve beklentilerinizi anlarız; sizi en uygun uzmanla ve terapi yaklaşımıyla eşleştiririz.",
  },
  {
    title: "Terapi Süreci",
    description:
      "Düzenli seanslarla, size özel hazırlanan bir plan doğrultusunda ilerleriz. Tempo ve hedefler tamamen sizinle birlikte belirlenir.",
  },
  {
    title: "Değerlendirme & Takip",
    description:
      "Belirli aralıklarla ilerlemenizi birlikte gözden geçirir, gerektiğinde planı güncelleriz. Süreç sonrası takip desteği de sunarız.",
  },
];

export default function ProcessSection() {
  // Ücret alanları placeholder ("[DOLDUR]") iken ham metin sızmasın diye
  // ücret bloğunu tümüyle gizle. Gerçek veri girilince otomatik görünür.
  const pricingReady =
    isReady(site.pricing.sessionFee) &&
    isReady(site.pricing.duration) &&
    isReady(site.pricing.note);

  return (
    <section id="surec" className="bg-cream py-28 lg:py-36">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        {/* Bölüm başlığı */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
              Süreç
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Süreç nasıl <span className="italic">işliyor?</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <span
              aria-hidden="true"
              className="mx-auto mt-6 block h-px w-12 bg-sage/40"
            />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-6 font-body text-base leading-relaxed text-forest-muted lg:text-lg">
              İlk adımdan iyileşmeye uzanan yolda, her aşamada yanınızdayız.
              Süreç şeffaf ve öngörülebilirdir.
            </p>
          </ScrollReveal>
        </div>

        {/* Adımlar */}
        <ol className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => (
            <ScrollReveal key={step.title} delay={Math.min(idx + 1, 5)}>
              <li className="h-full rounded-2xl border border-sage/15 bg-warm-white p-8 transition-colors duration-300 hover:border-sage/30 lg:p-10">
                <span className="font-display text-5xl font-light leading-none text-forest">
                  {idx + 1}
                </span>
                <h3 className="mt-6 font-display text-xl font-light text-forest">
                  {step.title}
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-forest-muted">
                  {step.description}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ol>

        {/* Ücret & Şeffaflık */}
        {pricingReady && (
        <ScrollReveal delay={2}>
          <div className="mt-20 rounded-2xl border border-sage/15 bg-forest p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="max-w-xl">
                <p className="font-body text-xs font-medium tracking-[0.2em] text-sage-light uppercase">
                  Ücret &amp; Şeffaflık
                </p>
                <h3 className="mt-5 font-display text-3xl leading-tight font-light text-cream lg:text-4xl">
                  Net ve <span className="italic">şeffaf</span> ücretlendirme
                </h3>
                <p className="mt-4 font-body text-base leading-relaxed text-sage-light">
                  {site.pricing.note}
                </p>
              </div>

              {/* Ücret bilgileri */}
              <dl className="grid grid-cols-2 gap-5 lg:gap-8">
                <div className="rounded-2xl border border-sage/20 bg-cream/10 px-6 py-6 text-center">
                  <dt className="font-body text-xs tracking-[0.15em] text-sage-light uppercase">
                    Seans Ücreti
                  </dt>
                  <dd className="mt-3 font-display text-2xl font-light text-cream">
                    {site.pricing.sessionFee}
                  </dd>
                </div>
                <div className="rounded-2xl border border-sage/20 bg-cream/10 px-6 py-6 text-center">
                  <dt className="font-body text-xs tracking-[0.15em] text-sage-light uppercase">
                    Seans Süresi
                  </dt>
                  <dd className="mt-3 font-display text-2xl font-light text-cream">
                    {site.pricing.duration}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </ScrollReveal>
        )}
      </div>
    </section>
  );
}
