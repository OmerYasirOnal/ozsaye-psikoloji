#!/usr/bin/env node
/**
 * Öz & Saye Psikoloji — Instagram Yayınlayıcı
 *
 * taslaklar/<slug>/meta.json içinden YALNIZ durum "onaylandi" olan taslaklar
 * yayına uygundur (insan onay kapısı). "Hepsini otomatik yayınla" modu BİLİNÇLİ YOKTUR.
 *
 * "Instagram API with Instagram Login" (host: graph.instagram.com, FB Sayfası
 * gerekmez): görsel/reels için genel bir URL şart → önce Vercel Blob'a yüklenir,
 * sonra konteyner oluşturulur → status FINISHED olana kadar beklenir → yayınlanır.
 *
 * VARSAYILAN: --dry-run (ağ YOK, yalnız plan basılır). Gerçek yayın için
 * --yayinla + IG_ACCESS_TOKEN + IG_USER_ID + BLOB_READ_WRITE_TOKEN GEREKİR.
 *
 * Kullanım:
 *   node tools/icerik-uretici/instagram-yayinla.cjs                    # DRY-RUN plan
 *   node tools/icerik-uretici/instagram-yayinla.cjs --tur ikisi        # görsel + reels planı
 *   node tools/icerik-uretici/instagram-yayinla.cjs --yayinla          # GERÇEK yayın (1 taslak)
 *   node tools/icerik-uretici/instagram-yayinla.cjs --yayinla --adet 2 # en çok 2 taslak
 *   node tools/icerik-uretici/instagram-yayinla.cjs --slug=<slug> --yayinla
 *   node tools/icerik-uretici/instagram-yayinla.cjs --token-yenile [--yaz]
 *
 * Bayraklar:
 *   --dry-run           (varsayılan) yalnız plan; ağ/blob'a dokunmaz
 *   --yayinla           gerçek yayın (kimlik bilgisi gerekli)
 *   --tur gorsel|reels|ikisi   ne paylaşılacak (vars. gorsel)
 *   --adet N            bu çağrıda en çok N taslak (vars. 1 — hız güvenliği)
 *   --slug=<slug>       yalnız bu taslak
 *   --token-yenile      uzun ömürlü token'ı yenile
 *   --yaz               (token-yenile ile) yeni token'ı .env.local'e yaz
 */
const fs = require("fs");
const path = require("path");
const { loadEnv, envCandidates } = require("./lib/env.cjs");
const IG = require("./lib/instagram.cjs");
const client = require("./lib/ig-client.cjs");
const { planPublish, nextDurum } = require("./lib/durum.cjs");

loadEnv();

const ROOT = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "taslaklar");

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

const IG_API_VERSION = process.env.IG_API_VERSION || IG.DEFAULT_API_VERSION;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN || "";
const IG_USER_ID = process.env.IG_USER_ID || "";
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || "";

const TUR = (opt("tur") || "gorsel").toLowerCase();
const ADET = Math.max(1, Number(opt("adet") || 1) || 1);
const SLUG = opt("slug");
// dry-run VARSAYILAN: yalnız --yayinla ile (ve --dry-run yoksa) gerçek koşar
const dryRun = has("--dry-run") || !has("--yayinla");

// ---------- Taslakları tara ----------
function scanDrafts(slugFilter) {
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs
    .readdirSync(OUT_DIR)
    .filter((d) => fs.existsSync(path.join(OUT_DIR, d, "meta.json")))
    .filter((d) => !slugFilter || d === slugFilter)
    .sort()
    .map((slug) => {
      const dir = path.join(OUT_DIR, slug);
      const meta = JSON.parse(fs.readFileSync(path.join(dir, "meta.json"), "utf8"));
      return {
        slug,
        dir,
        meta,
        durum: meta.durum,
        hasImage: fs.existsSync(path.join(dir, "gorsel.png")),
        hasReels: fs.existsSync(path.join(dir, "reels.mp4")),
      };
    });
}

function readCaption(dir) {
  const p = path.join(dir, "instagram.txt");
  if (!fs.existsSync(p)) return { caption: "", hashtagCount: 0, truncated: false, tooManyHashtags: false };
  return IG.normalizeCaption(fs.readFileSync(p, "utf8"));
}

