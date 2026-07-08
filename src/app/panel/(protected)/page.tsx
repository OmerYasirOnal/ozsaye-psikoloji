import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";

export default async function PanelHome() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);

  return (
    <section>
      <h1 className="font-display text-2xl text-forest mb-2">
        Merhaba, {staff?.name ?? session.email}
      </h1>
      <p className="text-forest-muted">
        Randevu talepleri buraya gelecek (Faz 2).
      </p>

      <Link
        href="/panel/blog"
        className="mt-8 block rounded-lg border border-stone bg-warm-white px-5 py-4"
      >
        <span className="block text-forest font-medium">Blog Yazıları</span>
        <span className="mt-1 block text-forest-muted text-sm">
          Yazı oluştur, düzenle, yayınla
        </span>
      </Link>
    </section>
  );
}
