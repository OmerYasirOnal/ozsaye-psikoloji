import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sunucu modu (Vercel). Statik export KALDIRILDI: artık Server Actions,
  // route handler, cookies() ve DB erişimi mümkün.
  trailingSlash: true, // indeksli /yol/ URL'leri korunur
};

export default nextConfig;
