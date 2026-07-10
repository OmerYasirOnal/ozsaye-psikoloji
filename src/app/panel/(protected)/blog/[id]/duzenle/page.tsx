import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getPostByIdAdmin } from "@/lib/blog-admin";
import PostForm from "../../PostForm";
import { updatePost, setPostStatus } from "../../actions";

export const metadata: Metadata = { title: "Yazıyı Düzenle" };

export default async function YaziDuzenlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kaydedildi?: string }>;
}) {
  await verifySession(); // DAL cache'li — layout zaten çağırdı, bedava
  const { id } = await params;
  // Bozuk id (UUID değil) doğrudan getPostByIdAdmin'e gitmemeli — ham Postgres
  // UUID cast hatası (500) yerine 404. Kardeş action'lardaki z.uuid() ile aynı.
  if (!z.uuid().safeParse(id).success) notFound();
  const post = await getPostByIdAdmin(id);
  if (!post) notFound();

  const { kaydedildi } = await searchParams;

  // DB → PostForm initial. tags text[] → virgülle ayrık string (etiketler input'u).
  const initial = {
    baslik: post.title,
    slug: post.slug,
    kategori: post.category,
    etiketler: post.tags.join(", "),
    ozet: post.excerpt ?? "",
    icerik: post.bodyMarkdown,
  };

  const yayinda = post.status === "published";

  return (
    <section>
      <div className="mb-8">
        <h1 className="font-display text-2xl text-forest">Yazıyı Düzenle</h1>
        <p className="mt-1 text-forest-muted text-sm">
          Durum: {yayinda ? "Yayında" : "Taslak"}
          {yayinda && (
            <>
              {" · "}
              <Link href={`/blog/${post.slug}/`} className="underline">
                Sitede görüntüle
              </Link>
            </>
          )}
        </p>
      </div>

      {kaydedildi && (
        <p className="mb-6 text-forest-muted" role="status">
          Kaydedildi.
        </p>
      )}

      {/* Düzenleme formu. Gizli id, PostForm'un <form>'u İÇİNDE render edilir
          (children slot'u form içinde) — updatePost id'yi formData'dan okur. */}
      <PostForm action={updatePost} initial={initial} submitLabel="Kaydet">
        <input type="hidden" name="id" value={id} />
      </PostForm>

      {/* Durum formu AYRI ve PostForm'un <form>'unun DIŞINDA: HTML iç içe <form>
          yasağı (PostForm children slot'u kendi formunun içinde). */}
      <form
        action={setPostStatus}
        className="mt-6 border-t border-stone pt-6"
      >
        <input type="hidden" name="id" value={id} />
        {yayinda ? (
          <>
            <input type="hidden" name="durum" value="draft" />
            <button
              type="submit"
              className="rounded-md border border-stone px-5 py-3 text-forest-muted"
            >
              Taslağa çek
            </button>
          </>
        ) : (
          <>
            <input type="hidden" name="durum" value="published" />
            <button
              type="submit"
              className="rounded-md bg-forest px-5 py-3 text-warm-white"
            >
              Yayınla
            </button>
          </>
        )}
      </form>
    </section>
  );
}
