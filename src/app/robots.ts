import type { MetadataRoute } from "next";
import { site, absoluteUrl } from "@/lib/site";

// Statik export (output: "export") için route handler statik üretilmeli.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Gerçek veri girilip `site.dataReady` true yapılana kadar placeholder içeriğin
  // indekslenmemesi için tüm taramayı engelle (YMYL — yanlış ilk izlenim riski).
  if (!site.dataReady) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: site.url,
  };
}
