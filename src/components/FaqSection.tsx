import ScrollReveal from "./ScrollReveal";
import { jsonLdSerialize } from "@/lib/json-ld";
import { site, isReady } from "@/lib/site";

/**
 * Sıkça Sorulan Sorular bölümü.
 *
 * Tasarım: marka diline birebir uyar (warm-white zemin, forest metin, sage
 * ayraçlar/aksanlar, font-display sorular). Native <details>/<summary> ile
 * erişilebilir, klavyeyle çalışan akordeon; <summary> ok ikonu
 * prefers-reduced-motion dostu (geçiş yalnızca devinim izni varsa uygulanır,
 * group-open ile döndürülür). Dekoratif SVG'ler aria-hidden.
 *
 * Yanıtlar "yanıt biçimli" ve net yazıldı; AI/yanıt motorlarının doğrudan
 * alıntılaması kolay olsun diye her cevap kendi başına tam bir bilgi taşır.
 *
 * FAQPage JSON-LD yayınlanır: içerik gerçek ve doğrudur, NAP/kimlik gibi
 * doğrulanması gereken veriye dayanmaz; bu nedenle site.dataReady'den
 * bağımsızdır. Tek istisna, seans ücretine atıf yapan SSS maddesidir:
 * site.pricing.sessionFee placeholder ([DOLDUR]) iken o soru-cevap hem
 * görünümden hem de JSON-LD mainEntity dizisinden çıkarılır (sahte ücret
 * beyanının yapısal veriye sızmaması için).
 */

export interface Faq {
  question: string;
  /** İnsan okuru için JSX cevap (vurgu, satır vb. içerebilir). */
  answer: React.ReactNode;
  /** JSON-LD acceptedAnswer.text için düz metin (alıntılanabilir, tek paragraf). */
  answerText: string;
}

/**
 * Seans ücreti bilgisi gerçek mi? Placeholder ([DOLDUR]) iken ücrete atıf yapan
 * SSS maddesi hem görünümden hem de FAQPage JSON-LD'sinden çıkarılır.
 */
const pricingReady = isReady(site.pricing.sessionFee);
// Seans süresi placeholder iken genel/standart bir ifadeye düşülür (sızıntı önlenir).
const seansSuresi = isReady(site.pricing.duration)
  ? site.pricing.duration
  : "yaklaşık 45-50 dakika";

