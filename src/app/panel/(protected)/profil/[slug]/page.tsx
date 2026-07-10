import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { site } from "@/lib/site";
import { profiliDuzenleyebilir, listedenSatirlar } from "@/lib/ekip";
import { getProfilIcerik } from "@/lib/profil-db";
import ProfilForm from "./ProfilForm";

export const metadata: Metadata = { title: "Profili Düzenle" };

export default async function ProfilDuzenle({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Bilinmeyen slug → 404 (yalnız site.experts kimlikleri geçerli).
  const uzman = site.experts.find((e) => e.slug === slug);
  if (!uzman) notFound();

  // Kimlik + yetki: yetkisiz erişim varlığı sızdırmadan 404 döner.
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  if (!staff || !profiliDuzenleyebilir(staff, slug)) notFound();

  // Mevcut içerik (yoksa null → tüm alanlar boş prefill).
  const icerik = await getProfilIcerik(slug);

  const initial = {
    bio: icerik?.bio ?? "",
    credentialsLine: icerik?.credentialsLine ?? "",
    university: icerik?.university ?? "",
    membership: icerik?.membership ?? "",
    degrees: listedenSatirlar(icerik?.degrees ?? null),
    certifications: listedenSatirlar(icerik?.certifications ?? null),
    areas: listedenSatirlar(icerik?.areas ?? null),
    sameAs: listedenSatirlar(icerik?.sameAs ?? null),
  };

  return (
    <section className="space-y-6">
      <div>
        {staff.role === "admin" && (
          <Link
            href="/panel/profil"
            className="text-forest-muted text-sm underline"
          >
            ← Profillere dön
          </Link>
        )}
        <h1 className="mt-3 font-display text-2xl text-forest">
          {uzman.name}
        </h1>
        <p className="mt-1 text-forest-muted text-sm">
          {uzman.title} · Bu içerik /ekip sayfasında yayımlanır.
        </p>
      </div>

      <ProfilForm
        slug={slug}
        imageUrl={icerik?.imageUrl ?? null}
        initial={initial}
      />
    </section>
  );
}
