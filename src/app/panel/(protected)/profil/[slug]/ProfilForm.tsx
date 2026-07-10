"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import {
  profilKaydet,
  profilFotoAyarla,
  type ProfilFormState,
} from "../actions";

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
  imageUrl: string | null;
  initial: ProfilInitial;
};

const bos: ProfilFormState = {};

// Profil fotoğrafı bölümü — kendi action'ıyla (profilFotoAyarla), ana içerik
// formundan (profilKaydet) AYRI iki form. Görsel önce endpoint'e yüklenir,
// dönen url gizli input'a yazılıp form programatik submit edilir; "Kaldır"
// butonu boş url'li ikinci formu gönderir. HizliAksiyonlar'ın çok-formlu
// (tek useActionState) desenini yansıtır.
function FotoBolumu({
  slug,
  imageUrl,
}: {
  slug: string;
  imageUrl: string | null;
}) {
  const [state, fotoAction] = useActionState(profilFotoAyarla, bos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const ayarlaFormRef = useRef<HTMLFormElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleImageSelected(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosyanın tekrar seçilebilmesi için sıfırla
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("dosya", file); // endpoint alan adı: "dosya"
      // trailingSlash:true — sonu "/" olan URL'e POST (308 yönlendirmesi olmadan).
      const res = await fetch("/panel/profil/gorsel/", {
        method: "POST",
        body: formData,
      });
      const data: { url?: string; hata?: string } | null = await res
        .json()
        .catch(() => null);
      if (!res.ok || !data?.url) {
        setUploadError(data?.hata ?? "Görsel yüklenemedi. Lütfen tekrar deneyin.");
        return;
      }
      // Dönen url'i gizli input'a yaz ve ayarla formunu programatik gönder.
      if (urlInputRef.current) urlInputRef.current.value = data.url;
      ayarlaFormRef.current?.requestSubmit();
    } catch {
      setUploadError("Görsel yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-stone bg-cream p-5">
      <h2 className="text-forest font-medium">Profil fotoğrafı</h2>

      <div className="flex items-start gap-5">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt="Mevcut profil fotoğrafı"
            width={96}
            height={120}
            unoptimized
            className="rounded-md border border-stone object-cover"
          />
        ) : (
          <div className="flex h-[120px] w-24 items-center justify-center rounded-md border border-stone bg-warm-white text-center text-sm text-forest-muted">
            Fotoğraf yok
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-stone px-4 py-2 text-sm text-forest disabled:opacity-60"
          >
            {uploading ? "Yükleniyor…" : "Fotoğraf yükle"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleImageSelected}
          />

          {/* Ayarla formu: url gizli input'a yüklemeden sonra yazılır. */}
          <form ref={ayarlaFormRef} action={fotoAction} className="hidden">
            <input type="hidden" name="slug" value={slug} />
            <input ref={urlInputRef} type="hidden" name="url" defaultValue="" />
          </form>

          {/* Kaldır formu: boş url ile aynı action'a submit (→ imageUrl null). */}
          {imageUrl && (
            <form action={fotoAction}>
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="url" value="" />
              <button
                type="submit"
                className="rounded-md border border-stone px-4 py-2 text-sm text-forest-muted"
              >
                Fotoğrafı kaldır
              </button>
            </form>
          )}

          <p className="text-forest-muted text-sm">
            PNG, JPEG veya WebP · en fazla 4 MB.
          </p>
        </div>
      </div>

      {uploadError && (
        <p role="alert" className="text-sm font-semibold text-forest">
          {uploadError}
        </p>
      )}
      {state.hata && (
        <p role="alert" className="text-sm font-semibold text-forest">
          {state.hata}
        </p>
      )}
    </div>
  );
}

export default function ProfilForm({ slug, imageUrl, initial }: Props) {
  const [state, formAction, pending] = useActionState(profilKaydet, bos);

  return (
    <div className="space-y-6">
      <FotoBolumu slug={slug} imageUrl={imageUrl} />

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
    </div>
  );
}
