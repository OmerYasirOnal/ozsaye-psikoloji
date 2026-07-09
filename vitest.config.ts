import { configDefaults, defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // DB'ye dokunan entegrasyon testleri seri koşsun (aynı tablolar)
    fileParallelism: false,
    // Claude Code subagent worktree'leri (.claude/worktrees/*) tam repo kopyası
    // içerir; hariç tutulmazsa vitest onların testlerini de toplar — sayılar
    // şişer ve yanlış-branch kodu koşar (eslint'teki ".claude/**" ignore'unun
    // test karşılığı).
    exclude: [...configDefaults.exclude, "**/.claude/**"],
  },
  resolve: {
    // Testlerin de üretim koduyla aynı "@/*" -> "src/*" alias'ını çözebilmesi için
    // (tsconfig'deki paths yalnız TS derleyicisi/Next içindir, Vitest'i etkilemez).
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
