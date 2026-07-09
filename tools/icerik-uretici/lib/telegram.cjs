/**
 * Telegram Bot API istemcisi + onay-akışı SAF yardımcıları.
 *
 * Mimari: promptane_telegram.py'nin Node portu. İki katman:
 *   1) Ağ sarmalayıcıları (`tg`, `tgSafe`, `sendPhoto`, ...) — `fetch` ENJEKTE
 *      edilebilir (varsayılan: global fetch), böylece birim testleri GERÇEK AĞ
 *      olmadan sahte fetch ile koşar (bkz. telegram.test.mjs, ig-client.cjs deseni).
 *   2) SAF karar/üretim yardımcıları (`buildApprovalKeyboard`, `parseCallbackData`,
 *      `decideCallback`, `selectDraftsToNotify`, `buildCaption`) — ağ/spawn YOK.
 * Offset dosyası (getUpdates idempotensi) atomik yazılır.
 *
 * Güvenlik modeli: yalnız `TG_CHAT_ID` chat'inden gelen callback iş yapar
 * (bkz. decideCallback → authorized). Bunu telegram-bot.cjs uygular.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { normalizeDurum, nextDurum, DURUM } = require("./durum.cjs");

const TG_API = "https://api.telegram.org";
const CAPTION_LIMIT = 1024; // Telegram sendPhoto caption üst sınırı

// ---------------------------------------------------------------------------
// Ağ katmanı (enjekte edilebilir fetch)
// ---------------------------------------------------------------------------

/** Telegram yanıtını doğrular; ok:false / HTTP hatası → okunur Error. */
function assertOk(json, res, method) {
  if (!json || json.ok !== true) {
    const desc = (json && json.description) || `HTTP ${res && res.status}`;
    throw new Error(`Telegram API hatası (${method}): ${desc}`);
  }
  return json.result;
}

/**
 * Bot API POST çağrısı (application/x-www-form-urlencoded).
 * Nesne değerleri (ör. reply_markup) JSON'a çevrilir; null/undefined atlanır.
 */
