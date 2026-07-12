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

/**
 * Tek bir uzmanın SABİT kimliği. İçerik (bio, künye, dereceler, sertifikalar,
 * üyelik, üniversite, alanlar, sameAs, görsel) artık burada DEĞİL: panelden
 * (Profilim) girilip `expert_profiles` tablosunda tutulur. Birleştirme
 * `@/lib/ekip` (`birlesikProfil`) ile yapılır.
 */
export interface Expert {
  /** URL/anchor için sabit slug, ör. "melek-yildiz". */
  slug: string;
  /** Tam ad, ör. "Melek Yıldız". */
  name: string;
  /** Tam unvan, ör. "Psikolojik Danışman". */
  title: string;
  /** Kısa unvan/ön-ek, ör. "Psk. Dan.". */
  shortTitle: string;
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
  /**
   * Anasayfa "Hakkımızda" bölümündeki genel ofis/tanıtım görseli (opsiyonel).
   * Boşsa (klinikten fotoğraf gelene kadar) About.tsx zarifçe bir yer
   * tutucu gösterir — kırık görsel veya boş alan olmaz.
   */
  aboutImageUrl?: string;
}

export const site: Site = {
  // Marka adı (gerçek). Tescilli tüzel ünvan ayrıdır: bkz. legalName.
  name: "Öz & Saye Psikoloji",
  shortName: "Öz & Saye Psikoloji",
  slogan: "Güvenli Bir Bölgede Kendi Özüne Doğru",
  description:
    "Psikolojik Danışman Melek Yıldız ve Klinik Psikolog Sacide Şahin ile güvenli bir alanda profesyonel psikolojik destek alın.",
  // TODO: GERÇEK VERİ -- yasal/tüzel işletme adını girin (ör. "Özsaye Psikoloji Danışmanlık Hizmetleri Ltd. Şti.")
  legalName: "[DOLDUR] Özsaye Psikoloji Danışmanlık Hizmetleri Ltd. Şti.",

  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ozsaye.com",

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
    // GERÇEK VERİ (2026-07-09): kliniğin kurumsal kutusu — M365 üzerinde canlı,
    // teslim testi yapıldı; klinik ekibi kutuyu aktif kullanıyor.
    address: "info@ozsaye.com",
    href: "mailto:info@ozsaye.com",
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
    // GERÇEK VERİ (2026-07-09): kliniğin İşletme hesabı (Meta Accounts Center'da doğrulandı).
    instagram: "https://www.instagram.com/ozsayepsikoloji",
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

  // Uzman KİMLİĞİ sabit (slug/ad/unvan); İÇERİK (bio, künye, dereceler, vb.)
  // panelden (Profilim) girilir ve `expert_profiles` tablosunda tutulur.
  // Kamu sayfaları içeriği `@/lib/ekip` `birlesikProfil` ile birleştirir.
  experts: [
    {
      slug: "melek-yildiz",
      name: "Melek Yıldız",
      title: "Psikolojik Danışman",
      shortTitle: "Psk. Dan.",
    },
    {
      slug: "sacide-sahin",
      name: "Sacide Şahin",
      title: "Klinik Psikolog",
      shortTitle: "Kl. Psk.",
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

/**
 * Bir alanın gerçek (doldurulmuş) veri olup olmadığını söyler. "[DOLDUR] "
 * ön-ekli veya boş değerler placeholder kabul edilir; bu durumda arayüzde
 * gösterilmez / yapısal veriye (JSON-LD) eklenmez. Gerçek veri girilince
 * koşullu render otomatik olarak içeriği gösterir. Sahte NAP/künye sızıntısını
 * (özellikle YMYL için) önlemenin tek noktadan kontrolü budur.
 */
export function isReady(value?: string | null): boolean {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !value.startsWith("[DOLDUR]")
  );
}
