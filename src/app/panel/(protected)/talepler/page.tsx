import type { Metadata } from "next";
import Link from "next/link";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import {
  listPlanliTakvim,
  listTalepler,
  talepSayilari,
} from "@/lib/talepler-db";
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  RANDEVU_AKSAN_SINIFI,
  goreliZaman,
  maskeliTelefon,
  tercihEdilenTarih,
  uzmanEtiketi,
  type RandevuDurum,
} from "@/lib/talepler";
import { ayAraligi, ayParametresi } from "@/lib/takvim";
import { ServiceIcon } from "@/components/ServiceIcon";
import DurumRozeti from "./DurumRozeti";
import TakvimGorunumu from "./TakvimGorunumu";

export const metadata: Metadata = { title: "Randevu Talepleri" };

export default async function TaleplerListe({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; ay?: string }>;
}) {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  const slug = staff?.expertSlug ?? null;
  const isAdmin = staff?.role === "admin";

  // ?durum= filtresi — yalnız geçerli enum değeri kabul edilir, aksi halde tümü.
  const { durum, ay: ayHam } = await searchParams;
  const aktifDurum = DURUM_DEGERLERI.find((d) => d === durum);

  // Takvim: ?ay= varsa açık; geçersiz değer içinde bulunulan aya düşer.
  const ay = ayParametresi(ayHam);
  const { baslangic, bitis } = ayAraligi(ay);
  const [talepler, planliRandevular, sayilar] = await Promise.all([
    listTalepler(slug, isAdmin, aktifDurum),
    listPlanliTakvim(slug, isAdmin, baslangic, bitis),
    talepSayilari(slug, isAdmin),
  ]);
  const toplam = DURUM_DEGERLERI.reduce((t, d) => t + sayilar[d], 0);

  // Filtre çipi bağlantısı (aktif çip forest dolu, diğerleri çizgili). Takvim
  // açıkken (?ay=) tıklandığında ayı korur — aksi halde çip takvimi kapatırdı.
  const cip = (etiket: string, sayi: number, hedefDurum?: RandevuDurum) => {
    const aktif = aktifDurum === hedefDurum;
    const params = new URLSearchParams();
    if (hedefDurum) params.set("durum", hedefDurum);
    if (ayHam !== undefined) params.set("ay", ayHam);
    const qs = params.toString();
    const href = qs ? `/panel/talepler?${qs}` : "/panel/talepler";
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
        {etiket} ({sayi})
      </Link>
    );
  };

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-forest">Randevu Talepleri</h1>
      </div>

      <TakvimGorunumu
        ay={ay}
        acik={ayHam !== undefined}
        aktifDurum={aktifDurum}
        randevular={planliRandevular}
      />

      {slug === null && !isAdmin && (
        <p className="mb-6 text-forest-muted text-sm">
          Size özel bir uzman ataması bulunmadığından yalnızca &ldquo;Fark etmez&rdquo;
          havuzundaki talepler gösteriliyor.
        </p>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {cip("Tümü", toplam, undefined)}
        {DURUM_DEGERLERI.map((d) => cip(DURUM_ETIKETLERI[d], sayilar[d], d))}
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
                className={`flex items-center justify-between gap-4 rounded-lg border border-stone border-l-4 ${RANDEVU_AKSAN_SINIFI[t.status]} bg-warm-white px-5 py-4`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <ServiceIcon
                    name="user"
                    className="h-5 w-5 shrink-0 text-sage"
                  />
                  <div className="min-w-0">
                    <p className="text-forest font-medium">{t.patientName}</p>
                    <p className="text-forest-muted text-sm">
                      {maskeliTelefon(t.patientPhone)} · {uzmanEtiketi(t.expertSlug)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {tercihEdilenTarih(t.preferredNote) && (
                    <span className="rounded-full border border-stone px-2.5 py-0.5 text-xs text-forest-muted">
                      Tercih: {tercihEdilenTarih(t.preferredNote)}
                    </span>
                  )}
                  <span className="text-forest-muted text-sm">
                    {goreliZaman(t.createdAt)}
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
