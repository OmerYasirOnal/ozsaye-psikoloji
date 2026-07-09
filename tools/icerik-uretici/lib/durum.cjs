/**
 * Taslak durum makinesi + yayın planlayıcı — SAF (pure) yardımcılar.
 *
 * Durum akışı (insan onay kapısı):
 *   taslak → bildirildi → onaylandi → paylasildi
 *                      ↘ reddedildi
 * "bildirildi": taslak Telegram'a onay için gönderildi (tekrar-notify önlenir).
 * "reddedildi": Telegram'dan ❌ Atla ile elenmiş (yayınlanmaz).
 * Yalnız "onaylandi" taslaklar yayına uygundur. "Hepsini otomatik yayınla"
 * modu BİLİNÇLİ olarak YOKTUR — ruh sağlığı içeriği elle onaylanır.
 *
 * Ağ/DB/dosya erişimi YOK; birim testi doğrudan çağırır (bkz. durum.test.mjs).
 */
"use strict";

const DURUM = Object.freeze({
  TASLAK: "taslak",
  BILDIRILDI: "bildirildi",
  ONAYLANDI: "onaylandi",
  REDDEDILDI: "reddedildi",
  PAYLASILDI: "paylasildi",
});

/** Serbest metin durum etiketini (ör. eski "taslak — onay bekliyor") normalize eder. */
function normalizeDurum(d) {
  const s = String(d ?? "").toLowerCase().trim();
  if (s.startsWith("onay")) return DURUM.ONAYLANDI;
  if (s.startsWith("paylas") || s.startsWith("paylaş")) return DURUM.PAYLASILDI;
  if (s.startsWith("bildir")) return DURUM.BILDIRILDI;
  if (s.startsWith("red")) return DURUM.REDDEDILDI; // "reddedildi"
  return DURUM.TASLAK; // "taslak", "taslak — onay bekliyor", bilinmeyen → taslak
}

/**
 * Bir durum geçişi uygular.
 * @param {string} current  mevcut durum
 * @param {"bildir"|"onayla"|"reddet"|"yayinla"} action
 * @returns {{ok:boolean, durum:string, error?:string}}
 */
function nextDurum(current, action) {
  const c = normalizeDurum(current);
  if (action === "bildir") {
    // Telegram'a onay için gönder. Zaten onaylanmış/paylaşılmışı yeniden bildirme.
    if (c === DURUM.ONAYLANDI) {
      return { ok: false, durum: c, error: "Bu taslak zaten onaylandı; yeniden bildirilmez." };
    }
    if (c === DURUM.PAYLASILDI) {
      return { ok: false, durum: c, error: "Bu taslak zaten paylaşıldı; yeniden bildirilmez." };
    }
    return { ok: true, durum: DURUM.BILDIRILDI };
  }
  if (action === "onayla") {
    if (c === DURUM.PAYLASILDI) {
      return { ok: false, durum: c, error: "Bu taslak zaten paylaşıldı; yeniden onaylanamaz." };
    }
    return { ok: true, durum: DURUM.ONAYLANDI };
  }
  if (action === "reddet") {
    // ❌ Atla — paylaşılmış taslak geri alınamaz.
    if (c === DURUM.PAYLASILDI) {
      return { ok: false, durum: c, error: "Bu taslak zaten paylaşıldı; reddedilemez." };
    }
    return { ok: true, durum: DURUM.REDDEDILDI };
  }
  if (action === "yayinla") {
    if (c !== DURUM.ONAYLANDI) {
      return { ok: false, durum: c, error: `Yayın için 'onaylandi' gerekli (şu an: '${c}').` };
    }
    return { ok: true, durum: DURUM.PAYLASILDI };
  }
  return { ok: false, durum: c, error: `Bilinmeyen işlem: ${action}` };
}

/** Taslak yayına uygun mu (durum === onaylandi)? */
const isEligibleForPublish = (durum) => normalizeDurum(durum) === DURUM.ONAYLANDI;

/**
 * Yayın planlayıcı (dry-run çekirdeği).
 * @param {Array<{slug:string, durum:string, hasImage:boolean, hasReels:boolean}>} drafts
 * @param {{tur?:"gorsel"|"reels"|"ikisi", adet?:number}} opts
 * @returns {{willProcess:Array<{slug:string, actions:Array<{tur:string,dosya:string}>}>, skipped:Array<{slug:string,reason:string}>}}
 */
function planPublish(drafts, { tur = "gorsel", adet = 1 } = {}) {
  const list = Array.isArray(drafts) ? drafts : [];
  const willProcess = [];
  const skipped = [];
  const wantImage = tur === "gorsel" || tur === "ikisi";
  const wantReels = tur === "reels" || tur === "ikisi";

  for (const d of list) {
    if (!isEligibleForPublish(d.durum)) {
      skipped.push({ slug: d.slug, reason: `durum '${normalizeDurum(d.durum)}' (onaylandi değil)` });
      continue;
    }
    if (willProcess.length >= adet) {
      skipped.push({ slug: d.slug, reason: `adet sınırı (--adet ${adet})` });
      continue;
    }
    const actions = [];
    const reasons = [];
    if (wantImage) {
      if (d.hasImage) actions.push({ tur: "gorsel", dosya: "gorsel.png" });
      else reasons.push("gorsel.png yok");
    }
    if (wantReels) {
      if (d.hasReels) actions.push({ tur: "reels", dosya: "reels.mp4" });
      else if (tur === "reels") reasons.push("reels.mp4 yok");
      // tur === "ikisi" iken reels yoksa sessizce atla (görsel yine de paylaşılır)
    }
    if (actions.length) willProcess.push({ slug: d.slug, actions });
    else skipped.push({ slug: d.slug, reason: reasons.join(", ") || "yapılacak işlem yok" });
  }
  return { willProcess, skipped };
}

module.exports = { DURUM, normalizeDurum, nextDurum, isEligibleForPublish, planPublish };
