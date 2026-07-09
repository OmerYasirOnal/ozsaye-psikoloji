#!/usr/bin/env node
/**
 * Öz & Saye Psikoloji — Blog → Sosyal Medya Taslak Üretici
 *
 * Yayınlanan blog yazılarından (KAYNAK: DB `blog_posts`, status='published')
 * Instagram & Facebook için TÜRKÇE taslak metin + marka görseli + SESSİZ Reels
 * videosu üretir; `taslaklar/<slug>/` (onay kuyruğu) altına yazar.
 *
 * OTOMATİK YAYIN YOKTUR. Akış: üret → gözden geçir → --onayla → instagram-yayinla.
 * Yalnız ELLE onaylanan taslaklar yayınlanabilir (insan kapısı, ruh sağlığı içeriği).
 *
 * Metinleri yerel LLM (Ollama) üretir; Ollama yoksa --no-llm ile şablon üretir.
 *
 * Kullanım:
 *   node tools/icerik-uretici/index.cjs                 # yayınlı yazılardan taslak üret
 *   node tools/icerik-uretici/index.cjs --watch         # sürekli izle (yeni yazı geldikçe)
 *   node tools/icerik-uretici/index.cjs --force         # mevcut taslakların üstüne yaz
 *   node tools/icerik-uretici/index.cjs --no-llm        # LLM olmadan şablonla üret
 *   node tools/icerik-uretici/index.cjs --slug=<slug>   # tek yazı
 *   node tools/icerik-uretici/index.cjs --onayla <slug> # taslağı yayına onayla
 *   node tools/icerik-uretici/index.cjs --durum         # taslakların durumunu listele
 *
 * Ortam değişkenleri (bkz. .env.local.example):
 *   DATABASE_URL  (gerekli — DB'den yayınlı yazıları okur)
 *   OLLAMA_URL    (vars. http://localhost:11434)
 *   OLLAMA_MODEL  (vars. llama3.1)
 *   SITE_URL      (vars. https://ozsaye.com)
 *   FFMPEG_PATH   (ops. — reels için; PATH'te ffmpeg yoksa)
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { C, fonts, textPath, trackedPath, place, emblemAt, inkPalettes, renderPNG } =
  require("../../scripts/lib/brand.cjs");
const { loadEnv } = require("./lib/env.cjs");
const { readPublishedPosts } = require("./lib/db.cjs");
const { nextDurum, normalizeDurum } = require("./lib/durum.cjs");
const { planReelsFrames, buildReelsFfmpegArgs, reelsDuration } = require("./lib/reels.cjs");

loadEnv();

const ROOT = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "taslaklar");
const SITE_URL = (process.env.SITE_URL || "https://ozsaye.com").replace(/\/+$/, "");
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const HANDLE = process.env.IG_HANDLE || "@ozsayepsikoloji";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
// Hem "--ad=deger" hem "--ad deger" biçimini destekler
const opt = (name) => {
  const eq = args.find((x) => x.startsWith(`--${name}=`));
  if (eq) return eq.slice(eq.indexOf("=") + 1);
  const i = args.indexOf(`--${name}`);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  return null;
};
// "--onayla <slug>" veya "--onayla=<slug>" için pozisyonel argümanı çöz
const positionalAfter = (flag) => {
  const i = args.indexOf(flag);
  if (i !== -1 && args[i + 1] && !args[i + 1].startsWith("--")) return args[i + 1];
  return opt(flag.replace(/^--/, ""));
};
const FLAGS = { watch: has("--watch"), force: has("--force"), noLlm: has("--no-llm"), slug: opt("slug") };

// ---------- Yayınlı yazıları oku (DB) ----------
async function publishedPosts() {
  const posts = await readPublishedPosts({ databaseUrl: process.env.DATABASE_URL, slug: FLAGS.slug });
  return posts;
}

// ---------- LLM (Ollama) ----------
const SYSTEM_PROMPT = `Sen "Öz & Saye Psikoloji" adlı bir psikoloji kliniğinin sosyal medya editörüsün.
Dil: Türkçe. Ses tonu: sıcak, sakin, güven veren, yargısız ve profesyonel.
Kurallar:
- Klinik tanı koyma, kesin tedavi/iyileşme vaadi verme, abartılı iddia kullanma.
- Patolojikleştirme; kapsayıcı ve nazik bir dil kullan.
- KVKK ve sosyal medya platform kurallarına uygun ol.
- Emojiyi ölçülü kullan (en fazla birkaç tane).
- Sonunda nazik bir çağrı (CTA) ekle ve ${HANDLE} hesabını an.
Yalnızca geçerli JSON döndür.`;

function userPrompt(post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return `Aşağıdaki blog yazısından sosyal medya paylaşım taslakları üret.

Başlık: ${post.title}
Kategori: ${post.category}
Özet: ${post.excerpt}
Etiketler: ${post.tags.join(", ")}
Yazı bağlantısı: ${url}

Şu JSON yapısında döndür:
{
  "instagram": "Instagram gönderi metni (3-6 kısa cümle, ölçülü emoji, sonunda CTA).",
  "facebook": "Facebook gönderi metni (biraz daha uzun olabilir, yazı bağlantısını içerebilir).",
  "hashtags": ["#etiket1", "#etiket2", "... 8-12 adet Türkçe hashtag"]
}`;
}

async function generateWithOllama(post) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      options: { temperature: 0.7 },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt(post) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.message.content);
  return {
    instagram: String(parsed.instagram || "").trim(),
    facebook: String(parsed.facebook || "").trim(),
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.map(String) : [],
  };
}

// ---------- Şablon (LLM yoksa) ----------
function generateFallback(post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const tagify = (s) => "#" + s.replace(/[^\p{L}\p{N}]+/gu, "");
  const hashtags = [
    "#psikoloji", "#ruhsağlığı", "#terapi", "#özsayepsikoloji",
    ...post.tags.map(tagify),
  ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 12);
  const instagram =
    `🌿 ${post.title}\n\n${post.excerpt}\n\n` +
    `Yazının tamamı web sitemizde. Kendine iyi gelmek bir ihtiyaçtır 💚\n` +
    `Randevu ve sorularınız için ${HANDLE}`;
  const facebook =
    `${post.title}\n\n${post.excerpt}\n\nYazının devamı: ${url}\n\n` +
    `Online veya yüz yüze görüşme için bizimle iletişime geçebilirsiniz.`;
  return { instagram, facebook, hashtags };
}

// ---------- Ortak metin sarma ----------
function wrapText(font, text, size, maxWidth) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (textPath(font, test, size).w > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Bir paragrafı verilen merkezde dikey ortalar
function paragraph(font, text, size, cx, centerY, maxW, fill, lh = 1.2) {
  const lines = wrapText(font, text, size, maxW);
  const lineH = size * lh;
  const top = centerY - (lines.length * lineH) / 2;
  let svg = "";
  lines.forEach((ln, i) => { svg += place(textPath(font, ln, size), fill, cx, top + i * lineH); });
  return { svg, top, bottom: top + lines.length * lineH, count: lines.length };
}

// ---------- Marka görseli (1080×1080) ----------
async function generateImage(post, outPath) {
  const W = 1080, cx = 540, maxW = 860;
  let size = post.title.length > 42 ? 62 : 76;
  let lines = wrapText(fonts.serif, post.title, size, maxW);
  if (lines.length > 4) { size = 54; lines = wrapText(fonts.serif, post.title, size, maxW); }
  const lineH = size * 1.18;
  const blockH = lines.length * lineH;
  const titleTop = 470 - blockH / 2;

  let titleSvg = "";
  lines.forEach((ln, i) => {
    titleSvg += place(textPath(fonts.serif, ln, size), C.forest, cx, titleTop + i * lineH);
  });

  const inner =
    `<rect x="44" y="44" width="992" height="992" rx="30" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>` +
    emblemAt(inkPalettes.color, cx - 70, 110, 140) +
    place(trackedPath(fonts.sans, "YENİ YAZI", 26, 8), C.sageDark, cx, 300) +
    titleSvg +
    `<line x1="${cx - 70}" y1="${titleTop + blockH + 36}" x2="${cx + 70}" y2="${titleTop + blockH + 36}" stroke="${C.sage}" stroke-width="3"/>` +
    place(textPath(fonts.italic, "“Güvenli Bir Bölgede Kendi Özüne Doğru”", 32), C.forestLight, cx, 820) +
    place(trackedPath(fonts.sans, `${SITE_HOST}   ·   ${HANDLE}`, 24, 1), C.sageDark, cx, 980);

  await renderPNG(inner, W, W, outPath, { bg: C.cream });
}

// ---------- Reels kareleri (1080×1920) ----------
async function renderReelsFrame(frame, outPath) {
  const W = 1080, H = 1920, cx = 540, maxW = 840;
  const border = `<rect x="44" y="44" width="${W - 88}" height="${H - 88}" rx="30" fill="none" stroke="${C.forest}" stroke-opacity="0.16" stroke-width="2"/>`;
  const footer =
    `<line x1="${cx - 70}" y1="1706" x2="${cx + 70}" y2="1706" stroke="${C.sage}" stroke-width="3"/>` +
    place(trackedPath(fonts.sans, `${SITE_HOST}   ·   ${HANDLE}`, 24, 1), C.sageDark, cx, 1772);

  let body = "";
  if (frame.kind === "intro") {
    body =
      emblemAt(inkPalettes.color, cx - 170, 560, 340) +
      place(trackedPath(fonts.sans, frame.eyebrow, 30, 8), C.sageDark, cx, 1010) +
      `<line x1="${cx - 60}" y1="1070" x2="${cx + 60}" y2="1070" stroke="${C.sage}" stroke-width="3"/>` +
      place(textPath(fonts.italic, "“Güvenli Bir Bölgede Kendi Özüne Doğru”", 34), C.forestLight, cx, 1170);
  } else if (frame.kind === "title") {
    let size = frame.text.length > 42 ? 78 : 94;
    let lines = wrapText(fonts.serif, frame.text, size, maxW);
    if (lines.length > 5) { size = 60; lines = wrapText(fonts.serif, frame.text, size, maxW); }
    if (lines.length > 7) { size = 48; }
    const p = paragraph(fonts.serif, frame.text, size, cx, 900, maxW, C.forest, 1.18);
    body =
      place(trackedPath(fonts.sans, "ÖZ & SAYE PSİKOLOJİ", 26, 8), C.sageDark, cx, 340) +
      p.svg +
      `<line x1="${cx - 70}" y1="${p.bottom + 40}" x2="${cx + 70}" y2="${p.bottom + 40}" stroke="${C.sage}" stroke-width="3"/>`;
  } else if (frame.kind === "excerpt") {
    const text = frame.text.length > 240 ? frame.text.slice(0, 237).trimEnd() + "…" : frame.text;
    const p = paragraph(fonts.serif, text, 46, cx, 940, maxW, C.forest, 1.34);
    body =
      place(trackedPath(fonts.sans, frame.eyebrow, 26, 8), C.sageDark, cx, 340) +
      p.svg;
  } else { // cta
    body =
      emblemAt(inkPalettes.color, cx - 95, 470, 190) +
      paragraph(fonts.italic, frame.text, 56, cx, 940, maxW, C.forestLight, 1.24).svg +
      place(trackedPath(fonts.sans, frame.handle, 30, 4), C.forest, cx, 1180);
  }

  await renderPNG(border + body + footer, W, H, outPath, { bg: C.cream });
}

function resolveFfmpeg() {
  const candidates = [process.env.FFMPEG_PATH, "ffmpeg", "/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"].filter(Boolean);
  for (const c of candidates) {
    try {
      const r = spawnSync(c, ["-version"], { stdio: "ignore" });
      if (r.status === 0) return c;
    } catch { /* devam */ }
  }
  return null;
}

