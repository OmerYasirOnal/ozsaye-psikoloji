/**
 * Reels üretimi — SAF (pure) yardımcılar: ffmpeg argümanları + kare planı.
 *
 * v1 yaklaşımı: 3–4 marka-tipografi karesi (sharp ile render) → ffmpeg xfade
 * ("fade") ile 1080×1920, ~15–20 s, SESSİZ (H.264/yuv420p/30fps) MP4.
 * Müzik BİLİNÇLİ olarak eklenmez (lisans) — kullanıcı Instagram uygulamasında
 * müziği kendi ekler.
 *
 * Bu modül ffmpeg'i ÇALIŞTIRMAZ, sharp/brand yüklemez — yalnız argüman dizisi
 * ve kare tanımı üretir. Böylece testler ffmpeg/font olmadan koşar.
 */
"use strict";

const round2 = (v) => Math.round(v * 100) / 100;

/**
 * N eşit-süreli kare için xfade offset'leri (k=1..N-1).
 * offset_k = k * (perFrame - transition). Toplam süre = N*perFrame - (N-1)*transition.
 */
function xfadeOffsets(n, perFrame, transition) {
  const offs = [];
  for (let k = 1; k <= n - 1; k++) offs.push(round2(k * (perFrame - transition)));
  return offs;
}

/** Toplam reels süresi (saniye). */
const reelsDuration = (n, perFrame, transition) => round2(n * perFrame - (n - 1) * transition);

/**
 * ffmpeg argüman dizisini üretir (spawn ile kullanılmak üzere).
 * Her kare `-loop 1 -t perFrame` ile girdi; xfade zinciri ile birleştirilir;
 * çıktı sessiz (`-an`), yuv420p, sabit fps.
 */
function buildReelsFfmpegArgs(framePaths, {
  perFrame = 5, transition = 1, fps = 30, out,
} = {}) {
  if (!Array.isArray(framePaths) || framePaths.length === 0) {
    throw new Error("En az bir kare gerekli");
  }
  if (!out) throw new Error("Çıktı yolu (out) gerekli");
  if (transition >= perFrame) throw new Error("transition < perFrame olmalı");

  const n = framePaths.length;
  const args = ["-y"];
  for (const f of framePaths) args.push("-loop", "1", "-t", String(perFrame), "-i", f);

  let filter;
  if (n === 1) {
    filter = `[0:v]format=yuv420p,fps=${fps}[vout]`;
  } else {
    const offs = xfadeOffsets(n, perFrame, transition);
    let prev = "[0:v]";
    let chain = "";
    for (let i = 1; i < n; i++) {
      const label = `[xf${i}]`;
      chain += `${prev}[${i}:v]xfade=transition=fade:duration=${transition}:offset=${offs[i - 1]}${label};`;
      prev = label;
    }
    filter = `${chain}${prev}format=yuv420p,fps=${fps}[vout]`;
  }

  args.push(
    "-filter_complex", filter,
    "-map", "[vout]",
    "-c:v", "libx264",
    "-profile:v", "high",
    "-preset", "medium",
    "-pix_fmt", "yuv420p",
    "-r", String(fps),
    "-movflags", "+faststart",
    "-an", // sessiz
    out,
  );
  return args;
}

/**
 * Reels kare planı (render'a girdi olacak tanımlar; render index.cjs'de sharp ile yapılır).
 * @returns {Array<{kind:string, ...}>}  her zaman 4 kare (intro, başlık, özet, CTA)
 */
function planReelsFrames(post, { handle = "@ozsayepsikoloji", site = "ozsayepsikoloji.com" } = {}) {
  const title = String(post.title || post.slug || "").trim();
  const excerpt = String(post.excerpt || "").trim();
  return [
    { kind: "intro", eyebrow: "YENİ YAZI" },
    { kind: "title", text: title },
    { kind: "excerpt", eyebrow: "ÖZET", text: excerpt || "Yazının tamamı web sitemizde." },
    { kind: "cta", text: "Kendine iyi gelmek bir ihtiyaçtır.", handle, site },
  ];
}

module.exports = { xfadeOffsets, reelsDuration, buildReelsFfmpegArgs, planReelsFrames };
