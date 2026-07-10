"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { site } from "@/lib/site";
import { profiliDuzenleyebilir, satirlardanListe } from "@/lib/ekip";
import type { ProfilIcerik } from "@/lib/ekip";
import { getProfilIcerik, upsertProfilIcerik } from "@/lib/profil-db";

export type ProfilFormState = { hata?: string; ok?: boolean };

// Kimlik alanları (slug/ad/unvan) DEĞİL — yalnız içerik. `imageUrl` bu action'da
// güncellenMEZ (Task 6 `profilFotoAyarla` ayrı yolu): mevcut satırdan korunur.
// Skaler alanlar boş → null; liste alanları ham textarea metni olarak alınır ve
// `satirlardanListe` ile diziye çevrilir (boş dizi → null = kamuda gizli).
const schema = z.object({
  slug: z.enum(
    site.experts.map((e) => e.slug) as [string, ...string[]],
    "Geçersiz uzman.",
  ),
  bio: z.string().trim().max(4000, "Biyografi en fazla 4000 karakter olabilir."),
  credentialsLine: z
    .string()
    .trim()
    .max(300, "Kart tanıtım satırı en fazla 300 karakter olabilir."),
  university: z
    .string()
    .trim()
    .max(300, "Üniversite en fazla 300 karakter olabilir."),
  membership: z
    .string()
    .trim()
    .max(300, "Üyelik en fazla 300 karakter olabilir."),
  degreesHam: z
    .string()
    .max(4000, "Diplomalar en fazla 4000 karakter olabilir."),
  certificationsHam: z
    .string()
    .max(4000, "Sertifikalar en fazla 4000 karakter olabilir."),
  areasHam: z
    .string()
    .max(4000, "Çalışma alanları en fazla 4000 karakter olabilir."),
  sameAsHam: z
    .string()
    .max(4000, "Profil bağlantıları en fazla 4000 karakter olabilir."),
});

// Boş dizi → null (kamuda gizli). Skaler boş metin → null çevirimi çağrı yerinde.
function listeVeyaNull(liste: string[]): string[] | null {
  return liste.length > 0 ? liste : null;
}

export async function profilKaydet(
  _prev: ProfilFormState,
  formData: FormData,
): Promise<ProfilFormState> {
  // 1) Kimlik doğrulama HER ZAMAN ilk sırada.
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  if (!staff) return { hata: "Personel kaydı bulunamadı." };

  // 2) Doğrulama (Türkçe mesajlar).
  const parsed = schema.safeParse({
    slug: formData.get("slug"),
    bio: formData.get("bio"),
    credentialsLine: formData.get("credentialsLine"),
    university: formData.get("university"),
    membership: formData.get("membership"),
    degreesHam: formData.get("degrees"),
    certificationsHam: formData.get("certifications"),
    areasHam: formData.get("areas"),
    sameAsHam: formData.get("sameAs"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { hata: first?.message ?? "Form geçersiz — alanları kontrol edin." };
  }
  const {
    slug,
    bio,
    credentialsLine,
    university,
    membership,
    degreesHam,
    certificationsHam,
    areasHam,
    sameAsHam,
  } = parsed.data;

  // 3) Yetki: admin her profili; therapist yalnız kendi slug'ını.
  if (!profiliDuzenleyebilir(staff, slug)) {
    return { hata: "Bu profili düzenleme yetkiniz yok." };
  }

  // 4) `imageUrl` bu action'da yönetilmez — mevcut satırdan korunur (yoksa null).
  const mevcut = await getProfilIcerik(slug);

  const icerik: ProfilIcerik = {
    bio: bio || null,
    credentialsLine: credentialsLine || null,
    university: university || null,
    membership: membership || null,
    degrees: listeVeyaNull(satirlardanListe(degreesHam)),
    certifications: listeVeyaNull(satirlardanListe(certificationsHam)),
    areas: listeVeyaNull(satirlardanListe(areasHam)),
    sameAs: listeVeyaNull(satirlardanListe(sameAsHam)),
    imageUrl: mevcut?.imageUrl ?? null,
  };

  await upsertProfilIcerik(slug, icerik);

  // 5) SSG/prerender kamu yüzeylerini tazele — kayıttan sonra tek tazeleme yolu.
  revalidatePath("/ekip");
  revalidatePath(`/ekip/${slug}`);
  revalidatePath("/");

  return { ok: true };
}