async function tg(method, params = {}, { token, fetchImpl = fetch } = {}) {
  if (!token) throw new Error("TG_BOT_TOKEN gerekli");
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    body.set(k, typeof v === "object" ? JSON.stringify(v) : String(v));
  }
  const res = await fetchImpl(`${TG_API}/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await res.json();
  return assertOk(json, res, method);
}

/** Kozmetik çağrı (onay/hata mesajı, buton kaldırma, spinner). ASLA akışı kırmaz. */
async function tgSafe(method, params, opts) {
  try {
    return await tg(method, params, opts);
  } catch {
    return null;
  }
}

/** multipart/form-data POST (yerel foto/video ekleri için; global FormData/Blob). */
async function tgMultipart(method, form, { token, fetchImpl = fetch } = {}) {
  if (!token) throw new Error("TG_BOT_TOKEN gerekli");
  const res = await fetchImpl(`${TG_API}/bot${token}/${method}`, { method: "POST", body: form });
  const json = await res.json();
  return assertOk(json, res, method);
}

const sendMessage = ({ chatId, text, replyMarkup }, opts) =>
  tg("sendMessage", { chat_id: chatId, text: String(text ?? "").slice(0, 4000), reply_markup: replyMarkup }, opts);

const answerCallbackQuery = ({ callbackId, text }, opts) =>
  tg("answerCallbackQuery", { callback_query_id: callbackId, text: text ? String(text).slice(0, 200) : undefined }, opts);

// reply_markup omit edilmiş/boş inline_keyboard → butonlar kaldırılır.
const editMessageReplyMarkup = ({ chatId, messageId, replyMarkup }, opts) =>
  tg("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: replyMarkup || { inline_keyboard: [] } }, opts);

const getUpdates = ({ offset, timeout = 0, allowedUpdates } = {}, opts) =>
  tg("getUpdates", { offset, timeout, allowed_updates: allowedUpdates }, opts);

/** getMe → bota son yazan chat'in id'sini keşfetmek için (whoami). */
const getMe = (opts) => tg("getMe", {}, opts);

/** sendPhoto (yerel PNG buffer) + caption + inline keyboard. */
function sendPhoto({ chatId, photoBuffer, filename = "gorsel.png", caption, replyMarkup }, opts) {
  const form = new FormData();
  form.set("chat_id", String(chatId));
  form.set("photo", new Blob([photoBuffer], { type: "image/png" }), filename);
  if (caption != null && caption !== "") form.set("caption", String(caption).slice(0, CAPTION_LIMIT));
  if (replyMarkup) form.set("reply_markup", JSON.stringify(replyMarkup));
  return tgMultipart("sendPhoto", form, opts);
}

/** sendVideo (yerel MP4 buffer) — önizleme (çağıran tgSafe ile sarabilir). */
function sendVideo({ chatId, videoBuffer, filename = "reels.mp4", caption }, opts) {
  const form = new FormData();
  form.set("chat_id", String(chatId));
  form.set("video", new Blob([videoBuffer], { type: "video/mp4" }), filename);
  if (caption != null && caption !== "") form.set("caption", String(caption).slice(0, CAPTION_LIMIT));
  return tgMultipart("sendVideo", form, opts);
}

// ---------------------------------------------------------------------------
// SAF yardımcılar (ağ/dosya yok; doğrudan test edilir)
// ---------------------------------------------------------------------------

/**
 * Onay inline klavyesi. `hasReels` ise "Görsel+Reels" butonu eklenir.
 * NOT: callback_data ≤ 64 bayt olmalı (Telegram sınırı). Blog slug'ları kısa
 * (URL-safe, `[a-z0-9-]`) olduğundan `yayinla:<slug>:ikisi` pratikte sığar.
 */
function buildApprovalKeyboard(slug, { hasReels = false } = {}) {
  const row1 = [{ text: "✅ Yayınla", callback_data: `yayinla:${slug}:gorsel` }];
  if (hasReels) row1.push({ text: "🎬 Görsel+Reels", callback_data: `yayinla:${slug}:ikisi` });
  const row2 = [{ text: "❌ Atla", callback_data: `atla:${slug}` }];
  return { inline_keyboard: [row1, row2] };
}

/**
 * callback_data çözümle. Slug ':' içermez (URL-safe) → basit split güvenli.
 * @returns {{action:"yayinla",slug,tur} | {action:"atla",slug} | {action:null,raw}}
 */
function parseCallbackData(data) {
  const raw = String(data ?? "");
  const parts = raw.split(":");
  const action = parts[0];
  if (action === "yayinla") {
    const slug = parts[1] || "";
    const tur = parts[2] || "";
    if (!slug || !["gorsel", "reels", "ikisi"].includes(tur)) return { action: null, raw };
    return { action: "yayinla", slug, tur };
  }
  if (action === "atla") {
    const slug = parts[1] || "";
    if (!slug) return { action: null, raw };
    return { action: "atla", slug };
  }
  return { action: null, raw };
}

/**
 * Bir callback_query'yi karara çevir: yetki (yalnız izinli chat) + ayrıştırma.
 * @returns {{authorized:boolean, callbackId, chatId, messageId, action, slug?, tur?, raw?}}
 */
function decideCallback(cq, { allowedChatId } = {}) {
  const callbackId = cq && cq.id;
  const msg = (cq && cq.message) || {};
  const chatId = msg.chat && msg.chat.id;
  const messageId = msg.message_id;
  const authorized =
    allowedChatId != null && chatId != null && String(chatId) === String(allowedChatId);
  const parsed = parseCallbackData(cq && cq.data);
  return { authorized, callbackId, chatId, messageId, ...parsed };
}

/**
 * Hangi taslaklar Telegram'a bildirilecek?
 * - varsayılan: yalnız durumu 'taslak' olanlar (bildirilmiş olan TEKRAR gönderilmez).
 * - yeniden: paylaşılmış hariç her şeyi zorla (tekrar-bildir).
 * - slug: yalnız o slug.
 */
function selectDraftsToNotify(drafts, { slug = null, yeniden = false } = {}) {
  const list = Array.isArray(drafts) ? drafts : [];
  return list.filter((d) => {
    if (slug && d.slug !== slug) return false;
    const norm = normalizeDurum(d.durum);
    if (yeniden) return norm !== DURUM.PAYLASILDI;
    return norm === DURUM.TASLAK;
  });
}

/** Telegram caption'ı: başlık + instagram.txt ilk ~limit karakter + slug. */
function buildCaption({ baslik, instagramText, slug, limit = 300 } = {}) {
  const parts = [];
  if (baslik) parts.push(String(baslik).trim());
  const body = String(instagramText ?? "").trim();
  if (body) {
    const clipped =
      body.length > limit ? body.slice(0, limit).replace(/\s+\S*$/, "").trim() + "…" : body;
    parts.push(clipped);
  }
  if (slug) parts.push(`slug: ${slug}`);
  return parts.join("\n\n").slice(0, CAPTION_LIMIT);
}

// ---------------------------------------------------------------------------
// Orkestrasyon — callback → durum geçişi → yayın (bağımlılıklar ENJEKTE edilir)
// ---------------------------------------------------------------------------

/**
 * Bir callback_query'yi uçtan uca işler: yetki → durum geçişi → (yayınla ise)
 * publisher spawn → butonları kaldır / geri-al. TÜM yan etkiler enjekte edilir
 * (spawn, fetch, meta oku/yaz) → ağsız ve spawn-mock'lu test edilir.
 *
 * @param {object} cq  Telegram callback_query
 * @param {object} deps
 *   allowedChatId, token, fetchImpl,
 *   spawn(publisherPath, args, opts) → { status },  // senkron (spawnSync sarmalı)
 *   publisherPath, cwd,
 *   readMeta(slug) → meta|null, writeMeta(slug, meta),
 *   log?, warn?, error?
 * @returns {Promise<{outcome:string, durum?:string, permalink?:string|null}>}
 */
async function applyCallback(cq, deps = {}) {
  const {
    allowedChatId, token, fetchImpl,
    spawn, publisherPath, cwd,
    readMeta, writeMeta,
    log = () => {}, warn = () => {}, error = () => {},
  } = deps;
  const net = { token, fetchImpl };
  const d = decideCallback(cq, { allowedChatId });
  const ack = (text) => tgSafe("answerCallbackQuery", { callback_query_id: d.callbackId, text }, net);
  const clearButtons = () =>
    tgSafe("editMessageReplyMarkup", { chat_id: d.chatId, message_id: d.messageId, reply_markup: { inline_keyboard: [] } }, net);

  // Güvenlik: yalnız izinli chat iş yapar.
  if (!d.authorized) {
    await ack("Yetkisiz");
    warn(`yetkisiz callback reddedildi (chat ${d.chatId})`);
    return { outcome: "unauthorized" };
  }

  if (d.action === "atla") {
    const meta = readMeta(d.slug);
    if (!meta) { await ack("Taslak bulunamadı"); return { outcome: "notfound" }; }
    const t = nextDurum(meta.durum, "reddet");
    if (t.ok) { meta.durum = t.durum; writeMeta(d.slug, meta); }
    await clearButtons();
    await ack(t.ok ? "Atlandı ❌" : `Zaten: ${normalizeDurum(meta.durum)}`);
    return { outcome: "atla", durum: t.ok ? t.durum : normalizeDurum(meta.durum) };
  }

  if (d.action === "yayinla") {
    const meta = readMeta(d.slug);
    if (!meta) { await ack("Taslak bulunamadı"); return { outcome: "notfound" }; }
    const t = nextDurum(meta.durum, "onayla");
    if (!t.ok) { await ack(`Zaten: ${normalizeDurum(meta.durum)}`); return { outcome: "skip", durum: normalizeDurum(meta.durum) }; }
    meta.durum = t.durum; // onaylandi — publisher yalnız 'onaylandi' yayınlar
    writeMeta(d.slug, meta);
    // Yayın uzun sürer → spinner'ı ÖNCE kapat.
    await ack("Yayınlanıyor…");
    const r = spawn(publisherPath, ["--yayinla", "--tur", d.tur, "--slug", d.slug], { cwd });
    if (r && r.status === 0) {
      const after = readMeta(d.slug) || meta; // publisher durum→paylasildi + paylasim.permalink yazar
      const link = (after.paylasim && after.paylasim.permalink) || null;
      await clearButtons();
      await tgSafe("sendMessage", { chat_id: d.chatId, text: `✅ Yayınlandı: ${d.slug}${link ? `\n${link}` : ""}` }, net);
      log(`yayınlandı: ${d.slug} (${d.tur})`);
      return { outcome: "published", permalink: link };
    }
    // Hata → durumu 'bildirildi'ye geri al (yeniden denenebilir); PII'siz mesaj.
    const back = readMeta(d.slug) || meta;
    back.durum = DURUM.BILDIRILDI;
    writeMeta(d.slug, back);
    await tgSafe("sendMessage", { chat_id: d.chatId, text: `⚠️ Yayın başarısız oldu (${d.slug}). Butona tekrar basabilirsin.` }, net);
    error(`yayın hatası (${d.slug}): publisher status ${r && r.status}`);
    return { outcome: "failed", durum: DURUM.BILDIRILDI };
  }

  // Bozuk/bilinmeyen callback → yalnız spinner'ı kapat.
  await ack();
  return { outcome: "ignored" };
}

// ---------------------------------------------------------------------------
// Offset dosyası (getUpdates idempotensi) — atomik
// ---------------------------------------------------------------------------

/** Offset'i oku; yok/bozuk → 0 (pipeline'ı kalıcı kilitlemesin). */
function readOffset(filePath) {
  try {
    const n = parseInt(String(fs.readFileSync(filePath, "utf8")).trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Offset'i yalnız ileri sar (monotonik), atomik yaz (tmp → rename). Yeni değeri döndürür. */
function setOffset(filePath, updateId) {
  const id = Number(updateId);
  const cur = readOffset(filePath);
  if (!Number.isFinite(id) || id <= cur) return cur;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp`;
  fs.writeFileSync(tmp, String(id));
  fs.renameSync(tmp, filePath);
  return id;
}

module.exports = {
  TG_API,
  CAPTION_LIMIT,
  // ağ
  tg,
  tgSafe,
  tgMultipart,
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
  getUpdates,
  getMe,
  sendPhoto,
  sendVideo,
  // saf
  buildApprovalKeyboard,
  parseCallbackData,
  decideCallback,
  selectDraftsToNotify,
  buildCaption,
  // orkestrasyon
  applyCallback,
  // offset
  readOffset,
  setOffset,
};
