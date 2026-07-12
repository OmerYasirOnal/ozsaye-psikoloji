import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sunucu modu (Vercel). Statik export KALDIRILDI: artık Server Actions,
  // route handler, cookies() ve DB erişimi mümkün.
  trailingSlash: true, // indeksli /yol/ URL'leri korunur
  images: {
    // Blog kapak görselleri prod'da Vercel Blob'dan gelir (mağaza-id'ye göre
    // değişen alt alan adı) — next/image optimizasyon boru hattının çalışması
    // (unoptimized olmadan) için gerekli.
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
