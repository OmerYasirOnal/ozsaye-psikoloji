/**
 * Özsaye Psikoloji — merkezi site yapılandırması.
 *
 * UYARI: Aşağıdaki gerçek değerlerin (NAP, kimlik, ücret, uzman künyeleri vb.)
 * tamamı şu an PLACEHOLDER'dır. Her placeholder "[DOLDUR] " ön-ekiyle başlar ve
 * üstünde "// TODO: GERÇEK VERİ -- ..." yorumu + parantez içinde gerçekçi bir örnek
 * vardır. Placeholder'ları asla gerçek veriymiş gibi sunmayın.
 *
 * `dataReady` alanı, tüm bu gerçek veriler girilip doğrulanana kadar `false`
 * kalır. JSON-LD (src/components/JsonLd.tsx) bu bayrağa bağlıdır: `false` iken
 * yapısal veri üretilmez. Tüm placeholder'lar doldurulup teyit edildiğinde
 * `dataReady` `true` yapılır.
 */

/** Çalışma saati aralığı (schema.org OpeningHoursSpecification ile uyumlu). */
export interface OpeningHour {
  /** schema.org gün kodları, ör. ["Mo", "Tu", "We", "Th", "Fr"]. */
  days: string[];
  /** Açılış saati "HH:MM" (24 saat). */
  opens: string;
  /** Kapanış saati "HH:MM" (24 saat). */
  closes: string;
  /** Kullanıcıya gösterilecek Türkçe etiket, ör. "Pazartesi - Cuma 09:00-19:00". */
  label: string;
}

/** Tek bir uzmanın künye/profil bilgileri. */
export interface Expert {
  /** URL/anchor için sabit slug, ör. "melek-yildiz". */
  slug: string;
  /** Tam ad, ör. "Melek Yıldız". */
  name: string;
  /** Tam unvan, ör. "Psikolojik Danışman". */
  title: string;
  /** Kısa unvan/ön-ek, ör. "Psk. Dan.". */
  shortTitle: string;
  /** Ad + unvan + temel künye tek satırda, kart/başlık için. */
  credentialsLine: string;
  /** Diploma/derece satırları. */
  degrees: string[];
  /** Mezun olunan üniversite. */
  university: string;
  /** Sertifika/eğitim listesi. */
  certifications: string[];
  /** Üyelik (oda/dernek vb.). */
  membership: string;
  /** Görsel public yolu, ör. "/uzmanlar/melek-yildiz.jpg". */
  image: string;
  /** Kısa biyografi metni. */
  bio: string;
  /** Uzmanlık/çalışma alanları. */
  areas: string[];
  /** Person.sameAs için profil URL'leri (LinkedIn, Instagram, akademik vb.). */
  sameAs: string[];
}

/** Tüm site yapılandırmasının kök tipi. */
export interface Site {
  /** Tam resmî unvan. */
  name: string;
  /** Kısa marka adı. */
  shortName: string;
  /** Slogan. */
  slogan: string;
  /** SEO/meta açıklaması. */
  description: string;
  /** Yasal işletme adı (tüzel kişilik). */
  legalName: string;
  /** Sitenin kanonik kök URL'i. */
  url: string;
  /**
   * Gerçek NAP/kimlik verisi girilip doğrulanınca `true` yapılacak bayrak.
   * JSON-LD üretimi buna bağlıdır.
   */
  dataReady: boolean;
  /** Telefon: gösterim metni, E.164 ham hali ve tel: bağlantısı. */
  phone: {
    /** Gösterim, ör. "+90 555 123 45 67". */
    display: string;
    /** E.164, ör. "+905551234567". */
    e164: string;
    /** "tel:+90..." bağlantısı. */
    href: string;
  };
  /** E-posta: adres ve mailto bağlantısı. */
  email: {
    address: string;
    href: string;
  };
  /** Açık adres bileşenleri. */
  address: {
    streetAddress: string;
    /** İlçe. */
    district: string;
    /** İl. */
    city: string;
    postalCode: string;
    /** Ülke kodu, ör. "TR". */
    country: string;
    /** Tek satır tam adres. */
    full: string;
  };
  /** Coğrafi konum (harita/JSON-LD). */
  geo: {
    latitude: number;
    longitude: number;
  };
  /** Çalışma saatleri. */
  openingHours: OpeningHour[];
  /** Sosyal medya tam URL'leri (yoksa undefined). */
  social: {
    instagram?: string;
    linkedin?: string;
  };
  /** Google Maps embed iframe `src` değeri (yoksa ""). */
  mapEmbedSrc: string;
  /** Seans ücreti bilgileri. */
  pricing: {
    /** Seans ücreti gösterimi. */
    sessionFee: string;
    /** Seans süresi. */
    duration: string;
    /** Açıklama/not. */
    note: string;
  };
  /** Uzman kadrosu. */
  experts: Expert[];
}

