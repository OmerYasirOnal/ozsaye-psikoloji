import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // DB'ye dokunan entegrasyon testleri seri koşsun (aynı tablolar)
    fileParallelism: false,
  },
  resolve: {
    // Testlerin de üretim koduyla aynı "@/*" -> "src/*" alias'ını çözebilmesi için
    // (tsconfig'deki paths yalnız TS derleyicisi/Next içindir, Vitest'i etkilemez).
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
