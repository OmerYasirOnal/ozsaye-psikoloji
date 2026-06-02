import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Node tabanlı build araçları (uygulama kodu değil):
    "scripts/**",
    // Otomatik içerik sistemi — kendi Node projesi, ayrı çalışır:
    "automation/**",
  ]),
]);

export default eslintConfig;
