import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statik HTML çıktısı (out/) — GoDaddy paylaşımlı hosting'e FTP ile yüklenir,
  // Apache statik servis eder. Randevu formu Server Action yerine public/randevu.php
  // (PHP) ile çalışır.
  output: "export",
  // Apache statik barındırmada /yol/ -> /yol/index.html eşlemesi için.
  trailingSlash: true,
  // Statik export'ta next/image optimizasyon sunucusu yok.
  images: { unoptimized: true },
};

export default nextConfig;