export const faqs: Faq[] = [
  {
    question: "Terapi nedir ve kimler için uygundur?",
    answer: (
      <>
        Terapi, alanında eğitimli bir ruh sağlığı uzmanıyla, güvenli ve gizli
        bir ortamda yürütülen yapılandırılmış bir görüşme sürecidir. Amacı;
        duyguları, düşünceleri ve davranış örüntülerini anlamak, zorlayıcı yaşam
        olaylarıyla baş etmek ve kişisel iyilik halini güçlendirmektir. Terapi
        yalnızca bir tanı ya da kriz durumunda olanlar için değildir; kaygı,
        stres, ilişki sorunları, yas, yaşam geçişleri yaşayan ya da kendini daha
        iyi tanımak isteyen herkes için uygundur.
      </>
    ),
    answerText:
      "Terapi, alanında eğitimli bir ruh sağlığı uzmanıyla güvenli ve gizli bir ortamda yürütülen yapılandırılmış bir görüşme sürecidir. Amacı; duyguları, düşünceleri ve davranış örüntülerini anlamak, zorlayıcı yaşam olaylarıyla baş etmek ve kişisel iyilik halini güçlendirmektir. Terapi yalnızca tanı ya da kriz durumunda olanlar için değildir; kaygı, stres, ilişki sorunları, yas, yaşam geçişleri yaşayan ya da kendini daha iyi tanımak isteyen herkes için uygundur.",
  },
  {
    question: "İlk seans nasıl geçer?",
    answer: (
      <>
        İlk seans bir tanışma ve değerlendirme görüşmesidir. Uzmanınız sizi
        rahatlatacak bir ortamda, başvuru nedeninizi, geçmişinizi ve
        beklentilerinizi anlamak için sorular sorar. Bu seansta hemen çözüm
        sunulması beklenmez; öncelik, sizinle birlikte sürecin haritasını
        çıkarmak ve hedefleri belirlemektir. Görüşmenin sonunda çalışma
        sıklığına ve yaklaşıma dair bir plan konuşulur. İlk seansa kendinizle
        ilgili paylaşmak istediklerinizin dışında özel bir hazırlık yapmanız
        gerekmez.
      </>
    ),
    answerText:
      "İlk seans bir tanışma ve değerlendirme görüşmesidir. Uzmanınız sizi rahatlatacak bir ortamda başvuru nedeninizi, geçmişinizi ve beklentilerinizi anlamak için sorular sorar. Bu seansta hemen çözüm sunulması beklenmez; öncelik, sizinle birlikte sürecin haritasını çıkarmak ve hedefleri belirlemektir. Görüşmenin sonunda çalışma sıklığına ve yaklaşıma dair bir plan konuşulur. İlk seansa kendinizle ilgili paylaşmak istedikleriniz dışında özel bir hazırlık yapmanız gerekmez.",
  },
  {
    question: "Görüşmelerim gizli kalır mı?",
    answer: (
      <>
        Evet. Terapide gizlilik ve sır saklama temel bir etik ilkedir.
        Paylaştıklarınız uzmanınızla aranızda kalır ve onayınız olmadan üçüncü
        kişilerle paylaşılmaz. Gizliliğin yalnızca yasal olarak zorunlu olduğu
        sınırlı durumlar vardır; örneğin kişinin kendisi veya bir başkası için
        ciddi ve yakın bir tehlike söz konusuysa ya da yasal bir yükümlülük
        bulunuyorsa. Bu sınırlar süreç başında sizinle açıkça paylaşılır.
      </>
    ),
    answerText:
      "Evet. Terapide gizlilik ve sır saklama temel bir etik ilkedir. Paylaştıklarınız uzmanınızla aranızda kalır ve onayınız olmadan üçüncü kişilerle paylaşılmaz. Gizliliğin yalnızca yasal olarak zorunlu olduğu sınırlı durumlar vardır; örneğin kişinin kendisi veya bir başkası için ciddi ve yakın bir tehlike söz konusuysa ya da yasal bir yükümlülük bulunuyorsa. Bu sınırlar süreç başında sizinle açıkça paylaşılır.",
  },
  {
    question: "Online terapi yüz yüze terapi kadar etkili midir?",
    answer: (
      <>
        Birçok durum için online terapi, yüz yüze terapiyle benzer düzeyde etkili
        olabilir; özellikle kaygı, depresyon ve stresle baş etme gibi alanlarda
        araştırmalar karşılaştırılabilir sonuçlar göstermektedir. Online görüşme;
        farklı şehirde yaşayan, yoğun bir programa sahip ya da kliniğe ulaşımı
        zor olan danışanlar için erişilebilir ve esnek bir seçenektir.
        Görüşmeler, gizliliği koruyan güvenli bir görüntülü bağlantı üzerinden
        yapılır. Bazı durumların yüz yüze çalışmaya daha uygun olup olmadığını
        uzmanınızla birlikte değerlendirebilirsiniz.
      </>
    ),
    answerText:
      "Birçok durum için online terapi yüz yüze terapiyle benzer düzeyde etkili olabilir; özellikle kaygı, depresyon ve stresle baş etme gibi alanlarda araştırmalar karşılaştırılabilir sonuçlar göstermektedir. Online görüşme; farklı şehirde yaşayan, yoğun programa sahip ya da kliniğe ulaşımı zor olan danışanlar için erişilebilir ve esnek bir seçenektir. Görüşmeler, gizliliği koruyan güvenli bir görüntülü bağlantı üzerinden yapılır. Bazı durumların yüz yüze çalışmaya daha uygun olup olmadığını uzmanınızla birlikte değerlendirebilirsiniz.",
  },
  {
    question: "Bir seans ne kadar sürer ve görüşmeler hangi sıklıkta yapılır?",
    answer: (
      <>
        Bir bireysel seans genellikle{" "}
        <span className="font-semibold text-forest">{seansSuresi}</span>{" "}
        sürer. Görüşmeler çoğunlukla haftada bir yapılır; sürecin başında daha
        düzenli görüşmek, ilerledikçe sıklığı seyrekleştirmek yaygın bir
        yaklaşımdır. Ancak görüşme sıklığı sabit bir kural değildir: ihtiyacınıza,
        hedeflerinize ve uzmanınızın değerlendirmesine göre size özel olarak
        belirlenir.
      </>
    ),
    answerText: `Bir bireysel seans genellikle ${seansSuresi} sürer. Görüşmeler çoğunlukla haftada bir yapılır; sürecin başında daha düzenli görüşmek, ilerledikçe sıklığı seyrekleştirmek yaygın bir yaklaşımdır. Ancak görüşme sıklığı sabit bir kural değildir: ihtiyacınıza, hedeflerinize ve uzmanınızın değerlendirmesine göre size özel olarak belirlenir.`,
  },
  // Ücret SSS maddesi yalnızca site.pricing.sessionFee gerçek veriyken eklenir;
  // placeholder iken hem görünümden hem JSON-LD'den çıkar (yukarıdaki filtre).
  ...(pricingReady
    ? [
        {
          question: "Seans ücreti ne kadardır?",
          answer: (
            <>
              Bireysel seans ücreti{" "}
              <span className="font-semibold text-forest">
                {site.pricing.sessionFee}
              </span>{" "}
              olup, bir seans yaklaşık {seansSuresi} sürer.{" "}
              {site.pricing.note} Güncel ücret bilgisi ve çift/aile gibi farklı
              görüşme türleri için bizimle iletişime geçebilirsiniz.
            </>
          ),
          answerText: `Bireysel seans ücreti ${site.pricing.sessionFee} olup, bir seans yaklaşık ${seansSuresi} sürer. ${site.pricing.note} Güncel ücret bilgisi ve çift/aile gibi farklı görüşme türleri için bizimle iletişime geçebilirsiniz.`,
        },
      ]
    : []),
  {
    question: "Randevuyu nasıl alabilirim?",
    answer: (
      <>
        Randevu almak için sitedeki{" "}
        <a
          href="#randevu"
          className="font-semibold text-forest underline decoration-sage/50 underline-offset-[5px] transition-colors duration-300 hover:decoration-forest"
        >
          randevu formunu
        </a>{" "}
        doldurabilir; ad, iletişim bilgisi ve uygun olduğunuz zamanları
        paylaşabilirsiniz. Talebinizi aldıktan sonra en kısa sürede sizinle
        iletişime geçerek görüşme saatini birlikte planlarız. Dilerseniz
        telefonla da randevu oluşturabilirsiniz.
      </>
    ),
    answerText:
      "Randevu almak için sitedeki randevu formunu doldurabilir; ad, iletişim bilgisi ve uygun olduğunuz zamanları paylaşabilirsiniz. Talebinizi aldıktan sonra en kısa sürede sizinle iletişime geçerek görüşme saatini birlikte planlarız. Dilerseniz telefonla da randevu oluşturabilirsiniz.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answerText,
    },
  })),
};

