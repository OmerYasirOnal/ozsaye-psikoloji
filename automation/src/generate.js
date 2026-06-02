import { config } from "./config.js";
import { log, slugify, isoDate } from "./util.js";
import { checkOllama, generateJSON } from "./llm.js";
import { SYSTEM_PROMPT, buildContentPrompt, BRAND } from "./prompts.js";
import { pickTopic } from "./topics.js";
import { saveItem, loadState, saveState } from "./queue.js";

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => String(t).replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);
}

function normalizeHashtags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => {
      const s = String(t).trim().replace(/\s+/g, "");
      return s.startsWith("#") ? s : `#${s}`;
    })
    .filter((t) => t.length > 1)
    .slice(0, 8);
}

/**
 * Tek bir içerik taslağı üretir ve inceleme kuyruğuna (pending) ekler.
 * @param {string} [topicOverride] Belirli bir konu zorlamak için
 */
export async function generateOne(topicOverride) {
  const health = await checkOllama();
  if (!health.ok) {
    throw new Error(
      `Ollama'ya bağlanılamadı (${config.ollama.url}): ${health.reason}\n` +
        `Ollama kurulu ve çalışıyor mu? 'ollama serve' ve 'ollama pull ${config.ollama.model}'`,
    );
  }
  if (health.hasModel === false) {
    log.warn(
      `'${config.ollama.model}' modeli bulunamadı. Şu modeller var: ${health.models.join(", ") || "(yok)"}.`,
    );
    log.warn(`Gerekirse: ollama pull ${config.ollama.model}`);
  }

  const state = loadState();
  const topic = topicOverride || pickTopic(state.usedTopics);

  log.info(`İçerik üretiliyor — konu: "${topic}"`);
  const result = await generateJSON(SYSTEM_PROMPT, buildContentPrompt(topic));

  const title = String(result.title || topic).trim();
  const slug = slugify(title);
  const id = `${Date.now()}-${slugify(title).slice(0, 40)}`;

  const item = {
    id,
    status: "pending",
    createdAt: new Date().toISOString(),
    topic,
    model: config.ollama.model,
    // Yayın hedefleri (incelemede değiştirilebilir)
    targets: {
      website: config.platforms.website,
      facebook: config.platforms.facebook,
      instagram: config.platforms.instagram,
    },
    // Instagram için zorunlu: incelemede 'ozsaye image <id> <url>' ile eklenir
    imageUrl: null,
    content: {
      title,
      slug,
      date: isoDate(),
      category: String(result.category || "Genel").trim(),
      description: String(result.description || "").trim(),
      author: BRAND.experts[Math.floor(Math.random() * BRAND.experts.length)],
      tags: normalizeTags(result.tags),
      bodyMarkdown: String(result.body_markdown || "").trim(),
      instagramCaption: String(result.instagram_caption || "").trim(),
      facebookCaption: String(result.facebook_caption || "").trim(),
      hashtags: normalizeHashtags(result.hashtags),
    },
    publishLog: {},
  };

  saveItem(item);

  // Konuyu kullanılmış olarak işaretle
  state.usedTopics = [...new Set([...(state.usedTopics || []), topic])];
  saveState(state);

  log.ok(`Taslak oluşturuldu: ${item.id}`);
  log.info(`Başlık: ${item.content.title}`);
  log.info(`İncelemek için:  npm run review`);
  return item;
}
