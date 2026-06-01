import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/**
 * Sitemap — indekslenmesi istenen genel sayfalar.
 * /randevu/tesekkurler dahil edilmez (noindex teşekkür sayfası).
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
      url: absoluteUrl("/kvkk-aydinlatma-metni"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/gizlilik-politikasi"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
