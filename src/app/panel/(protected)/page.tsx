import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { talepSayilari } from "@/lib/talepler-db";
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  RANDEVU_AKSAN_SINIFI,
} from "@/lib/talepler";
import { ServiceIcon } from "@/components/ServiceIcon";

// Not: layout'un title.template'i yalnız ÇOCUK segmentlere uygulanır; bu sayfa
// layout ile AYNI segmentte olduğundan şablonu kendisi alamaz (kök şablona
// düşer: "… | Öz & Saye Psikoloji"). `absolute` tüm şablonları atlayıp diğer
// panel sayfalarıyla tutarlı "… · Panel" başlığını doğrudan verir.
export const metadata: Metadata = { title: { absolute: "Gösterge · Panel" } };

export default async function PanelHome() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  // Kapsamlı sayılar (uzman kendi + "farketmez" havuzu; slug'sız staff → yalnız
  // havuz; admin → tüm talepler).
  const sayilar = await talepSayilari(
    staff?.expertSlug ?? null,
    staff?.role === "admin",
  );

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
            className={`rounded-lg border border-stone border-l-4 ${RANDEVU_AKSAN_SINIFI[d]} bg-warm-white px-5 py-4`}
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
          className="flex items-center gap-4 rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <ServiceIcon name="user" className="h-6 w-6 shrink-0 text-sage" />
          <div>
            <span className="block text-forest font-medium">
              Randevu Talepleri
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              Talepleri görüntüle ve yönet
            </span>
          </div>
        </Link>
        <Link
          href="/panel/blog"
          className="flex items-center gap-4 rounded-lg border border-stone bg-warm-white px-5 py-4"
        >
          <ServiceIcon name="document" className="h-6 w-6 shrink-0 text-sage" />
          <div>
            <span className="block text-forest font-medium">
              Blog Yazıları
            </span>
            <span className="mt-1 block text-forest-muted text-sm">
              Yazı oluştur, düzenle, yayınla
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
