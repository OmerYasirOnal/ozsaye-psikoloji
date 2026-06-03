import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Statik export için route handler statik üretilmeli.
export const dynamic = "force-static";

/**
 * Web App Manifest (app/manifest.ts → /manifest.webmanifest).
 *
 * Marka renkleri palet token'larıyla birebir: background_color warm ivory (#F5F2EB),
 * theme_color forest (#1F3B2E). Arayüz dili Türkçe (lang "tr", dir "ltr").
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F5F2EB",
    theme_color: "#1F3B2E",
    lang: "tr",
    dir: "ltr",
    // Final logo ikonları (beyaz zeminli, brand/logo/final → site_icon). Logoda
    // wordmark olduğu için purpose "any" (maskable kırpması wordmark'ı kesebilir).
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
