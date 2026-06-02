import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .mdx dosyalarının sayfa/route/import olarak işlenmesi için.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  // Self-host (GoDaddy cPanel Node.js App / Passenger) için kendine yeterli
  // sunucu çıktısı: .next/standalone/server.js (minimal node_modules ile).
  // Vercel gibi platformlarda yok sayılır.
  output: "standalone",
};

// Plugin (remark/rehype) kullanılmıyor — temel kurulum Turbopack ile uyumlu.
const withMDX = createMDX({});

export default withMDX(nextConfig);
