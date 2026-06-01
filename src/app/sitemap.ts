import type { MetadataRoute } from "next";

import { getServiceSlugs } from "@/lib/services";
import { absoluteUrl, site } from "@/lib/site";

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
  ];
}
