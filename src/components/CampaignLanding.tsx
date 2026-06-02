import AppointmentForm from "@/components/AppointmentForm";
import CtaLink from "@/components/CtaLink";

export type CampaignLandingProps = {
  eyebrow: string;
  title: string;
  lead: string;
  summary: string;
  services: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const processSteps = [
  {
    title: "Tanışma",
    text: "İhtiyaçlarınızı ve beklentinizi güvenli bir ilk görüşmede anlamaya başlarız.",
  },
  {
    title: "Planlama",
    text: "Size uygun görüşme biçimi, uzman ve süreç hedefleri birlikte netleştirilir.",
  },
  {
    title: "Süreç",
    text: "Düzenli görüşmelerle ilerleme takip edilir ve destek alanı korunur.",
  },
];

export default function CampaignLanding({
  eyebrow,
  title,
  lead,
  summary,
  services,
  faqs,
}: CampaignLandingProps) {
  return (
    <main className="bg-cream text-forest">
      <section className="relative overflow-hidden px-6 py-24 lg:py-32">
        <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-bl-full bg-sage/10" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="inline-flex rounded-full border border-sage/30 bg-warm-white/70 px-4 py-2 text-xs font-semibold tracking-widest text-forest/70 uppercase">
              {eyebrow}
            </span>
            <h1 className="mt-7 font-display text-5xl leading-tight font-light tracking-tight text-forest lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-forest/70">
              {lead}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <CtaLink href="#randevu" label="Randevu Talebi Oluştur" source="landing_hero" />
              <CtaLink href="#surec" label="Süreci İncele" variant="secondary" source="landing_hero_secondary" />
            </div>
            <p className="mt-6 text-sm text-forest/55">
              Gizlilik, etik ilkeler ve bireye özel planlama temel alınır.
            </p>
          </div>

          <div className="rounded-[2rem] border border-sage/15 bg-warm-white p-8 shadow-xl shadow-sage/10">
            <div className="rounded-[1.5rem] bg-cream-light p-8">
              <p className="font-display text-3xl font-medium text-forest">Öz & Saye Psikoloji</p>
              <p className="mt-4 leading-relaxed text-forest/65">{summary}</p>
              <div className="mt-8 grid gap-3">
                {services.map((item) => (
                  <div key={item} className="rounded-xl border border-sage/15 bg-warm-white px-4 py-3 text-sm text-forest/70">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="surec" className="bg-warm-white px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="rounded-full bg-sage/15 px-4 py-2 text-xs font-semibold tracking-widest uppercase">Süreç</span>
            <h2 className="mt-5 font-display text-4xl font-light text-forest lg:text-5xl">Nasıl ilerliyoruz?</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-sage/10 bg-cream/70 p-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage/20 text-sm font-bold text-forest">
                  {index + 1}
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold text-forest">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-forest/65">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="rounded-full bg-sage/15 px-4 py-2 text-xs font-semibold tracking-widest uppercase">SSS</span>
            <h2 className="mt-5 font-display text-4xl font-light text-forest">Sık sorulan sorular</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="rounded-2xl border border-sage/15 bg-warm-white p-5">
                <summary className="cursor-pointer font-semibold text-forest">{faq.question}</summary>
                <p className="mt-3 text-sm leading-relaxed text-forest/65">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <AppointmentForm />
    </main>
  );
}
