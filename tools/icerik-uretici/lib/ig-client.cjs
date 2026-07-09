/**
 * Instagram Graph API istemcisi — ağ sarmalayıcıları.
 *
 * `fetch` bağımlılık olarak enjekte edilebilir (varsayılan: global fetch), böylece
 * birim testleri GERÇEK AĞ olmadan sahte fetch ile koşar (bkz. ig-client.test.mjs).
 * URL/gövde üretimi saf `instagram.cjs`'ten gelir.
 */
"use strict";
const IG = require("./instagram.cjs");

const defaultSleep = (ms) => new Promise((r) => setTimeout(r, ms));

function assertOk(json, res, ctx) {
  const httpBad = res && res.ok === false;
  const apiErr = json && json.error;
  if (httpBad || apiErr) {
    const msg = (apiErr && (json.error.message || json.error.error_user_msg))
      || `HTTP ${res && res.status}`;
    throw new Error(`${ctx} başarısız: ${msg}`);
  }
}

async function postForm(url, params, fetchImpl) {
  const res = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(params),
  });
  const json = await res.json();
  return { res, json };
}

async function getJson(url, fetchImpl) {
  const res = await fetchImpl(url);
  const json = await res.json();
  return { res, json };
}

/** Medya konteyneri oluştur → konteyner (creation) id. */
async function createMediaContainer({ igUserId, version, accessToken, params }, fetchImpl = fetch) {
  const url = IG.mediaContainerUrl(igUserId, version);
  const { res, json } = await postForm(url, { ...params, access_token: accessToken }, fetchImpl);
  assertOk(json, res, "Konteyner oluşturma");
  if (!json.id) throw new Error("Konteyner yanıtında id yok");
  return json.id;
}

/** Konteyner status_code (FINISHED/IN_PROGRESS/ERROR/EXPIRED). */
async function getContainerStatus({ containerId, version, accessToken }, fetchImpl = fetch) {
  const url = `${IG.containerStatusUrl(containerId, version)}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`;
  const { res, json } = await getJson(url, fetchImpl);
  assertOk(json, res, "Konteyner durumu");
  return json.status_code;
}

/** FINISHED olana kadar bekle (sahte sleep enjekte edilebilir). */
async function pollUntilFinished({ containerId, version, accessToken }, {
  fetchImpl = fetch, sleep = defaultSleep, maxTries = 40, intervalMs = 3000,
} = {}) {
  let last = "";
  for (let i = 0; i < maxTries; i++) {
    const code = await getContainerStatus({ containerId, version, accessToken }, fetchImpl);
    last = code;
    const st = IG.classifyContainerStatus(code);
    if (st.done) return code;
    if (st.failed) throw new Error(`Konteyner işleme hatası: ${st.raw}`);
    await sleep(intervalMs);
  }
  throw new Error(`Konteyner zaman aşımı (${maxTries} deneme; son durum: ${last || "?"})`);
}

/** Konteyneri yayınla → media id. */
async function publishMedia({ igUserId, version, accessToken, creationId }, fetchImpl = fetch) {
  const url = IG.mediaPublishUrl(igUserId, version);
  const { res, json } = await postForm(url, { creation_id: creationId, access_token: accessToken }, fetchImpl);
  assertOk(json, res, "Yayınlama");
  if (!json.id) throw new Error("Yayın yanıtında media id yok");
  return json.id;
}

/** Yayınlanan gönderinin permalink'i. */
async function getPermalink({ mediaId, version, accessToken }, fetchImpl = fetch) {
  const url = `${IG.permalinkUrl(mediaId, version)}?fields=permalink&access_token=${encodeURIComponent(accessToken)}`;
  const { res, json } = await getJson(url, fetchImpl);
  assertOk(json, res, "Permalink alma");
  return json.permalink || null;
}

/** Uzun ömürlü token'ı yenile → {accessToken, expiresInSec, expiresAt}. (Uç nokta sürümsüz.) */
async function refreshLongLivedToken({ accessToken }, fetchImpl = fetch, now = Date.now()) {
  const url = `${IG.refreshTokenUrl()}?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`;
  const { res, json } = await getJson(url, fetchImpl);
  assertOk(json, res, "Token yenileme");
  return IG.parseRefreshResponse(json, now);
}

module.exports = {
  defaultSleep,
  createMediaContainer,
  getContainerStatus,
  pollUntilFinished,
  publishMedia,
  getPermalink,
  refreshLongLivedToken,
};
