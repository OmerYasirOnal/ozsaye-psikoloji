import { birlesikProfil } from "@/lib/ekip";
import { jsonLdSerialize } from "@/lib/json-ld";
import { getTumProfiller } from "@/lib/profil-db";
import { absoluteUrl, site } from "@/lib/site";

/**
 * Özsaye Psikoloji — schema.org yapısal verisi (JSON-LD).
 *
 * Server Component. Tek bir <script type="application/ld+json"> içinde bir
 * `@graph` dizisi üretilir. Graph iki kademeli:
 *  - **Her zaman** (NAP verisinden bağımsız): `WebSite` + `Organization`
 *    (yalnız site adı/URL + doğrulanmış sosyal profiller — bunlar zaten
 *    gerçek ve NAP'e ihtiyaç duymaz).
 *  - **Yalnız `site.dataReady=true` iken** eklenir (NAP/kimlik gerçek verisi
 *    girilip doğrulanana kadar placeholder'ın arama motorlarına/AI
 *    sistemlerine sızmasını önlemek için): MedicalClinic (NAP, çalışma
 *    saatleri, konum — schema.org'da net bir "Psychologist" işletme tipi
 *    yoktur, bu yüzden MedicalClinic + medicalSpecialty: "Psychiatric"
 *    kullanılır) + her uzman için bir Person düğümü (worksFor ile klinikle
 *    ilişkilendirilir; içerik panelden girilir, `birlesikProfil` ile
 *    birleştirilir; girilmemiş alanlar düğümden atlanır).
 */
export default async function JsonLd() {
  const clinicSameAs = [site.social.instagram, site.social.linkedin].filter(
    (url): url is string => Boolean(url),
  );

  const graph: object[] = [
    {
      "@type": "WebSite",
      "@id": `${site.url}#website`,
      name: site.shortName,
      url: site.url,
      inLanguage: "tr-TR",
    },
    {
      "@type": "Organization",
      "@id": `${site.url}#organization`,
      name: site.shortName,
      url: site.url,
      ...(clinicSameAs.length > 0 ? { sameAs: clinicSameAs } : {}),
    },
  ];

  // NAP/kimlik gerçek veri doğrulanmadan MedicalClinic/Person yayımlama.
  // (DB'ye erişmeden önce döner: dataReady=false iken profil sorgusu hiç çalışmaz.)
  if (!site.dataReady) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdSerialize({ "@context": "https://schema.org", "@graph": graph }),
        }}
      />
    );
  }

  const clinicId = `${site.url}#klinik`;

  const clinic = {
    "@type": ["MedicalClinic", "MedicalBusiness"],
    "@id": clinicId,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    description: site.description,
    slogan: site.slogan,
    telephone: site.phone.e164,
    email: site.email.address,
    image: absoluteUrl("/og.png"),
    // Kurumsal logo (kare, beyaz zeminli site ikonu) — arama motorlarının yeni
    // markayı işletme kimliğiyle ilişkilendirmesi için. og.png sosyal kart, logo değil.
    logo: { "@type": "ImageObject", url: absoluteUrl("/icon-512.png") },
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.streetAddress,
      addressLocality: site.address.district,
      addressRegion: site.address.city,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    openingHoursSpecification: site.openingHours.map((hour) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hour.days,
      opens: hour.opens,
      closes: hour.closes,
    })),
    areaServed: {
      "@type": "City",
      name: site.address.city,
    },
    ...(clinicSameAs.length > 0 ? { sameAs: clinicSameAs } : {}),
  };

  // Kimlik site.experts'ten, içerik panelden (expert_profiles) — tek sorgu.
  const profiller = await getTumProfiller();

  const people = site.experts.map((expert) => {
    const profil = birlesikProfil(expert, profiller.get(expert.slug) ?? null);

    // hasCredential: diploma/dereceler + sertifikalar tek listede.
    const credentials = [
      ...(profil.degrees ?? []),
      ...(profil.certifications ?? []),
    ].map((credential) => ({
      "@type": "EducationalOccupationalCredential",
      name: credential,
    }));

    const personSameAs = profil.sameAs ?? [];
    const knowsAbout = profil.areas ?? [];

    // Görsel yolu mutlaklaştırılır; zaten mutlaksa (Blob URL) olduğu gibi kalır.
    const imageUrl = profil.imageUrl
      ? profil.imageUrl.startsWith("http")
        ? profil.imageUrl
        : absoluteUrl(profil.imageUrl)
      : null;

    // Girilmemiş (null/boş) alanlar düğümden atlanır (eski isReady-atla).
    return {
      "@type": "Person",
      "@id": `${site.url}#${expert.slug}`,
      name: expert.name,
      jobTitle: expert.title,
      worksFor: { "@id": clinicId },
      ...(profil.bio ? { description: profil.bio } : {}),
      ...(imageUrl ? { image: imageUrl } : {}),
      ...(knowsAbout.length > 0 ? { knowsAbout } : {}),
      ...(profil.university
        ? { alumniOf: { "@type": "CollegeOrUniversity", name: profil.university } }
        : {}),
      ...(credentials.length > 0 ? { hasCredential: credentials } : {}),
      ...(profil.membership
        ? { memberOf: { "@type": "Organization", name: profil.membership } }
        : {}),
      ...(personSameAs.length > 0 ? { sameAs: personSameAs } : {}),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [...graph, clinic, ...people],
  };

  return (
    <script
      type="application/ld+json"
      // Person içeriği panelden (expert_profiles) gelir; jsonLdSerialize "<"
      // karakterini kaçırarak "</script>" ile script bağlamından kaçışı
      // (stored XSS) engeller.
      dangerouslySetInnerHTML={{ __html: jsonLdSerialize(jsonLd) }}
    />
  );
}