export const site: Site = {
  // TODO: GERÇEK VERİ -- tam resmî unvanı girin (ör. "Özsaye Psikoloji Danışmanlık Merkezi")
  name: "[DOLDUR] Özsaye Psikoloji Danışmanlık Merkezi",
  shortName: "Özsaye Psikoloji",
  // TODO: GERÇEK VERİ -- markanın sloganını girin (ör. "Birlikte iyileşmenin alanı")
  slogan: "[DOLDUR] Birlikte iyileşmenin alanı",
  // TODO: GERÇEK VERİ -- SEO meta açıklaması, 150-160 karakter (ör. "İstanbul'da bireysel terapi, çift ve aile danışmanlığı sunan Özsaye Psikoloji ekibiyle tanışın.")
  description:
    "[DOLDUR] İstanbul'da bireysel terapi, çift ve aile danışmanlığı sunan Özsaye Psikoloji ekibiyle tanışın.",
  // TODO: GERÇEK VERİ -- yasal/tüzel işletme adını girin (ör. "Özsaye Psikoloji Danışmanlık Hizmetleri Ltd. Şti.")
  legalName: "[DOLDUR] Özsaye Psikoloji Danışmanlık Hizmetleri Ltd. Şti.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ozsayepsikoloji.com",

  // Tüm gerçek NAP/kimlik verisi girilip doğrulanınca `true` yapın.
  dataReady: false,

  phone: {
    // TODO: GERÇEK VERİ -- telefon gösterim biçimi (ör. "+90 555 123 45 67")
    display: "[DOLDUR] +90 555 123 45 67",
    // TODO: GERÇEK VERİ -- E.164 ham telefon (ör. "+905551234567")
    e164: "[DOLDUR] +905551234567",
    // TODO: GERÇEK VERİ -- tel: bağlantısı, E.164 ile (ör. "tel:+905551234567")
    href: "[DOLDUR] tel:+905551234567",
  },

  email: {
    // TODO: GERÇEK VERİ -- iletişim e-postası (ör. "iletisim@ozsayepsikoloji.com")
    address: "[DOLDUR] iletisim@ozsayepsikoloji.com",
    // TODO: GERÇEK VERİ -- mailto bağlantısı (ör. "mailto:iletisim@ozsayepsikoloji.com")
    href: "[DOLDUR] mailto:iletisim@ozsayepsikoloji.com",
  },

  address: {
    // TODO: GERÇEK VERİ -- açık adres/sokak (ör. "Bağdat Caddesi No: 123 Daire: 4")
    streetAddress: "[DOLDUR] Bağdat Caddesi No: 123 Daire: 4",
    // TODO: GERÇEK VERİ -- ilçe (ör. "Kadıköy")
    district: "[DOLDUR] Kadıköy",
    // TODO: GERÇEK VERİ -- il (ör. "İstanbul")
    city: "[DOLDUR] İstanbul",
    // TODO: GERÇEK VERİ -- posta kodu (ör. "34000")
    postalCode: "[DOLDUR] 34000",
    // TODO: GERÇEK VERİ -- ülke kodu (ör. "TR")
    country: "TR",
    // TODO: GERÇEK VERİ -- tek satır tam adres (ör. "Bağdat Caddesi No: 123 Daire: 4, 34000 Kadıköy/İstanbul")
    full: "[DOLDUR] Bağdat Caddesi No: 123 Daire: 4, 34000 Kadıköy/İstanbul",
  },

  geo: {
    // TODO: GERÇEK VERİ -- klinik enlemi (örnek İstanbul yaklaşık değeridir; gerçek konumla değiştirin)
    latitude: 41.0082,
    // TODO: GERÇEK VERİ -- klinik boylamı (örnek İstanbul yaklaşık değeridir; gerçek konumla değiştirin)
    longitude: 28.9784,
  },

  openingHours: [
    {
      // TODO: GERÇEK VERİ -- gerçek çalışma günleri/saatlerini girin (örnek: hafta içi 09:00-19:00)
      days: ["Mo", "Tu", "We", "Th", "Fr"],
      opens: "09:00",
      closes: "19:00",
      label: "Pazartesi - Cuma 09:00-19:00",
    },
    // Not: Cumartesi/Pazar veya farklı saat aralığı varsa buraya ek OpeningHour
    // nesneleri ekleyin (ör. { days: ["Sa"], opens: "10:00", closes: "14:00",
    // label: "Cumartesi 10:00-14:00" }).
  ],

  social: {
    // TODO: GERÇEK VERİ -- Instagram profil tam URL'i (ör. "https://www.instagram.com/ozsayepsikoloji")
    instagram: undefined,
    // TODO: GERÇEK VERİ -- LinkedIn şirket/profil tam URL'i (ör. "https://www.linkedin.com/company/ozsaye-psikoloji")
    linkedin: undefined,
  },

  // TODO: GERÇEK VERİ -- Google Maps embed src. Almak için: Google Maps'te konumu açın
  // -> Paylaş -> "Harita yerleştir" sekmesi -> iframe HTML'indeki src="..." değerini
  // buraya yapıştırın (ör. "https://www.google.com/maps/embed?pb=...").
  mapEmbedSrc: "",

  pricing: {
    // TODO: GERÇEK VERİ -- seans ücreti (ör. "1.500 TL")
    sessionFee: "[DOLDUR] 1.500 TL",
    // TODO: GERÇEK VERİ -- seans süresi (ör. "50 dakika")
    duration: "[DOLDUR] 50 dakika",
    // TODO: GERÇEK VERİ -- ücret notu (ör. "İlk görüşme ücretsizdir; çift/aile seansları farklı ücretlendirilir.")
    note: "[DOLDUR] İlk görüşme ücretsizdir; çift/aile seansları farklı ücretlendirilir.",
  },

  experts: [
    {
      slug: "melek-yildiz",
      name: "Melek Yıldız",
      title: "Psikolojik Danışman",
      shortTitle: "Psk. Dan.",
      // TODO: GERÇEK VERİ -- tek satır künye (ör. "Psk. Dan. Melek Yıldız — Bireysel ve çift danışmanlığı")
      credentialsLine: "[DOLDUR] Psk. Dan. Melek Yıldız — Bireysel ve çift danışmanlığı",
      degrees: [
        // TODO: GERÇEK VERİ -- diploma/dereceler (ör. "Psikolojik Danışmanlık ve Rehberlik, Lisans")
        "[DOLDUR] Psikolojik Danışmanlık ve Rehberlik, Lisans",
      ],
      // TODO: GERÇEK VERİ -- mezun olunan üniversite (ör. "Boğaziçi Üniversitesi")
      university: "[DOLDUR] Boğaziçi Üniversitesi",
      certifications: [
        // TODO: GERÇEK VERİ -- sertifikalar (ör. "Bilişsel Davranışçı Terapi (BDT) Sertifikası")
        "[DOLDUR] Bilişsel Davranışçı Terapi (BDT) Sertifikası",
      ],
      // TODO: GERÇEK VERİ -- üyelik (ör. "Türk Psikolojik Danışma ve Rehberlik Derneği üyesi")
      membership: "[DOLDUR] Türk Psikolojik Danışma ve Rehberlik Derneği üyesi",
      image: "/uzmanlar/melek-yildiz.jpg",
      // TODO: GERÇEK VERİ -- kısa biyografi (ör. "Melek Yıldız, ergen ve yetişkinlerle bireysel danışmanlık yürütür...")
      bio: "[DOLDUR] Melek Yıldız, ergen ve yetişkinlerle bireysel danışmanlık alanında çalışmaktadır.",
      areas: [
        // TODO: GERÇEK VERİ -- çalışma alanları (ör. "Kaygı bozuklukları", "İlişki sorunları")
        "[DOLDUR] Kaygı bozuklukları",
        "[DOLDUR] İlişki sorunları",
      ],
      sameAs: [
        // TODO: GERÇEK VERİ -- profil URL'leri (ör. "https://www.instagram.com/melekyildizpsk")
        "[DOLDUR] https://www.instagram.com/melekyildizpsk",
      ],
    },
    {
      slug: "sacide-sahin",
      name: "Sacide Şahin",
      title: "Klinik Psikolog",
      shortTitle: "Kl. Psk.",
      // TODO: GERÇEK VERİ -- tek satır künye (ör. "Kl. Psk. Sacide Şahin — Yetişkin psikoterapisi")
      credentialsLine: "[DOLDUR] Kl. Psk. Sacide Şahin — Yetişkin psikoterapisi",
      degrees: [
        // TODO: GERÇEK VERİ -- diploma/dereceler (ör. "Psikoloji, Lisans", "Klinik Psikoloji, Yüksek Lisans")
        "[DOLDUR] Psikoloji, Lisans",
        "[DOLDUR] Klinik Psikoloji, Yüksek Lisans",
      ],
      // TODO: GERÇEK VERİ -- mezun olunan üniversite (ör. "İstanbul Üniversitesi")
      university: "[DOLDUR] İstanbul Üniversitesi",
      certifications: [
        // TODO: GERÇEK VERİ -- sertifikalar (ör. "EMDR Terapi Sertifikası")
        "[DOLDUR] EMDR Terapi Sertifikası",
      ],
      // TODO: GERÇEK VERİ -- üyelik (ör. "Türk Psikologlar Derneği üyesi")
      membership: "[DOLDUR] Türk Psikologlar Derneği üyesi",
      image: "/uzmanlar/sacide-sahin.jpg",
      // TODO: GERÇEK VERİ -- kısa biyografi (ör. "Sacide Şahin, travma ve kayıp konularında yetişkinlerle çalışmaktadır...")
      bio: "[DOLDUR] Sacide Şahin, travma ve kayıp konularında yetişkinlerle psikoterapi yürütmektedir.",
      areas: [
        // TODO: GERÇEK VERİ -- çalışma alanları (ör. "Travma", "Depresyon")
        "[DOLDUR] Travma",
        "[DOLDUR] Depresyon",
      ],
      sameAs: [
        // TODO: GERÇEK VERİ -- profil URL'leri (ör. "https://www.linkedin.com/in/sacidesahin")
        "[DOLDUR] https://www.linkedin.com/in/sacidesahin",
      ],
    },
  ],
};

/**
 * Verilen göreli yolu (ör. "/randevu") sitenin kök URL'i ile birleştirip
 * mutlak URL döndürür. Başında "/" olsa da olmasa da doğru çalışır.
 */
export function absoluteUrl(path: string): string {
  const base = site.url.replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
