"use client";

import { useActionState } from "react";
import {
  DURUM_DEGERLERI,
  DURUM_ETIKETLERI,
  type RandevuDurum,
} from "@/lib/talepler";
import { talebiGuncelle, type TalepFormState } from "../actions";

type Props = {
  id: string;
  durum: RandevuDurum;
  planlananInitial: string; // datetime-local değeri (İstanbul yereli) veya ""
  icNotInitial: string;
};

const bos: TalepFormState = {};

export default function TalepDuzenleForm({
  id,
  durum,
  planlananInitial,
  icNotInitial,
}: Props) {
  const [state, formAction, pending] = useActionState(talebiGuncelle, bos);

  return (
    <form action={formAction} className="space-y-6">
      {state.hata && (
        <p className="font-semibold text-forest" role="alert">
          {state.hata}
        </p>
      )}
      {state.ok && (
        <p className="text-forest-muted" role="status">
          Kaydedildi.
        </p>
      )}

      <input type="hidden" name="id" value={id} />

      <div className="flex flex-col gap-2">
        <label htmlFor="durum" className="text-forest font-medium">
          Durum
        </label>
        <select
          id="durum"
          name="durum"
          defaultValue={durum}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        >
          {DURUM_DEGERLERI.map((d) => (
            <option key={d} value={d}>
              {DURUM_ETIKETLERI[d]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="planlanan" className="text-forest font-medium">
          Planlanan tarih
        </label>
        <input
          id="planlanan"
          name="planlanan"
          type="datetime-local"
          defaultValue={planlananInitial}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
        <p className="text-forest-muted text-sm">
          Türkiye saati. Boş bırakılırsa planlanan tarih temizlenir.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="icNot" className="text-forest font-medium">
          İç not (yalnızca uzmanlar görür)
        </label>
        <textarea
          id="icNot"
          name="icNot"
          rows={4}
          maxLength={2000}
          defaultValue={icNotInitial}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest-muted"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-forest px-5 py-3 text-warm-white disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Talebi güncelle"}
      </button>
    </form>
  );
}
