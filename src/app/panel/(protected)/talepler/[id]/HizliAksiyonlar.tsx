"use client";

import { useActionState } from "react";
import { izinliGecis, type RandevuDurum } from "@/lib/talepler";
import { talebiDurumIlerlet, type TalepFormState } from "../actions";

const bos: TalepFormState = {};

// Duruma göre birincil tek tık aksiyon (izinliGecis beyaz listesiyle uyumlu;
// sunucu yine de doğrular). "Planlandı" tarih istediği için burada yok.
const BIRINCIL: Partial<Record<RandevuDurum, { hedef: RandevuDurum; etiket: string }>> = {
  new: { hedef: "contacted", etiket: "Arandı olarak işaretle" },
  scheduled: { hedef: "done", etiket: "Tamamlandı olarak işaretle" },
};

export default function HizliAksiyonlar({
  id,
  durum,
}: {
  id: string;
  durum: RandevuDurum;
}) {
  const [state, formAction, pending] = useActionState(talebiDurumIlerlet, bos);

  const birincil = BIRINCIL[durum];
  const iptalEdilebilir = izinliGecis(durum, "cancelled");
  if (!birincil && !iptalEdilebilir && durum !== "contacted") return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {birincil && (
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="hedef" value={birincil.hedef} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-forest px-4 py-2 text-sm text-warm-white disabled:opacity-60"
            >
              {pending ? "Kaydediliyor…" : birincil.etiket}
            </button>
          </form>
        )}
        {durum === "contacted" && (
          <p className="text-forest-muted text-sm">
            Planlamak için aşağıdaki formdan tarih seçin.
          </p>
        )}
        {iptalEdilebilir && (
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="hedef" value="cancelled" />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-stone px-4 py-2 text-sm text-forest-muted disabled:opacity-60"
            >
              İptal et
            </button>
          </form>
        )}
      </div>
      {state.hata && (
        <p role="alert" className="text-sm font-semibold text-forest">
          {state.hata}
        </p>
      )}
    </div>
  );
}
