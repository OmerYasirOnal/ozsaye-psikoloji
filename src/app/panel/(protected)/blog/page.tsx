import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ServiceIcon } from "@/components/ServiceIcon";
import { verifySession } from "@/lib/auth/dal";
import { listPostsAdmin } from "@/lib/blog-admin";
import { formatDateTR } from "@/lib/blog";

export const metadata: Metadata = { title: "Blog Yazıları" };

export default async function PanelBlogListesi() {
  await verifySession(); // DAL cache'li — layout zaten çağırdı, bedava
  const posts = await listPostsAdmin();

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl text-forest">Blog Yazıları</h1>
        <Link
          href="/panel/blog/yeni"
          className="rounded-md bg-forest px-4 py-2 text-sm text-warm-white"
        >
          Yeni Yazı
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-forest-muted">
          Henüz yazı yok — ilk yazınızı ekleyin.
        </p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className={`flex items-center justify-between gap-4 rounded-lg border border-stone border-l-4 ${
                post.status === "published" ? "border-l-forest" : "border-l-stone"
              } bg-warm-white px-5 py-4`}
            >
              <div className="flex min-w-0 items-center gap-4">
                {post.coverImageUrl ? (
                  <Image
                    src={post.coverImageUrl}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-cream">
                    <ServiceIcon name="document" className="h-6 w-6 text-sage" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-forest font-medium">{post.title}</p>
                  <p className="text-forest-muted text-sm">
                    {post.category} · {formatDateTR(post.updatedAt.toISOString())}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {post.status === "published" ? (
                  <span className="rounded-full bg-forest px-3 py-1 text-xs text-warm-white">
                    yayında
                  </span>
                ) : (
                  <span className="rounded-full border border-stone px-3 py-1 text-xs text-forest-muted">
                    taslak
                  </span>
                )}
                <Link
                  href={`/panel/blog/${post.id}/duzenle`}
                  className="text-forest-muted text-sm underline"
                >
                  Düzenle
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
