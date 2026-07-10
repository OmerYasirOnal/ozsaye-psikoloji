import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Profilim" };

export default async function ProfilYonlendirme() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);

  // Admin: her iki uzmanın kartı — düzenlenecek profili seçer.
  if (staff?.role === "admin") {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-forest">Profiller</h1>
          <p className="mt-1 text-forest-muted">
            Düzenlemek istediğiniz uzman profilini seçin.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {site.experts.map((uzman) => (
            <Link
              key={uzman.slug}
              href={`/panel/profil/${uzman.slug}`}
              className="rounded-lg border border-stone bg-warm-white px-5 py-4"
            >
              <span className="block text-forest font-medium">
                {uzman.name}
              </span>
              <span className="mt-1 block text-forest-muted text-sm">
                {uzman.title}
              </span>
              <span className="mt-3 block text-forest-muted text-sm underline">
                Düzenle
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Terapist: kendi uzman profiline yönlendir.
  if (staff?.expertSlug) {
    redirect(`/panel/profil/${staff.expertSlug}`);
  }

  // Uzman ataması olmayan (slug'sız, admin değil) personel.
  return (
    <section className="space-y-4">
      <h1 className="font-display text-2xl text-forest">Profilim</h1>
      <p className="text-forest-muted">
        Hesabınıza henüz bir uzman profili atanmamış. Profil düzenlemek için
        yöneticinizle iletişime geçin.
      </p>
    </section>
  );
}