// ---------- Plan yazdır ----------
function printPlan(plan, drafts) {
  console.log(`Onaylı taslak taraması — tür: ${TUR}, adet: ${ADET}, mod: ${dryRun ? "DRY-RUN" : "GERÇEK YAYIN"}`);
  console.log(`API: graph.instagram.com/${IG_API_VERSION}\n`);
  if (!drafts.length) console.log("(taslaklar/ boş — önce: node tools/icerik-uretici/index.cjs)\n");

  if (!plan.willProcess.length) {
    console.log("Yayınlanacak onaylı taslak yok.");
    console.log("Önce onayla: node tools/icerik-uretici/index.cjs --onayla <slug>\n");
  }
  for (const item of plan.willProcess) {
    const dir = path.join(OUT_DIR, item.slug);
    const c = readCaption(dir);
    console.log(`▶ ${item.slug}`);
    console.log(`   başlık: instagram.txt (${c.caption.length} karakter, ${c.hashtagCount} hashtag${c.tooManyHashtags ? " ⚠ 30+!" : ""})`);
    for (const a of item.actions) {
      const kind = a.tur === "reels" ? "REELS (video_url)" : "GÖRSEL (image_url)";
      console.log(`   • ${a.tur}: ${a.dosya}  →  Blob: ${IG.blobPath(item.slug, a.dosya)}  →  ${kind}  →  yayınla`);
    }
  }
  if (plan.skipped.length) {
    console.log("\nAtlananlar:");
    for (const s of plan.skipped) console.log(`   - ${s.slug}: ${s.reason}`);
  }
}

// ---------- Gerçek yayın ----------
function requireCreds() {
  const eksik = [];
  if (!IG_ACCESS_TOKEN) eksik.push("IG_ACCESS_TOKEN");
  if (!IG_USER_ID) eksik.push("IG_USER_ID");
  if (!BLOB_TOKEN) eksik.push("BLOB_READ_WRITE_TOKEN");
  if (eksik.length) {
    console.error(`\nGerçek yayın için eksik ortam değişkeni: ${eksik.join(", ")}`);
    console.error("Bunları tools/icerik-uretici/.env.local (veya proje kökü .env.local) içine ekleyin.");
    console.error("Token alma adımları: tools/icerik-uretici/README.md → 'Instagram token' bölümü.");
    process.exit(1);
  }
}

