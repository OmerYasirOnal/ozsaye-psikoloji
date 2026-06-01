import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // .mdx dosyalarının sayfa/route/import olarak işlenmesi için.
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

// Plugin (remark/rehype) kullanılmıyor — temel kurulum Turbopack ile uyumlu.
const withMDX = createMDX({});

export default withMDX(nextConfig);