async function generateReels(post, dir) {
  const outPath = path.join(dir, "reels.mp4");
  const ffmpeg = resolveFfmpeg();
  if (!ffmpeg) {
    console.warn("  ⚠ ffmpeg bulunamadı; reels atlandı. (kurulum: brew install ffmpeg — veya FFMPEG_PATH ayarla)");
    return { uretildi: false, neden: "ffmpeg yok" };
  }
  const frames = planReelsFrames(post, { handle: HANDLE, site: SITE_HOST });
  const tmpDir = path.join(dir, ".reels-kareler");
  fs.mkdirSync(tmpDir, { recursive: true });
  const framePaths = [];
  try {
    for (let i = 0; i < frames.length; i++) {
      const fp = path.join(tmpDir, `kare-${i}.png`);
      await renderReelsFrame(frames[i], fp);
      framePaths.push(fp);
    }
    const ffArgs = buildReelsFfmpegArgs(framePaths, { out: outPath, perFrame: 5, transition: 1, fps: 30 });
    const r = spawnSync(ffmpeg, ffArgs, { stdio: "ignore" });
    if (r.status !== 0) {
      console.warn(`  ⚠ ffmpeg hata verdi (status ${r.status}); reels atlandı.`);
      return { uretildi: false, neden: `ffmpeg status ${r.status}` };
    }
    return { uretildi: true, saniye: reelsDuration(frames.length, 5, 1), dosya: "reels.mp4" };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* yoksay */ }
  }
}