async function uploadToBlob(localPath, dest, contentType) {
  const { put } = require("@vercel/blob");
  const data = fs.readFileSync(localPath);
  const r = await put(dest, data, {
    access: "public",
    token: BLOB_TOKEN,
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return r.url;
}

async function publishAction({ slug, dir, tur, caption, ctx }) {
  const filename = tur === "reels" ? "reels.mp4" : "gorsel.png";
  const contentType = tur === "reels" ? "video/mp4" : "image/png";
  const dest = IG.blobPath(slug, filename);

  console.log(`   → Blob'a yükleniyor: ${dest}`);
  const mediaUrl = await uploadToBlob(path.join(dir, filename), dest, contentType);

  const params = IG.buildContainerParams(
    tur === "reels" ? { mediaType: "REELS", videoUrl: mediaUrl, caption } : { imageUrl: mediaUrl, caption },
  );
  console.log(`   → Konteyner oluşturuluyor (${tur})…`);
  const containerId = await client.createMediaContainer(
    { igUserId: ctx.userId, version: ctx.version, accessToken: ctx.token, params },
  );

  console.log(`   → İşleniyor (poll ${containerId})…`);
  await client.pollUntilFinished(
    { containerId, version: ctx.version, accessToken: ctx.token },
    { maxTries: tur === "reels" ? 60 : 30, intervalMs: tur === "reels" ? 5000 : 3000 },
  );

  console.log("   → Yayınlanıyor…");
  const mediaId = await client.publishMedia(
    { igUserId: ctx.userId, version: ctx.version, accessToken: ctx.token, creationId: containerId },
  );
  const permalink = await client
    .getPermalink({ mediaId, version: ctx.version, accessToken: ctx.token })
    .catch(() => null);

  return { tur, mediaId, permalink, mediaUrl, zaman: new Date().toISOString() };
}

async function runPublish() {
  const drafts = scanDrafts(SLUG);
  const plan = planPublish(drafts, { tur: TUR, adet: ADET });
  printPlan(plan, drafts);

  if (dryRun) {
    console.log("\n[DRY-RUN] Gerçek paylaşım YAPILMADI. Yayınlamak için: --yayinla");
    return;
  }
  requireCreds();
  const ctx = { userId: IG_USER_ID, token: IG_ACCESS_TOKEN, version: IG_API_VERSION };

  for (const item of plan.willProcess) {
    const dir = path.join(OUT_DIR, item.slug);
    const { caption } = readCaption(dir);
    console.log(`\n▶ Yayınlanıyor: ${item.slug}`);
    const sonuc = {};
    for (const action of item.actions) {
      const res = await publishAction({ slug: item.slug, dir, tur: action.tur, caption, ctx });
      sonuc[action.tur] = res;
      console.log(`   ✓ ${action.tur} paylaşıldı: ${res.permalink || res.mediaId}`);
    }
    // meta.json güncelle: durum → paylasildi
    const metaPath = path.join(dir, "meta.json");
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
    const t = nextDurum(meta.durum, "yayinla");
    meta.durum = t.ok ? t.durum : "paylasildi";
    const firstLink = (sonuc.gorsel && sonuc.gorsel.permalink) || (sonuc.reels && sonuc.reels.permalink) || null;
    meta.paylasim = { ...sonuc, zaman: new Date().toISOString(), permalink: firstLink };
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    console.log(`   ✓ meta.json → durum: ${meta.durum}`);
  }
  console.log("\nTamamlandı.");
}

// ---------- Token yenileme ----------
function pickEnvFileForKey(key) {
  const cands = envCandidates();
  for (const p of cands) {
    if (fs.existsSync(p) && new RegExp(`^${key}=`, "m").test(fs.readFileSync(p, "utf8"))) return p;
  }
  for (const p of cands) if (fs.existsSync(p)) return p;
  return cands[0]; // araç-yerel (yoksa oluşturulur)
}

function updateEnvValue(filePath, key, value) {
  let text = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (re.test(text)) text = text.replace(re, line);
  else text = (text && !text.endsWith("\n") ? text + "\n" : text) + line + "\n";
  fs.writeFileSync(filePath, text);
}

async function runTokenRefresh() {
  if (!IG_ACCESS_TOKEN) {
    console.error("IG_ACCESS_TOKEN tanımlı değil; yenilenecek token yok. Önce .env.local'e ekleyin.");
    process.exit(1);
  }
  console.log("Uzun ömürlü token yenileniyor (graph.instagram.com/refresh_access_token)…");
  const r = await client.refreshLongLivedToken({ version: IG_API_VERSION, accessToken: IG_ACCESS_TOKEN });
  const expiry = r.expiresAt ? r.expiresAt.toISOString() : "bilinmiyor";
  const days = r.expiresInSec ? Math.round(r.expiresInSec / 86400) : "?";
  console.log(`Yeni token alındı. Son kullanma: ${expiry} (~${days} gün).`);
  if (has("--yaz")) {
    const target = pickEnvFileForKey("IG_ACCESS_TOKEN");
    updateEnvValue(target, "IG_ACCESS_TOKEN", r.accessToken);
    console.log(`✓ IG_ACCESS_TOKEN güncellendi: ${target}`);
  } else {
    console.log("\nYeni IG_ACCESS_TOKEN (elle .env.local'e yazın; ya da --yaz ile otomatik):");
    console.log(r.accessToken);
  }
}

// ---------- Ana ----------
async function main() {
  if (has("--help") || has("-h")) {
    console.log([
      "Instagram Yayınlayıcı — yalnız ONAYLANMIŞ taslaklar (durum=onaylandi).",
      "",
      "  (bayraksız)         DRY-RUN plan (ağ yok)",
      "  --yayinla           gerçek yayın (IG_ACCESS_TOKEN + IG_USER_ID + BLOB_READ_WRITE_TOKEN gerekli)",
      "  --tur gorsel|reels|ikisi   ne paylaşılır (vars. gorsel)",
      "  --adet N            en çok N taslak (vars. 1)",
      "  --slug=<slug>       yalnız bu taslak",
      "  --token-yenile [--yaz]     uzun ömürlü token'ı yenile (--yaz: .env.local'e yaz)",
    ].join("\n"));
    return;
  }
  if (!["gorsel", "reels", "ikisi"].includes(TUR)) {
    console.error(`Geçersiz --tur: ${TUR} (gorsel|reels|ikisi olmalı)`);
    process.exit(1);
  }
  if (has("--token-yenile")) { await runTokenRefresh(); return; }
  await runPublish();
}

main().catch((e) => { console.error("Hata:", e.message); process.exit(1); });
