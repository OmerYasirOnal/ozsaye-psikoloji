import { DURUM_ETIKETLERI, type RandevuDurum } from "@/lib/talepler";

// İş akışı hattı — İptal hat DIŞI (ayrı rozet/aksiyonla gösterilir).
const AKIS = ["new", "contacted", "scheduled", "done"] as const;

/**
 * Yatay durum adım göstergesi. Renkler DurumRozeti'nin forest/stone
 * ailesinden: geçilen/mevcut adım forest dolu, gelecekler stone çizgili.
 * cancelled: hat soluklaşır, yanında "İptal edildi" rozeti görünür.
 */
export default function DurumAdimlari({ durum }: { durum: RandevuDurum }) {
  const iptal = durum === "cancelled";
  const aktifIdx = iptal ? -1 : AKIS.indexOf(durum as (typeof AKIS)[number]);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Durum akışı">
      <ol className={`flex items-center ${iptal ? "opacity-50" : ""}`}>
        {AKIS.map((adim, i) => {
          const gecildi = aktifIdx >= 0 && i <= aktifIdx;
          return (
            <li key={adim} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`mx-1 h-px w-5 sm:w-8 ${
                    gecildi ? "bg-forest" : "bg-stone"
                  }`}
                />
              )}
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                  gecildi
                    ? "bg-forest text-warm-white"
                    : "border border-stone text-forest-muted"
                }`}
                aria-current={i === aktifIdx ? "step" : undefined}
              >
                {DURUM_ETIKETLERI[adim]}
              </span>
            </li>
          );
        })}
      </ol>
      {iptal && (
        <span className="rounded-full border border-stone bg-cream px-2.5 py-1 text-xs text-forest-muted">
          İptal edildi
        </span>
      )}
    </div>
  );
}