// ---------- Tek yazıyı işle ----------
async function processPost(post, useLlm) {
  const dir = path.join(OUT_DIR, post.slug);
  if (fs.existsSync(dir) && !FLAGS.force) return { slug: post.slug, skipped: true };
  fs.mkdirSync(dir, { recursive: true });

  let captions, source;
  if (useLlm) {
    try {
      captions = await generateWithOllama(post);
      source = `ollama:${OLLAMA_MODEL}`;
    } catch (e) {
      console.warn(`  ⚠ Ollama başarısız (${e.message}); şablona düşülüyor.`);
      captions = generateFallback(post);
      source = "şablon (ollama hatası)";
    }
  } else {
    captions = generateFallback(post);
    source = "şablon";
  }

  const hashtags = captions.hashtags.join(" ");
  fs.writeFileSync(path.join(dir, "instagram.txt"), `${captions.instagram}\n\n${hashtags}\n`);
  fs.writeFileSync(path.join(dir, "facebook.txt"), `${captions.facebook}\n\n${hashtags}\n`);
  await generateImage(post, path.join(dir, "gorsel.png"));
  const reels = await generateReels(post, dir);

  const dosyalar = ["instagram.txt", "facebook.txt", "gorsel.png"];
  if (reels.uretildi) dosyalar.push("reels.mp4");

  fs.writeFileSync(
    path.join(dir, "meta.json"),
    JSON.stringify(
      {
        slug: post.slug,
        baslik: post.title,
        kategori: post.category,
        kaynak: "DB:blog_posts",
        url: `${SITE_URL}/blog/${post.slug}`,
        olusturma: new Date().toISOString(),
        uretici: source,
        durum: "taslak",
        dosyalar,
        reels,
        onay: null,
        paylasim: null,
      },
      null,
      2,
    ) + "\n",
  );
  return { slug: post.slug, source, reels };
}

