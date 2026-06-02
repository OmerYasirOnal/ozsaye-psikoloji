import { config } from "./config.js";
import { log } from "./util.js";

// Ollama yerel sunucusuyla konuşur. Ollama'nın çalışıyor olması gerekir:
//   ollama serve   (genellikle arka planda otomatik çalışır)
//   ollama pull <model>

/** Ollama'nın erişilebilir olup olmadığını kontrol eder. */
export async function checkOllama() {
  try {
    const res = await fetch(`${config.ollama.url}/api/tags`);
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}` };
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const hasModel = models.some((m) => m.startsWith(config.ollama.model.split(":")[0]));
    return { ok: true, models, hasModel };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

/**
 * Verilen prompt'u JSON modunda çalıştırır ve ayrıştırılmış nesneyi döndürür.
 */
export async function generateJSON(systemPrompt, userPrompt) {
  const res = await fetch(`${config.ollama.url}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: config.ollama.model,
      system: systemPrompt,
      prompt: userPrompt,
      format: "json", // Ollama'yı geçerli JSON döndürmeye zorlar
      stream: false,
      options: { temperature: config.ollama.temperature },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ollama hatası: HTTP ${res.status} ${text}`);
  }

  const data = await res.json();
  const raw = (data.response || "").trim();

  try {
    return JSON.parse(raw);
  } catch {
    // Bazı modeller JSON dışında metin ekleyebilir; ilk { ... } bloğunu yakala.
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        log.error("JSON ayrıştırılamadı:", e.message);
      }
    }
    throw new Error("Model geçerli JSON döndürmedi.");
  }
}
