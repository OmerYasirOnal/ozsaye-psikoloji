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
    // Node tabanlı build/otomasyon araçları (uygulama kodu değil):
    "scripts/**",
    "tools/**",
    // Gitignore'lu yerel build artefaktları (eski cPanel denemesi vb.).
    "deploy/**",
  ]),
]);

export default eslintConfig;