async function runOnce() {
  const useLlm = !FLAGS.noLlm;
  const posts = await publishedPosts();
  if (posts.length === 0) { console.log("Yayınlanmış yazı yok."); return; }
  let made = 0;
  for (const post of posts) {
    const r = await processPost(post, useLlm);
    if (r.skipped) { console.log(`• atlandı (zaten var): ${r.slug}`); }
    else {
      const reelsNote = r.reels.uretildi ? `reels ${r.reels.saniye}s` : `reels yok (${r.reels.neden})`;
      console.log(`✓ taslak üretildi: ${r.slug}  [${r.source}; ${reelsNote}]`);
      made++;
    }
  }
  console.log(`\nToplam ${made} yeni taslak → ${path.relative(ROOT, OUT_DIR)}/`);
  if (made > 0) console.log("Sonraki adım: gözden geçir → node tools/icerik-uretici/index.cjs --onayla <slug>");
}

// ---------- Onay & durum komutları ----------
function onaylaSlug(slug) {
  if (!slug) { console.error("Kullanım: --onayla <slug>"); process.exit(1); }
  const metaPath = path.join(OUT_DIR, slug, "meta.json");
  if (!fs.existsSync(metaPath)) { console.error(`Taslak bulunamadı: ${slug} (${path.relative(ROOT, metaPath)})`); process.exit(1); }
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const t = nextDurum(meta.durum, "onayla");
  if (!t.ok) { console.error(`Onaylanamadı (${slug}): ${t.error}`); process.exit(1); }
  meta.durum = t.durum;
  meta.onay = { zaman: new Date().toISOString() };
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
  console.log(`✓ onaylandı: ${slug} → yayına hazır (durum: ${t.durum}).`);
  console.log("Yayın (önce dry-run):");
  console.log("  node tools/icerik-uretici/instagram-yayinla.cjs            # dry-run önizleme");
  console.log("  node tools/icerik-uretici/instagram-yayinla.cjs --yayinla  # gerçek (token gerekli)");
}

function durumListe() {
  if (!fs.existsSync(OUT_DIR)) { console.log("Taslak yok."); return; }
  const slugs = fs.readdirSync(OUT_DIR).filter((d) => fs.existsSync(path.join(OUT_DIR, d, "meta.json")));
  if (!slugs.length) { console.log("Taslak yok."); return; }
  console.log("DURUM        SLUG");
  for (const slug of slugs.sort()) {
    const meta = JSON.parse(fs.readFileSync(path.join(OUT_DIR, slug, "meta.json"), "utf8"));
    const d = normalizeDurum(meta.durum);
    const reels = meta.reels && meta.reels.uretildi ? "reels✓" : "reels✗";
    const paylasim = meta.paylasim && meta.paylasim.permalink ? `  ${meta.paylasim.permalink}` : "";
    console.log(`${d.padEnd(11)}  ${slug}  [${reels}]${paylasim}`);
  }
}

// ---------- Ana ----------
async function main() {
  if (has("--onayla")) { onaylaSlug(positionalAfter("--onayla") || FLAGS.slug); return; }
  if (has("--durum")) { durumListe(); return; }

  console.log("Öz & Saye — Blog → Sosyal Taslak Üretici");
  console.log(FLAGS.noLlm ? "Mod: şablon (LLM kapalı)" : `Mod: Ollama (${OLLAMA_MODEL} @ ${OLLAMA_URL})`);
  await runOnce();
  if (FLAGS.watch) {
    const interval = Math.max(5, Number(opt("interval") || 60)) * 1000;
    console.log(`\n👀 İzleme modu açık — her ${interval / 1000}s'de yeni yazı kontrol edilir. Durdurmak için Ctrl+C.`);
    setInterval(() => { runOnce().catch((e) => console.error(e.message)); }, interval);
  }
}

main().catch((e) => { console.error("Hata:", e.message); process.exit(1); });
