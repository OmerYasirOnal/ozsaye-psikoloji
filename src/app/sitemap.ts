import type { MetadataRoute } from "next";

import { getServiceSlugs } from "@/lib/services";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, site } from "@/lib/site";

// Sitemap her istekte DB'den üretilir (force-dynamic). Panelden yayınlanan/kaldırılan
// yazılar sitemap'e ANINDA yansır — yeniden deploy gerekmez.
// Neden dinamik (Task 9 üretim `next start` E2E kanıtı): eski `force-static` metadata
// route'u, panel akışının çağırdığı revalidatePath("/sitemap.xml") ile ÜRETİMDE
// tazelenemiyordu — /blog, /blog/[slug] ve anasayfa canlı güncellenirken sitemap build
// anındaki 3 slug'da donuyor, yeni yazılar ancak sonraki deploy'da giriyordu. Sitemap
// trafiği önemsiz (yalnız tarayıcı/crawler) ve sorgu tek ucuz select olduğundan dinamik
// render bedeli ihmal edilebilir; tazelik anında kanıtlanabilir olur.
// Ayrıntı: .superpowers/sdd/task-9-report.md.
export const dynamic = "force-dynamic";

/**
 * Sitemap — indekslenmesi istenen genel sayfalar.
 * noindex sayfalar dahil edilmez: /randevu/tesekkurler (teşekkür sayfası),
 * /kvkk-aydinlatma-metni ve /gizlilik-politikasi (robots index:false).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getAllPosts();
  const lastBlog = posts[0]?.date ? new Date(posts[0].date) : lastModified;

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/hizmetler"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...getServiceSlugs().map((slug) => ({
      url: absoluteUrl(`/hizmetler/${slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: absoluteUrl("/ekip"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...site.experts.map((expert) => ({
      url: absoluteUrl(`/ekip/${expert.slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified: lastBlog,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
