import Image from "next/image";

import ScrollReveal from "./ScrollReveal";
import { site } from "@/lib/site";

export default function About() {
  return (
    <section id="hakkimizda" className="bg-cream py-28 lg:py-40">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
          {/* Image side: gerçek görsel geldiyse portre, yoksa zarif yer tutucu. */}
          <ScrollReveal variant="fade">
            {site.aboutImageUrl ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-sage/15">
                <Image
                  src={site.aboutImageUrl}
                  alt="Öz & Saye Psikoloji danışmanlık ofisinden bir görünüm"
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border border-sage/15 bg-sage/10">
                <svg
                  aria-hidden="true"
                  className="h-16 w-16 text-sage"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22V10" />
                  <path d="M12 12c-3.3 0-6-2.7-6-6 3.3 0 6 2.7 6 6Z" />
                  <path d="M12 10.5c0-2.8 2.2-5 5-5 0 2.8-2.2 5-5 5Z" />
                </svg>
                <p className="font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                  Fotoğraflar yakında
                </p>
              </div>
            )}
          </ScrollReveal>

          {/* Text side */}
          <div>
            <ScrollReveal delay={1}>
              <p className="font-body text-xs font-medium tracking-[0.2em] text-forest-muted uppercase">
                Hakkımızda
              </p>
              <span className="reveal-line origin-left mt-4 block h-px w-12 bg-sage/40" aria-hidden="true" />
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
                İç Dünyanızda Size
                <br />
                <span className="italic">Eşlik Ediyoruz</span>
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={3}>
              <p className="mt-7 max-w-2xl font-body text-base leading-relaxed text-forest-muted lg:text-lg">
                Öz & Saye Psikoloji olarak, bireylerin kendilerini güvende
                hissettikleri bir ortamda iç dünyalarını keşfetmelerine yardımcı
                oluyoruz. Her bireyin benzersiz hikayesine saygı duyarak,
                bilimsel temelli ve etik değerlere bağlı bir yaklaşımla
                çalışıyoruz.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={4}>
              <p className="mt-4 max-w-2xl font-body text-base leading-relaxed text-forest-muted lg:text-lg">
                Amacımız, danışanlarımızın kendi potansiyellerini keşfetmeleri,
                yaşam kalitelerini artırmaları ve duygusal iyilik hallerine
                ulaşmaları için profesyonel destek sunmaktır.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={5}>
              <div className="mt-12 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {[
                  { title: "Bilimsel Yaklaşım", desc: "Kanıta dayalı terapi yöntemleri" },
                  { title: "Gizlilik", desc: "Tam gizlilik ve güvenli ortam" },
                  { title: "Bireysel Odak", desc: "Size özel terapi planı" },
                  { title: "Etik Değerler", desc: "Mesleki etik ilkelere bağlılık" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sage"
                    />
                    <div>
                      <p className="font-body text-sm font-semibold text-forest">
                        {item.title}
                      </p>
                      <p className="mt-1 font-body text-sm leading-relaxed text-forest-muted">
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
