import { DURUM_ETIKETLERI, type RandevuDurum } from "@/lib/talepler";

// Durum rozetleri: yalnız sade marka tonları (metin legible — text-forest /
// text-forest-muted / warm-white; sage aksan). "Yeni" dikkat çekecek şekilde
// dolu forest; kapanmış durumlar (tamam/iptal) sakin çizgili.
const ROZET_SINIF: Record<RandevuDurum, string> = {
  new: "bg-forest text-warm-white",
  contacted: "bg-sage-light text-forest",
  scheduled: "bg-sage text-forest",
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
