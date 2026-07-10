import Link from "next/link";
import { istanbulGunAnahtari, type RandevuDurum } from "@/lib/talepler";
import {
  HAFTA_GUNLERI,
  ayDegeri,
  ayEtiketi,
  ayIzgarasi,
  gunAnahtariOlustur,
  oncekiAy,
  sonrakiAy,
  type TakvimAyi,
} from "@/lib/takvim";
import { ServiceIcon } from "@/components/ServiceIcon";

type Randevu = {
  id: string;
  patientName: string;
  scheduledAt: Date | null;
  expertSlug: string | null;
};

/** "Ayşe Kaya" → "Ayşe K." — hücre taşmasın. */
function adKisalt(ad: string): string {
  const parcalar = ad.trim().split(/\s+/);
  if (parcalar.length < 2) return ad;
  const son = parcalar[parcalar.length - 1];
  return `${parcalar.slice(0, -1).join(" ")} ${son.charAt(0)}.`;
}

function istanbulSaat(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

/**
 * Açılır-kapanır ajanda: native <details> (JS'siz, erişilebilir). Ay gezintisi
 * ?ay= linkiyle (sunucu bileşeni); ay parametresi varken açık kalır. Günde
 * en fazla 3 randevu adı, fazlası "+N".
 */
export default function TakvimGorunumu({
  ay,
  acik,
  aktifDurum,
  randevular,
}: {
  ay: TakvimAyi;
  acik: boolean;
  aktifDurum?: RandevuDurum;
  randevular: Randevu[];
}) {
  // Randevuları İstanbul gününe bazla.
  const gunlere = new Map<string, Randevu[]>();
  for (const r of randevular) {
    if (!r.scheduledAt) continue;
    const anahtar = istanbulGunAnahtari(r.scheduledAt);
    const liste = gunlere.get(anahtar) ?? [];
    liste.push(r);
    gunlere.set(anahtar, liste);
  }

  const bugunAnahtari = istanbulGunAnahtari(new Date());
  const durumEki = aktifDurum ? `&durum=${aktifDurum}` : "";
  const ayLinki = (a: TakvimAyi) =>
    `/panel/talepler?ay=${ayDegeri(a)}${durumEki}`;

  return (
    <details
      open={acik}
      className="mb-8 rounded-lg border border-stone bg-warm-white"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-forest [&::-webkit-details-marker]:hidden">
        <ServiceIcon name="calendar" className="h-5 w-5 shrink-0 text-sage" />
        <span className="font-medium">Takvim görünümü</span>
        <span className="ml-auto text-forest-muted text-sm">aç / kapat</span>
      </summary>

      <div className="border-t border-stone px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={ayLinki(oncekiAy(ay))}
            className="rounded-md border border-stone px-3 py-1.5 text-sm text-forest-muted"
            aria-label="Önceki ay"
          >
            ←
          </Link>
          <h2 className="font-display text-lg text-forest">{ayEtiketi(ay)}</h2>
          <Link
            href={ayLinki(sonrakiAy(ay))}
            className="rounded-md border border-stone px-3 py-1.5 text-sm text-forest-muted"
            aria-label="Sonraki ay"
          >
            →
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-stone bg-stone">
          {HAFTA_GUNLERI.map((g) => (
            <div
              key={g}
              className="bg-cream px-1 py-1.5 text-center text-xs font-semibold text-forest-muted"
            >
              {g}
            </div>
          ))}
          {ayIzgarasi(ay).flat().map((gun, i) => {
            if (gun === null) {
              return <div key={`bos-${i}`} className="min-h-20 bg-cream" />;
            }
            const anahtar = gunAnahtariOlustur(ay, gun);
            const gununRandevulari = gunlere.get(anahtar) ?? [];
            const bugun = anahtar === bugunAnahtari;
            return (
              <div key={anahtar} className="min-h-20 bg-warm-white p-1">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    bugun
                      ? "bg-forest font-semibold text-warm-white"
                      : "text-forest-muted"
                  }`}
                >
                  {gun}
                </span>
                <ul className="mt-0.5 space-y-0.5">
                  {gununRandevulari.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/panel/talepler/${r.id}`}
                        className="block truncate rounded bg-cream px-1 py-0.5 text-xs text-forest"
                        title={r.patientName}
                      >
                        {r.scheduledAt ? `${istanbulSaat(r.scheduledAt)} ` : ""}
                        {adKisalt(r.patientName)}
                      </Link>
                    </li>
                  ))}
                  {gununRandevulari.length > 3 && (
                    <li className="px-1 text-xs text-forest-muted">
                      +{gununRandevulari.length - 3}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