export default function FaqSection() {
  return (
    <section id="sss" className="bg-warm-white py-28 lg:py-40">
      {/* FAQPage yapısal verisi — içerik gerçek/doğru olduğundan her zaman yayınlanır. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSerialize(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* Bölüm başlığı */}
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <p className="font-body text-xs tracking-[0.2em] text-forest-muted uppercase">
              Sıkça Sorulan Sorular
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="mt-6 font-display text-4xl leading-tight font-light text-forest lg:text-5xl">
              Aklınızdaki{" "}
              <span className="italic">Soruları Yanıtlıyoruz</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <div aria-hidden="true" className="reveal-line mx-auto mt-8 h-px w-12 bg-sage/40" />
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="mt-8 font-body text-base leading-relaxed text-forest-muted">
              Terapi süreci, gizlilik ve randevuya dair merak edilenleri sizin
              için derledik.
            </p>
          </ScrollReveal>
        </div>

        {/* Akordeon — ince sage ayraçlarla bölünmüş erişilebilir liste */}
        <div className="mt-16 border-t border-sage/15">
          {faqs.map((faq, idx) => (
            <ScrollReveal key={faq.question} delay={Math.min(idx + 1, 5)}>
              <details className="group border-b border-sage/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg font-medium text-forest lg:text-xl">
                    {faq.question}
                  </h3>
                  {/* +/ok ikonu — açıkken döner; reduced-motion'da anında değişir */}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-sage transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 font-body text-base leading-relaxed text-forest-muted">
                  {faq.answer}
                </p>
              </details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
