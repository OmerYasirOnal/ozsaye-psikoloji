import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { talepSayilari } from "@/lib/talepler-db";
import { DURUM_DEGERLERI, DURUM_ETIKETLERI } from "@/lib/talepler";

export default async function PanelHome() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  // Kapsamlı sayılar (uzman kendi + "farketmez" havuzu; slug'sız staff → yalnız havuz).
  const sayilar = await talepSayilari(staff?.expertSlug ?? null);

  return (
    <section>
      <h1 className="font-display text-2xl text-forest mb-2">
        Merhaba, {staff?.name ?? session.email}
      </h1>
      <p className="text-forest-muted">
        Randevu taleplerinizin özeti — bir duruma tıklayarak listeye gidin.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {DURUM_DEGERLERI.map((d) => (
          <Link
            key={d}
            href={`/panel/talepler?durum=${d}`}
            className="rounded-lg border border-stone bg-warm-white px-5 py-4"
          >
            <span className="block font-display text-3xl text-forest">
              {sayilar[d]}
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              {DURUM_ETIKETLERI[d]}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Link
          href="/panel/talepler"
          className="block rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <span className="block text-forest font-medium">
            Randevu Talepleri
          </span>
          <span className="mt-1 block text-forest-muted text-sm">
            Talepleri görüntüle ve yönet
          </span>
        </Link>
        <Link
          href="/panel/blog"
          className="block rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <span className="block text-forest font-medium">Blog Yazıları</span>
          <span className="mt-1 block text-forest-muted text-sm">
            Yazı oluştur, düzenle, yayınla
          </span>
        </Link>
      </div>
    </section>
  );
}
