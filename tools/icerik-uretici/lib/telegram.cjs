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
// Telegram callback_data sınırı 64 BAYTTIR; aşılırsa BUTTON_DATA_INVALID (400)
// döner ve butonlu mesajın TAMAMI gönderilemez. Bkz. fitSlugForCallback.
const CALLBACK_DATA_LIMIT = 64;

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
 * Slug'ı callback_data 64-bayt bütçesine sığdır (gerekirse kısalt).
 * En uzun kalıp: "yayinla:" (8) + slug + ":gorsel" (7) → slug bütçesi 49 bayt.
 * Slug'lar slugify ürünü ASCII'dir ([a-z0-9-]) ama bayt-ölçümü yine de
 * Buffer.byteLength ile yapılır (savunmacı). Kısaltılan slug'ı poll tarafı
 * `resolveSlug` ile (tam → TEK önek eşleşmesi) gerçek klasöre geri çözer.
 */
function fitSlugForCallback(slug) {
  const budget = CALLBACK_DATA_LIMIT - "yayinla:".length - ":gorsel".length;
  let s = String(slug ?? "");
  while (s.length > 0 && Buffer.byteLength(s, "utf8") > budget) s = s.slice(0, -1);
  return s;
}

/**
 * Callback'ten gelen (muhtemelen kısaltılmış) slug'ı mevcut taslak slug'larına
 * çöz: önce TAM eşleşme; yoksa TEK önek eşleşmesi. 0 veya birden çok aday →
 * null (belirsizken ASLA yayınlama).
 * `slugs` null/undefined ise (çözüm listesi enjekte edilmemiş) kimlik döner.
 */
function resolveSlug(candidate, slugs) {
  const c = String(candidate ?? "");
  if (!c) return null;
  if (slugs == null) return c;
  const list = Array.isArray(slugs) ? slugs : [];
  if (list.includes(c)) return c;
  const matches = list.filter((s) => typeof s === "string" && s.startsWith(c));
  return matches.length === 1 ? matches[0] : null;
}

/**
 * Onay inline klavyesi. `hasReels` ise "Görsel+Reels" butonu eklenir.
 * callback_data ≤ 64 bayt (Telegram sınırı) garanti edilir: uzun slug
 * kısaltılır (fitSlugForCallback) ve poll tarafında resolveSlug geri çözer.
 */
function buildApprovalKeyboard(slug, { hasReels = false } = {}) {
  const s = fitSlugForCallback(slug);
  const row1 = [{ text: "✅ Yayınla", callback_data: `yayinla:${s}:gorsel` }];
  if (hasReels) row1.push({ text: "🎬 Görsel+Reels", callback_data: `yayinla:${s}:ikisi` });
  const row2 = [{ text: "❌ Atla", callback_data: `atla:${s}` }];
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

/** Log için süreç çıktısının son ~400 karakteri (tek satıra indirger). */
function outTail(s, max = 400) {
  const t = String(s ?? "").trim().replace(/\s+/g, " ");
  return t.length > max ? "…" + t.slice(-max) : t;
}

/**
 * Bir callback_query'yi uçtan uca işler: yetki → slug çözümü → durum geçişi →
 * (yayınla ise) publisher spawn + SONUÇ DOĞRULAMA → butonları kaldır / geri-al.
 * TÜM yan etkiler enjekte edilir (spawn, fetch, meta oku/yaz) → ağsız ve
 * spawn-mock'lu test edilir.
 *
 * @param {object} cq  Telegram callback_query
 * @param {object} deps
 *   allowedChatId, token, fetchImpl,
 *   spawn(publisherPath, args, opts) → { status, stdout?, stderr? }, // senkron (spawnSync sarmalı)
 *   publisherPath, cwd,
 *   readMeta(slug) → meta|null, writeMeta(slug, meta),
 *   listSlugs?() → string[]  (kısaltılmış callback slug'ını çözmek için),
 *   log?, warn?, error?
 * @returns {Promise<{outcome:string, durum?:string, permalink?:string|null}>}
 */
async function applyCallback(cq, deps = {}) {
  const {
    allowedChatId, token, fetchImpl,
    spawn, publisherPath, cwd,
    readMeta, writeMeta, listSlugs,
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

  // callback_data'daki slug kısaltılmış olabilir (64-bayt sınırı) → gerçek slug'a çöz.
  const slug = d.action ? resolveSlug(d.slug, listSlugs ? listSlugs() : null) : null;

  if (d.action === "atla") {
    const meta = slug ? readMeta(slug) : null;
    if (!meta) { await ack("Taslak bulunamadı"); return { outcome: "notfound" }; }
    const t = nextDurum(meta.durum, "reddet");
    if (t.ok) { meta.durum = t.durum; writeMeta(slug, meta); }
    await clearButtons();
    await ack(t.ok ? "Atlandı ❌" : `Zaten: ${normalizeDurum(meta.durum)}`);
    return { outcome: "atla", durum: t.ok ? t.durum : normalizeDurum(meta.durum) };
  }

  if (d.action === "yayinla") {
    const meta = slug ? readMeta(slug) : null;
    if (!meta) { await ack("Taslak bulunamadı"); return { outcome: "notfound" }; }
    const t = nextDurum(meta.durum, "onayla");
    if (!t.ok) { await ack(`Zaten: ${normalizeDurum(meta.durum)}`); return { outcome: "skip", durum: normalizeDurum(meta.durum) }; }
    meta.durum = t.durum; // onaylandi — publisher yalnız 'onaylandi' yayınlar
    writeMeta(slug, meta);
    // Yayın uzun sürer → spinner'ı ÖNCE kapat.
    await ack("Yayınlanıyor…");
    const r = spawn(publisherPath, ["--yayinla", "--tur", d.tur, "--slug", slug], { cwd });
    // Başarı = exit 0 TEK BAŞINA YETMEZ: publisher plan-dışı kalan taslakta da
    // 0 döner (ör. gorsel.png yoksa "atlandı" der). Gerçek kanıt meta.json'da
    // durum'un 'paylasildi' olmasıdır (publisher yayın sonrası yazar).
    const after = (slug && readMeta(slug)) || meta;
    const published = r && r.status === 0 && normalizeDurum(after.durum) === DURUM.PAYLASILDI;
    if (published) {
      const link = (after.paylasim && after.paylasim.permalink) || null;
      await clearButtons();
      await tgSafe("sendMessage", { chat_id: d.chatId, text: `✅ Yayınlandı: ${slug}${link ? `\n${link}` : ""}` }, net);
      log(`yayınlandı: ${slug} (${d.tur})`);
      return { outcome: "published", permalink: link };
    }
    // Hata → durumu 'bildirildi'ye geri al (yeniden denenebilir). Telegram'a
    // PII'siz kısa mesaj; TEŞHİS ayrıntısı (publisher çıktısı) yalnız yerel loga.
    const back = (slug && readMeta(slug)) || meta;
    back.durum = DURUM.BILDIRILDI;
    writeMeta(slug, back);
    await tgSafe("sendMessage", { chat_id: d.chatId, text: `⚠️ Yayın başarısız oldu (${slug}). Butona tekrar basabilirsin.` }, net);
    const parts = [`yayın hatası (${slug}): publisher status ${r && r.status}, durum '${normalizeDurum(after.durum)}'`];
    if (r && outTail(r.stderr)) parts.push(`stderr: ${outTail(r.stderr)}`);
    if (r && outTail(r.stdout)) parts.push(`stdout: ${outTail(r.stdout)}`);
    error(parts.join(" | "));
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
  CALLBACK_DATA_LIMIT,
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
  fitSlugForCallback,
  resolveSlug,
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
