import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statik HTML çıktısı üretir (out/ klasörü) — GoDaddy gibi
  // Apache/PHP tabanlı (WordPress) paylaşımlı hosting üzerinde Node.js
  // çalıştırmadan barındırılabilir.
  output: "export",

  // Apache/statik barındırmada /yol/ -> /yol/index.html eşlemesi için
  // her sayfa kendi klasörü altında index.html olarak üretilir.
  trailingSlash: true,

  // Statik dışa aktarımda next/image optimizasyon sunucusu olmadığı için
  // görseller olduğu gibi servis edilir.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
