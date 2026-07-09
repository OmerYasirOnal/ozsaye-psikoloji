#!/usr/bin/env node
/**
 * Öz & Saye Psikoloji — Telegram Onay Köprüsü
 *
 * Instagram taslaklarını telefondan onaylayıp yayınlamak için Telegram köprüsü.
 * Mimari: promptane_telegram.py'nin Node portu (stdlib yerine global fetch +
 * enjekte edilebilir ağ katmanı; bkz. lib/telegram.cjs).
 *
 * Akış:  index.cjs (üret) → telegram-bot.cjs notify (bildir) → telefondan ✅/❌
 *        → telegram-bot.cjs poll (launchd 120s) → onaylı taslağı yayınlar.
 *
 * Alt komutlar:
 *   whoami                bota son yazan chat'in id'sini yazdır (tek seferlik kurulum)
 *   send <mesaj>          düz metin gönder
 *   notify [slug]|--hepsi durumu 'taslak' olan taslak(lar)ı onay için gönder
 *                         (--yeniden: bildirilmiş olanı da yeniden gönder)
 *   poll                  onay dokunuşlarını işle (idempotent; launchd tetikler)
 *
 * Gereken ortam değişkenleri (bkz. .env.local.example):
 *   TG_BOT_TOKEN   (whoami dahil tüm komutlar)
 *   TG_CHAT_ID     (send/notify/poll — güvenlik: yalnız bu chat iş yapar)
 * Yoksa: Türkçe fail-fast, exit 1.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { loadEnv } = require("./lib/env.cjs");
const TG = require("./lib/telegram.cjs");
const { nextDurum, normalizeDurum } = require("./lib/durum.cjs");

loadEnv();

const ROOT = path.join(__dirname, "..", "..");
const OUT_DIR = path.join(ROOT, "taslaklar");
const OFFSET_FILE = path.join(OUT_DIR, ".tg-offset");
const PUBLISHER = path.join(__dirname, "instagram-yayinla.cjs");

const TOKEN = process.env.TG_BOT_TOKEN || "";
const CHAT_ID = process.env.TG_CHAT_ID || "";

const args = process.argv.slice(2);
const cmd = args[0];
const has = (f) => args.includes(f);
// notify'ın pozisyonel slug'u: ilk konumda, '--' ile başlamayan argüman.
function positionalSlug() {
  const a = args[1];
  return a && !a.startsWith("--") ? a : null;
}

// ---------- Fail-fast env kapıları ----------
function requireToken() {
  if (!TOKEN) {
    console.error("TG_BOT_TOKEN tanımlı değil. tools/icerik-uretici/.env.local (veya kök .env.local) içine ekleyin.");
    console.error("Kurulum: tools/icerik-uretici/README.md → 'Telegram onay botu'.");
    process.exit(1);
  }
}
function requireTokenAndChat() {
  const eksik = [];
  if (!TOKEN) eksik.push("TG_BOT_TOKEN");
  if (!CHAT_ID) eksik.push("TG_CHAT_ID");
  if (eksik.length) {
    console.error(`Eksik ortam değişkeni: ${eksik.join(", ")}.`);
    console.error("tools/icerik-uretici/.env.local (veya kök .env.local) içine ekleyin.");
    console.error("TG_CHAT_ID'yi almak için: node tools/icerik-uretici/telegram-bot.cjs whoami");
    process.exit(1);
  }
}

// ---------- meta.json yardımcıları ----------
const metaPath = (slug) => path.join(OUT_DIR, slug, "meta.json");
function readMeta(slug) {
  const p = metaPath(slug);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}
function writeMeta(slug, meta) {
  fs.writeFileSync(metaPath(slug), JSON.stringify(meta, null, 2) + "\n");
}
function scanDrafts() {
  if (!fs.existsSync(OUT_DIR)) return [];
  return fs
    .readdirSync(OUT_DIR)
    .filter((d) => fs.existsSync(metaPath(d)))
    .sort()
    .map((slug) => {
      const dir = path.join(OUT_DIR, slug);
      const meta = readMeta(slug) || {};
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

// ---------- whoami ----------
async function whoami() {
  requireToken();
  const updates = await TG.getUpdates({ timeout: 0 }, { token: TOKEN });
  let chatId = null;
  for (const u of updates) {
    const msg = u.message || (u.callback_query && u.callback_query.message);
    if (msg && msg.chat) chatId = msg.chat.id;
  }
  if (chatId == null) {
    console.error("Güncelleme yok. Önce bota bir mesaj yaz (/start), sonra tekrar: whoami");
    console.error("(Not: grup chat id'si NEGATİFtir.)");
    process.exit(1);
  }
  console.log(chatId);
}

// ---------- send ----------
async function send(text) {
  requireTokenAndChat();
  if (!text) {
    console.error("Kullanım: node tools/icerik-uretici/telegram-bot.cjs send <mesaj>");
    process.exit(1);
  }
  await TG.sendMessage({ chatId: CHAT_ID, text }, { token: TOKEN });
  console.log("Gönderildi.");
}

// ---------- notify ----------
async function notifyOne(d) {
  const { slug, dir, meta, hasImage, hasReels } = d;
  const igPath = path.join(dir, "instagram.txt");
  const igText = fs.existsSync(igPath) ? fs.readFileSync(igPath, "utf8") : "";
  const caption = TG.buildCaption({ baslik: meta.baslik, instagramText: igText, slug });
  const keyboard = TG.buildApprovalKeyboard(slug, { hasReels });

  if (hasImage) {
    const photoBuffer = fs.readFileSync(path.join(dir, "gorsel.png"));
    await TG.sendPhoto({ chatId: CHAT_ID, photoBuffer, filename: "gorsel.png", caption, replyMarkup: keyboard }, { token: TOKEN });
  } else {
    // Görsel yoksa (beklenmez) yine de metin + butonlarla bildir.
    await TG.sendMessage({ chatId: CHAT_ID, text: caption, replyMarkup: keyboard }, { token: TOKEN });
  }

  // Reels önizlemesi — best-effort; düşerse onay akışı KIRILMAZ.
  if (hasReels) {
    try {
      const videoBuffer = fs.readFileSync(path.join(dir, "reels.mp4"));
      await TG.sendVideo({ chatId: CHAT_ID, videoBuffer, filename: "reels.mp4" }, { token: TOKEN });
    } catch (e) {
      console.warn(`  ⚠ reels önizlemesi gönderilemedi (${slug}): ${e.message}`);
    }
  }

  // Durum → bildirildi (tekrar-notify önlenir).
  const t = nextDurum(meta.durum, "bildir");
  if (t.ok) {
    meta.durum = t.durum;
    writeMeta(slug, meta);
  }
  console.log(`✓ Telegram'a bildirildi: ${slug} (durum: ${normalizeDurum(meta.durum)})`);
}

async function notify() {
  requireTokenAndChat();
  const slug = positionalSlug();
  const yeniden = has("--yeniden");
  const drafts = scanDrafts();
  const targets = TG.selectDraftsToNotify(drafts, { slug, yeniden });
  if (!targets.length) {
    console.log(
      slug
        ? `Bildirilecek taslak yok: ${slug} (durumu uygun değil; --yeniden ile zorlayabilirsin).`
        : "Bildirilecek 'taslak' durumunda içerik yok. (--yeniden ile bildirilmişleri tekrar gönder.)",
    );
    return;
  }
  for (const d of targets) {
    await notifyOne(d);
  }
  console.log(`\nToplam ${targets.length} taslak bildirildi. Telefondan ✅/❌ ile karara bağla; poll yayınlar.`);
}

// ---------- poll ----------
// Enjekte edilen spawn: publisher'ı MUTLAK node yoluyla çalıştır (launchd PATH dardır
// → 'node' bulunamaz; process.execPath = bu süreci başlatan node'un tam yolu).
function spawnPublisher(publisherPath, extraArgs, opts) {
  return spawnSync(process.execPath, [publisherPath, ...extraArgs], {
    encoding: "utf8",
    env: process.env,
    ...opts,
  });
}

async function poll() {
  requireTokenAndChat();
  const offset = TG.readOffset(OFFSET_FILE);
  let updates;
  try {
    updates = await TG.getUpdates(
      { offset: offset ? offset + 1 : undefined, timeout: 0 },
      { token: TOKEN },
    );
  } catch (e) {
    console.error(`poll: getUpdates başarısız, atlanıyor: ${e.message}`);
    return;
  }
  const deps = {
    allowedChatId: CHAT_ID,
    token: TOKEN,
    spawn: spawnPublisher,
    publisherPath: PUBLISHER,
    cwd: ROOT,
    readMeta,
    writeMeta,
    log: (m) => console.log(`✓ ${m}`),
    warn: (m) => console.warn(`poll: ${m}`),
    error: (m) => console.error(`poll: ${m}`),
  };
  for (const u of updates) {
    // Tek bozuk update tüm batch'i düşürmesin.
    try {
      if (u.callback_query) await TG.applyCallback(u.callback_query, deps);
    } catch (e) {
      console.error(`poll: update işlenemedi (${u.update_id}): ${e.message}`);
    }
    // Offset işlem DENENDİKTEN sonra ilerler: süreç işleme sırasında sert çökerse
    // update tüketilmez, sonraki poll yeniden işler; durum guard'ları çift-yayını önler.
    TG.setOffset(OFFSET_FILE, u.update_id);
  }
}

// ---------- Ana ----------
async function main() {
  if (!cmd || has("--help") || has("-h") || cmd === "help") {
    console.log([
      "Öz & Saye — Telegram onay botu (Instagram taslakları)",
      "",
      "  whoami                 bota son yazan chat id'sini yazdır (kurulum)",
      "  send <mesaj>           düz metin gönder",
      "  notify [slug]          durumu 'taslak' olanı onay için gönder",
      "  notify --hepsi         tüm 'taslak' durumundakileri gönder",
      "  notify <slug> --yeniden  bildirilmiş olanı yeniden gönder",
      "  poll                   onay dokunuşlarını işle (launchd 120s)",
      "",
      "Env: TG_BOT_TOKEN (+ TG_CHAT_ID; whoami hariç). Kurulum: README.md.",
    ].join("\n"));
    return;
  }
  if (cmd === "whoami") return whoami();
  if (cmd === "send") return send(args.slice(1).filter((a) => !a.startsWith("--")).join(" "));
  if (cmd === "notify") return notify();
  if (cmd === "poll") return poll();
  console.error(`Bilinmeyen komut: ${cmd}. Yardım: telegram-bot.cjs --help`);
  process.exit(1);
}

main().catch((e) => {
  console.error("Hata:", e.message);
  process.exit(1);
});
