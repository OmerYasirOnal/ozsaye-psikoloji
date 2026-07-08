import type { MetadataRoute } from "next";

import { getServiceSlugs } from "@/lib/services";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl, site } from "@/lib/site";

// Sitemap performans için statik üretilir (build anında bir kez). Statik export
// KALKTI; force-static artık yalnızca performans tercihi.
// DİKKAT (Task 9 E2E'de üretim `next start` üzerinde doğrulandı): panel
// yayınla/taslağa-çek/düzenle akışının çağırdığı revalidatePath("/sitemap.xml")
// bu force-static metadata route'unu ÜRETİMDE tazelemiyor — /blog, /blog/[slug]
// ve anasayfa canlı güncellenirken sitemap build anındaki içerikte donuyor; yeni
// yazılar sitemap'e ancak sonraki deploy/build ile giriyor. İnsan yüzü sayfalar
// etkilenmez, yalnızca sitemap.xml gecikir. Çözüm (force-static'i kaldırıp ISR'e
// almak vb.) controller kararına bırakıldı — ayrıntı: .superpowers/sdd/task-9-report.md.
export const dynamic = "force-static";

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
