/**
 * Instagram Graph API — SAF (pure) yardımcılar.
 *
 * "Instagram API with Instagram Login" varyantı (host: graph.instagram.com,
 * Facebook Sayfası GEREKMEZ). Bu modül yalnızca URL/gövde/başlık üretir ve
 * yanıt ayrıştırır — hiçbir ağ çağrısı YAPMAZ, dosya OKUMAZ. Böylece birim
 * testleri ffmpeg/DB/ağ olmadan koşar (bkz. instagram.test.mjs).
 */
"use strict";

const IG_HOST = "graph.instagram.com";
const DEFAULT_API_VERSION = "v23.0"; // güncel kararlı sürüm (IG_API_VERSION ile geçersiz kılınabilir)
const IG_CAPTION_MAX = 2200; // Instagram başlık karakter sınırı
const IG_HASHTAG_MAX = 30; // Instagram gönderi başına hashtag sınırı

const igBaseUrl = (version = DEFAULT_API_VERSION) => `https://${IG_HOST}/${version}`;

// --- Uç nokta URL'leri (yalnız temel URL; çağıran ?access_token=... ekler) ---
const mediaContainerUrl = (igUserId, version) => `${igBaseUrl(version)}/${igUserId}/media`;
const mediaPublishUrl = (igUserId, version) => `${igBaseUrl(version)}/${igUserId}/media_publish`;
const containerStatusUrl = (containerId, version) => `${igBaseUrl(version)}/${containerId}`;
const permalinkUrl = (mediaId, version) => `${igBaseUrl(version)}/${mediaId}`;
// Meta belgeleri token yenilemeyi SÜRÜMSÜZ gösterir: graph.instagram.com/refresh_access_token
const refreshTokenUrl = () => `https://${IG_HOST}/refresh_access_token`;

/**
 * Medya konteyneri POST gövdesini üretir (access_token HARİÇ — onu çağıran ekler).
 * Görsel: { image_url, caption }. Reels: { media_type:"REELS", video_url, caption }.
 */
function buildContainerParams({ mediaType, imageUrl, videoUrl, caption } = {}) {
  const p = {};
  if (mediaType === "REELS") {
    if (!videoUrl) throw new Error("REELS konteyneri için video_url gerekli");
    p.media_type = "REELS";
    p.video_url = videoUrl;
    p.share_to_feed = "true";
  } else {
    if (!imageUrl) throw new Error("Görsel konteyneri için image_url gerekli");
    p.image_url = imageUrl;
  }
  if (caption != null && String(caption) !== "") p.caption = String(caption);
  return p;
}

/**
 * Başlık metnini Instagram sınırlarına göre normalize eder.
 * @returns {{caption:string, hashtagCount:number, truncated:boolean, tooManyHashtags:boolean}}
 */
function normalizeCaption(raw, { max = IG_CAPTION_MAX } = {}) {
  let caption = String(raw ?? "")
    .replace(/[ \t]+\n/g, "\n") // satır sonu boşlukları
    .replace(/\n{3,}/g, "\n\n") // 2'den fazla boş satırı kırp
    .trim();
  const hashtagCount = (caption.match(/(^|\s)#[^\s#]+/g) || []).length;
  let truncated = false;
  if (caption.length > max) {
    caption = caption.slice(0, max - 1).replace(/\s+\S*$/, "").trim() + "…";
    truncated = true;
  }
  return { caption, hashtagCount, truncated, tooManyHashtags: hashtagCount > IG_HASHTAG_MAX };
}

/** Vercel Blob nesne yolu: instagram/<slug>/<dosya> (slug güvenli hale getirilir). */
function blobPath(slug, filename) {
  const safeSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const safeFile = String(filename).replace(/[^a-z0-9._-]+/gi, "-");
  return `instagram/${safeSlug}/${safeFile}`;
}

/** refresh_access_token yanıtını ayrıştırır → {accessToken, expiresInSec, expiresAt}. */
function parseRefreshResponse(json, now = Date.now()) {
  const accessToken = json && json.access_token;
  if (!accessToken) {
    const msg = (json && (json.error?.message || json.error_message)) || "access_token yok";
    throw new Error(`Token yenileme yanıtı geçersiz: ${msg}`);
  }
  const expiresInSec = Number(json && json.expires_in);
  const hasExpiry = Number.isFinite(expiresInSec);
  return {
    accessToken,
    expiresInSec: hasExpiry ? expiresInSec : null,
    expiresAt: hasExpiry ? new Date(now + expiresInSec * 1000) : null,
  };
}

/**
 * Konteyner status_code sınıflandırması.
 * FINISHED → yayına hazır; ERROR/EXPIRED → kalıcı hata; IN_PROGRESS/boş → beklemede.
 */
function classifyContainerStatus(statusCode) {
  const s = String(statusCode || "").toUpperCase();
  return {
    raw: s,
    done: s === "FINISHED",
    failed: s === "ERROR" || s === "EXPIRED",
    pending: s === "IN_PROGRESS" || s === "",
  };
}

module.exports = {
  IG_HOST,
  DEFAULT_API_VERSION,
  IG_CAPTION_MAX,
  IG_HASHTAG_MAX,
  igBaseUrl,
  mediaContainerUrl,
  mediaPublishUrl,
  containerStatusUrl,
  permalinkUrl,
  refreshTokenUrl,
  buildContainerParams,
  normalizeCaption,
  blobPath,
  parseRefreshResponse,
  classifyContainerStatus,
};
