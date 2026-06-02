import type { MetadataRoute } from "next";

import { getServiceSlugs } from "@/lib/services";
import { getPostSlugs } from "@/lib/blog";
import { absoluteUrl, site } from "@/lib/site";

// Statik export için route handler statik üretilmeli.
export const dynamic = "force-static";

/**
 * Sitemap — indekslenmesi istenen genel sayfalar.
 * noindex sayfalar dahil edilmez: /randevu/tesekkurler (teşekkür sayfası),
 * /kvkk-aydinlatma-metni ve /gizlilik-politikasi (robots index:false).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

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
      url: absoluteUrl("/yazilar"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...getPostSlugs().map((slug) => ({
      url: absoluteUrl(`/yazilar/${slug}`),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
