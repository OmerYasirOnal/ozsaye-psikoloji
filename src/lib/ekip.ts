/**
 * Ekip profili — SAF birleştirme katmanı.
 *
 * Kimlik site.experts'ten, içerik expert_profiles'tan — birleştirme burada;
 * alan null = kamuda gizli (eski isReady davranışının DB karşılığı).
 *
 * Bu modül SAFTIR: `server-only`/`next/*`/DB import YOK. Hem panel formu hem
 * public sayfalar hem de düz Vitest birim testleri bu katmanı doğrudan paylaşır.
 * Panel textarea'ları öğe başına bir satır tutar; DB `text[]` saklar — çeviriciler
 * bu ikisi arasında köprü kurar.
 */

/** expert_profiles içerik satırı (tümü nullable). Kimlik alanları HARİÇ. */
export type ProfilIcerik = {
  bio: string | null;
  credentialsLine: string | null;
  university: string | null;
  membership: string | null;
  degrees: string[] | null;
  certifications: string[] | null;
  areas: string[] | null;
  sameAs: string[] | null;
  imageUrl: string | null;
};

/** site.experts'ten gelen sabit kimlik (Task 4 sonrası yalnız bu 4 alan). */
export type ProfilKimligi = {
  slug: string;
  name: string;
  title: string;
  shortTitle: string;
};

/** Kimlik + içerik birleşimi (public sayfa/panel önizleme için tek nesne). */
export type BirlesikProfil = ProfilKimligi & ProfilIcerik;

/**
 * Form textarea metnini DB dizisine çevirir: satırlara böl, trim'le, boşları at.
 * Boş girdi -> boş dizi.
 */
export function satirlardanListe(ham: string): string[] {
  return ham
    .split("\n")
    .map((satir) => satir.trim())
    .filter((satir) => satir.length > 0);
}

/**
 * DB dizisini form textarea metnine çevirir: satır başlarıyla birleştir.
 * null -> boş metin.
 */
export function listedenSatirlar(liste: string[] | null): string {
  return liste === null ? "" : liste.join("\n");
}

/**
 * Kimliği içerikle birleştirir. İçerik null ise (henüz satır girilmemiş) tüm
 * içerik alanları null döner — kamuda gizli kalır (eski isReady davranışı).
 */
export function birlesikProfil(
  kimlik: ProfilKimligi,
  icerik: ProfilIcerik | null,
): BirlesikProfil {
  const bos: ProfilIcerik = {
    bio: null,
    credentialsLine: null,
    university: null,
    membership: null,
    degrees: null,
    certifications: null,
    areas: null,
    sameAs: null,
    imageUrl: null,
  };
  return { ...kimlik, ...(icerik ?? bos) };
}

/**
 * Yetki kuralı: admin her profili düzenler; therapist yalnız kendi
 * (staff.expertSlug === slug) profilini. expertSlug null therapist hiçbirini.
 */
export function profiliDuzenleyebilir(
  staff: { expertSlug: string | null; role: "therapist" | "admin" },
  slug: string,
): boolean {
  if (staff.role === "admin") return true;
  return staff.expertSlug !== null && staff.expertSlug === slug;
}
