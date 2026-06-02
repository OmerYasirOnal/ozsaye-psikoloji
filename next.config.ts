import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .mdx dosyalarının sayfa/route/import olarak işlenmesi için.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Statik HTML çıktısı (out/) — GoDaddy paylaşımlı hosting'e FTP ile yüklenir,
  // Apache statik servis eder. Randevu formu Server Action yerine public/randevu.php
  // (PHP) ile çalışır.
  output: "export",
  // Apache statik barındırmada /yol/ -> /yol/index.html eşlemesi için.
  trailingSlash: true,
  // Statik export'ta next/image optimizasyon sunucusu yok.
  images: { unoptimized: true },
};

// Plugin (remark/rehype) kullanılmıyor — temel kurulum Turbopack ile uyumlu.
const withMDX = createMDX({});

export default withMDX(nextConfig);
