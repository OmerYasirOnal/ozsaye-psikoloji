import { absoluteUrl, site } from "@/lib/site";

/**
 * Özsaye Psikoloji — schema.org yapısal verisi (JSON-LD).
 *
 * Server Component. `site.dataReady` `false` olduğu sürece (NAP/kimlik gerçek
 * verisi henüz girilip doğrulanmadığı için) hiçbir yapısal veri üretmez ve
 * `null` döner — placeholder verinin arama motorlarına/AI sistemlerine sızmasını
 * önlemek için.
 *
 * `true` olduğunda tek bir <script type="application/ld+json"> içinde bir
 * `@graph` dizisi üretilir:
 *  - MedicalClinic (klinik kimliği, NAP, çalışma saatleri, konum).
 *    Not: schema.org'da net bir "Psychologist" işletme tipi yoktur; bu yüzden
 *    MedicalClinic + medicalSpecialty: "Psychiatric" kullanılır.
 *  - Her uzman için bir Person düğümü (worksFor ile klinikle ilişkilendirilir).
 */
export default function JsonLd() {
  // Gerçek veri doğrulanmadan yapısal veri yayımlama.
  if (!site.dataReady) {
    return null;
  }

  const clinicId = `${site.url}#klinik`;

  // Klinik için sameAs: yalnızca tanımlı sosyal profiller.
  const clinicSameAs = [site.social.instagram, site.social.linkedin].filter(
    (url): url is string => Boolean(url),
  );

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

  const people = site.experts.map((expert) => {
    // hasCredential: diploma/dereceler + sertifikalar tek listede.
    const credentials = [...expert.degrees, ...expert.certifications].map(
      (credential) => ({
        "@type": "EducationalOccupationalCredential",
        name: credential,
      }),
    );

    // sameAs: yalnızca dolu (boş olmayan) profil URL'leri.
    const personSameAs = expert.sameAs.filter((url) => url.trim().length > 0);

    return {
      "@type": "Person",
      "@id": `${site.url}#${expert.slug}`,
      name: expert.name,
      jobTitle: expert.title,
      description: expert.bio,
      image: absoluteUrl(expert.image),
      knowsAbout: expert.areas,
      worksFor: { "@id": clinicId },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: expert.university,
      },
      ...(credentials.length > 0 ? { hasCredential: credentials } : {}),
      memberOf: {
        "@type": "Organization",
        name: expert.membership,
      },
      ...(personSameAs.length > 0 ? { sameAs: personSameAs } : {}),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [clinic, ...people],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify çıktısı güvenli (HTML enjeksiyonu için </script> dizisi
      // üretmez); yine de site config'ten gelen sabit veriden oluşur.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
