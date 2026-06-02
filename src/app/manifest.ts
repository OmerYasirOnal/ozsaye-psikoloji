import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// Statik export için route handler statik üretilmeli.
export const dynamic = "force-static";

/**
 * Web App Manifest (app/manifest.ts → /manifest.webmanifest).
 *
 * Marka renkleri palet token'larıyla birebir: background_color cream (#F3EFE6),
 * theme_color forest (#23472E). Arayüz dili Türkçe (lang "tr", dir "ltr").
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#F3EFE6",
    theme_color: "#23472E",
    lang: "tr",
    dir: "ltr",
    // TODO: GERÇEK VERİ -- Gerçek maskable PNG ikonlar eklenecek (örn. 192x192 ve
    // 512x512, purpose "any" + "maskable"). Şimdilik yalnızca mevcut favicon.ico
    // referanslanıyor; PNG ikonlar üretilince aşağıdaki diziye eklenmeli:
    //   { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" }
    //   { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
