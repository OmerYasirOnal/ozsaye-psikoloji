"use client";

import { useActionState } from "react";
import { profilKaydet, type ProfilFormState } from "../actions";

type ProfilInitial = {
  bio: string;
  credentialsLine: string;
  university: string;
  membership: string;
  degrees: string;
  certifications: string;
  areas: string;
  sameAs: string;
};

type Props = {
  slug: string;
  initial: ProfilInitial;
};

const bos: ProfilFormState = {};

export default function ProfilForm({ slug, initial }: Props) {
  const [state, formAction, pending] = useActionState(profilKaydet, bos);

  return (
    <form action={formAction} className="space-y-6">
      {state.hata && (
        <p className="font-semibold text-forest" role="alert">
          {state.hata}
        </p>
      )}
      {state.ok && (
        <p className="text-forest-muted" role="status">
          Kaydedildi — /ekip sayfası güncellendi.
        </p>
      )}

      <input type="hidden" name="slug" value={slug} />

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-forest font-medium">
          Biyografi
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={6}
          maxLength={4000}
          defaultValue={initial.bio}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="credentialsLine" className="text-forest font-medium">
          Kart tanıtım satırı
        </label>
        <input
          id="credentialsLine"
          name="credentialsLine"
          type="text"
          maxLength={300}
          defaultValue={initial.credentialsLine}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="university" className="text-forest font-medium">
          Üniversite
        </label>
        <input
          id="university"
          name="university"
          type="text"
          maxLength={300}
          defaultValue={initial.university}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="membership" className="text-forest font-medium">
          Üyelik
        </label>
        <input
          id="membership"
          name="membership"
          type="text"
          maxLength={300}
          defaultValue={initial.membership}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="degrees" className="text-forest font-medium">
          Diplomalar
        </label>
        <textarea
          id="degrees"
          name="degrees"
          rows={4}
          maxLength={4000}
          defaultValue={initial.degrees}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
        <p className="text-forest-muted text-sm">Her satıra bir madde.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="certifications" className="text-forest font-medium">
          Sertifikalar
        </label>
        <textarea
          id="certifications"
          name="certifications"
          rows={4}
          maxLength={4000}
          defaultValue={initial.certifications}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
        <p className="text-forest-muted text-sm">Her satıra bir madde.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="areas" className="text-forest font-medium">
          Çalışma alanları
        </label>
        <textarea
          id="areas"
          name="areas"
          rows={4}
          maxLength={4000}
          defaultValue={initial.areas}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
        <p className="text-forest-muted text-sm">Her satıra bir madde.</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sameAs" className="text-forest font-medium">
          Profil bağlantıları
        </label>
        <textarea
          id="sameAs"
          name="sameAs"
          rows={4}
          maxLength={4000}
          defaultValue={initial.sameAs}
          className="rounded-md border border-stone bg-warm-white px-4 py-3 text-forest"
        />
        <p className="text-forest-muted text-sm">Her satıra bir madde.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-forest px-5 py-3 text-warm-white disabled:opacity-60"
      >
        {pending ? "Kaydediliyor…" : "Profili kaydet"}
      </button>
    </form>
  );
}
