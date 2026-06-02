#!/usr/bin/env node
/**
 * Öz & Saye Psikoloji — Blog → Sosyal Medya Taslak Üretici
 *
 * Yayınlanan blog yazılarından (content/blog/*.md, draft:false) Instagram &
 * Facebook için TÜRKÇE taslak metin + marka görseli üretir ve `taslaklar/`
 * klasörüne (onay kuyruğu) yazar. OTOMATİK YAYIN YOKTUR — sen bakar, onaylar,
 * elle paylaşırsın.
 *
 * Metinleri yerel LLM (Ollama) üretir; Ollama yoksa --no-llm ile şablon tabanlı
 * taslak üretilir.
 *
 * Kullanım:
 *   node tools/icerik-uretici/index.cjs               # bir kez çalış
 *   node tools/icerik-uretici/index.cjs --watch       # sürekli izle (yeni yazı geldikçe üret)
 *   node tools/icerik-uretici/index.cjs --force       # mevcut taslakların üstüne yaz
 *   node tools/icerik-uretici/index.cjs --no-llm      # LLM olmadan şablonla üret
 *   node tools/icerik-uretici/index.cjs --slug=kaygi-ile-basa-cikmak
 *
 * Ortam değişkenleri:
 *   OLLAMA_URL    (vars. http://localhost:11434)
 *   OLLAMA_MODEL  (vars. llama3.1)
 *   SITE_URL      (vars. https://ozsayepsikoloji.com)
 */
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { C, fonts, textPath, trackedPath, place, emblemAt, inkPalettes, renderPNG } =
  require("../../scripts/lib/brand.cjs");

const ROOT = path.join(__dirname, "..", "..");
const BLOG_DIR = path.join(ROOT, "content", "blog");
const OUT_DIR = path.join(ROOT, "taslaklar");
const SITE_URL = process.env.SITE_URL || "https://ozsayepsikoloji.com";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const HANDLE = "@ozsayepsikoloji";

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const opt = (name) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(a.indexOf("=") + 1) : null;
};
const FLAGS = { watch: has("--watch"), force: has("--force"), noLlm: has("--no-llm"), slug: opt("slug") };

// ---------- Blog yazılarını oku ----------
function publishedPosts() {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const { data } = matter(fs.readFileSync(path.join(BLOG_DIR, f), "utf8"));
      return {
        slug,
        title: String(data.title ?? slug),
        excerpt: String(data.excerpt ?? ""),
        category: String(data.category ?? "Yazı"),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        draft: data.draft === true,
      };
    })
    .filter((p) => !p.draft)
    .filter((p) => !FLAGS.slug || p.slug === FLAGS.slug);
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

// ---------- Marka görseli ----------
function wrapText(font, text, size, maxWidth) {
  const words = text.split(/\s+/);
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
    place(trackedPath(fonts.sans, `ozsayepsikoloji.com   ·   ${HANDLE}`, 24, 1), C.sageDark, cx, 980);

  await renderPNG(inner, W, W, outPath, { bg: C.cream });
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
  fs.writeFileSync(
    path.join(dir, "meta.json"),
    JSON.stringify(
      {
        slug: post.slug,
        baslik: post.title,
        kategori: post.category,
        kaynak: `content/blog/${post.slug}.md`,
        url: `${SITE_URL}/blog/${post.slug}`,
        olusturma: new Date().toISOString(),
        uretici: source,
        durum: "taslak — onay bekliyor",
        dosyalar: ["instagram.txt", "facebook.txt", "gorsel.png"],
      },
      null,
      2,
    ) + "\n",
  );
  return { slug: post.slug, source };
}

async function runOnce() {
  const useLlm = !FLAGS.noLlm;
  const posts = publishedPosts();
  if (posts.length === 0) { console.log("Yayınlanmış yazı yok."); return; }
  let made = 0;
  for (const post of posts) {
    const r = await processPost(post, useLlm);
    if (r.skipped) { console.log(`• atlandı (zaten var): ${r.slug}`); }
    else { console.log(`✓ taslak üretildi: ${r.slug}  [${r.source}]`); made++; }
  }
  console.log(`\nToplam ${made} yeni taslak → ${path.relative(ROOT, OUT_DIR)}/`);
}

async function main() {
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
