"use client";

import {
  useActionState,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { slugify } from "@/lib/slug";
import Editor from "./Editor";
import type { FormState } from "./actions";

export type PostFormInitial = {
  baslik?: string;
  slug?: string;
  kategori?: string;
  etiketler?: string;
  ozet?: string;
  icerik?: string;
};

type Props = {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  initial?: PostFormInitial;
  submitLabel: string;
  children?: ReactNode;
};

const emptyState: FormState = {};

export default function PostForm({
  action,
  initial,
  submitLabel,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, emptyState);

  // Kontrollü alanlar: doğrulama hatasında (redirect olmayan) değerler korunur.
  const [baslik, setBaslik] = useState(initial?.baslik ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [kategori, setKategori] = useState(initial?.kategori ?? "Yazı");
  const [etiketler, setEtiketler] = useState(initial?.etiketler ?? "");
  const [ozet, setOzet] = useState(initial?.ozet ?? "");
  const [icerik, setIcerik] = useState(initial?.icerik ?? "");

  // Slug elle düzenlenince başlık→slug otomatik senkronu KALICI olarak kapanır.
  // Var olan bir slug'la açıldıysak (düzenleme) elle sayılır — üzerine yazma.
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));

  function onBaslikChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setBaslik(value);
    if (!slugEdited) setSlug(slugify(value));
  }

  function onSlugChange(e: ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true);
    setSlug(e.target.value);
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.hata && (
        <p className="font-semibold text-forest" role="alert">
          {state.hata}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="baslik" className="text-forest font-medium">
          Başlık
        </label>
        <input
          id="baslik"
          name="baslik"
          value={baslik}
          onChange={onBaslikChange}
          required
          className="rounded-md border border-stone bg-warm-white px-4 py-3"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="slug" className="text-forest font-medium">
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          value={slug}
          onChange={onSlugChange}
          className="rounded-md border border-stone bg-warm-white px-4 py-3"
        />
        <p className="text-forest-muted text-sm">/blog/{slug || "…"}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="kategori" className="text-forest font-medium">
            Kategori
          </label>
          <input
            id="kategori"
            name="kategori"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="rounded-md border border-stone bg-warm-white px-4 py-3"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="etiketler" className="text-forest font-medium">
            Etiketler (virgülle ayırın)
          </label>
          <input
            id="etiketler"
            name="etiketler"
            value={etiketler}
            onChange={(e) => setEtiketler(e.target.value)}
            placeholder="kaygı, terapi, öz-bakım"
            className="rounded-md border border-stone bg-warm-white px-4 py-3"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="ozet" className="text-forest font-medium">
          Özet
        </label>
        <textarea
          id="ozet"
          name="ozet"
          rows={3}
          value={ozet}
          onChange={(e) => setOzet(e.target.value)}
          className="rounded-md border border-stone bg-warm-white px-4 py-3"
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-forest font-medium">İçerik</span>
        <Editor initialMarkdown={initial?.icerik ?? ""} onChange={setIcerik} />
        {/* Editor markdown'ı state'e yazar; gizli alan formData'ya taşır. */}
        <input type="hidden" name="icerik" value={icerik} />
      </div>

      {children}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-forest px-5 py-3 text-warm-white disabled:opacity-60"
        >
          {pending ? "Kaydediliyor…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
