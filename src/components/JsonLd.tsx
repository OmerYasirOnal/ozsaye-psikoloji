import { birlesikProfil } from "@/lib/ekip";
import { jsonLdSerialize } from "@/lib/json-ld";
import { getTumProfiller } from "@/lib/profil-db";
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
 *    Person içeriği (bio, üniversite, üyelik, alanlar, sameAs, görsel) panelden
 *    girilir (`expert_profiles`); `birlesikProfil` ile birleştirilir. Girilmemiş
 *    (null) alanlar düğümden atlanır (eski isReady-atla davranışıyla aynı).
 */
export default async function JsonLd() {
  // Gerçek veri doğrulanmadan yapısal veri yayımlama. (DB'ye erişmeden önce
  // döner: dataReady=false iken profil sorgusu hiç çalışmaz.)
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
    "@graph": [clinic, ...people],
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
