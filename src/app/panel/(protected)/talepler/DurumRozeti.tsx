import { DURUM_ETIKETLERI, type RandevuDurum } from "@/lib/talepler";

// Durum rozetleri: yalnız marka yüzeyleri (warm-white/cream/forest) + stone/
// forest çizgi + text-forest/text-forest-muted. `sage` KULLANILMAZ — CLAUDE.md
// "sage yalnızca aksan (ince çizgi/ikon/işaret)" kuralı dolgu-rozete izin vermez
// (bkz. bağımsız review, PR #27). "Yeni" dikkat çekecek şekilde dolu forest;
// ara durumlar forest-çizgili (dolu/boş yüzeyle ayrışır); kapanmış durumlar
// (tamam/iptal) sakin stone-çizgili.
const ROZET_SINIF: Record<RandevuDurum, string> = {
  new: "bg-forest text-warm-white",
  contacted: "border border-forest bg-warm-white text-forest",
  scheduled: "border border-forest bg-cream text-forest",
  done: "border border-stone bg-warm-white text-forest-muted",
  cancelled: "border border-stone bg-cream text-forest-muted",
};

export default function DurumRozeti({ durum }: { durum: RandevuDurum }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs ${ROZET_SINIF[durum]}`}
    >
      {DURUM_ETIKETLERI[durum]}
    </span>
  );
}
