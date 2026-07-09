import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { listTalepler } from "@/lib/talepler-db";
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  maskeliTelefon,
  uzmanEtiketi,
  type RandevuDurum,
} from "@/lib/talepler";
import { formatDateTR } from "@/lib/blog";
import DurumRozeti from "./DurumRozeti";

export default async function TaleplerListe({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string }>;
}) {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  const slug = staff?.expertSlug ?? null;

  // ?durum= filtresi — yalnız geçerli enum değeri kabul edilir, aksi halde tümü.
  const { durum } = await searchParams;
  const aktifDurum = DURUM_DEGERLERI.find((d) => d === durum);

  const talepler = await listTalepler(slug, aktifDurum);

  // Filtre çipi bağlantısı (aktif çip forest dolu, diğerleri çizgili).
  const cip = (etiket: string, hedefDurum?: RandevuDurum) => {
    const aktif = aktifDurum === hedefDurum;
    const href = hedefDurum
      ? `/panel/talepler?durum=${hedefDurum}`
      : "/panel/talepler";
    return (
      <Link
        key={etiket}
        href={href}
        className={`rounded-full px-3 py-1 text-xs ${
          aktif
            ? "bg-forest text-warm-white"
            : "border border-stone text-forest-muted"
        }`}
      >
        {etiket}
      </Link>
    );
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-forest">Randevu Talepleri</h1>
      </div>

      {slug === null && (
        <p className="mb-6 text-forest-muted text-sm">
          Size özel bir uzman ataması bulunmadığından yalnızca &ldquo;Farketmez&rdquo;
          havuzundaki talepler gösteriliyor.
        </p>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {cip("Tümü", undefined)}
        {DURUM_DEGERLERI.map((d) => cip(DURUM_ETIKETLERI[d], d))}
      </div>

      {talepler.length === 0 ? (
        <p className="text-forest-muted">
          {aktifDurum
            ? "Bu durumda talep yok."
            : "Henüz randevu talebi yok."}
        </p>
      ) : (
        <ul className="space-y-3">
          {talepler.map((t) => (
            <li key={t.id}>
              <Link
                href={`/panel/talepler/${t.id}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-stone bg-warm-white px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="text-forest font-medium">{t.patientName}</p>
                  <p className="text-forest-muted text-sm">
                    {maskeliTelefon(t.patientPhone)} · {uzmanEtiketi(t.expertSlug)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-forest-muted text-sm">
                    {formatDateTR(t.createdAt.toISOString())}
                  </span>
                  <DurumRozeti durum={t.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
