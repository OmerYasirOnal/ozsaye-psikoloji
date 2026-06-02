import { config } from "./config.js";
import { log } from "./util.js";
import { listItems, saveItem, moveItem } from "./queue.js";
import { publishToWebsite } from "./publishers/website.js";
import { publishToFacebook, publishToInstagram } from "./publishers/meta.js";

// Bir platform "tamamlanmış" (settled) sayılır: ya başarıyla yayınlandı,
// ya da yapılandırma eksikliğinden atlandı. Yalnızca "görsel yok" durumu
// öğeyi approved'da bırakır (görsel eklenince tekrar denenir).
function isSettled(entry) {
  if (!entry) return false;
  if (entry.done) return true;
  if (entry.skipped && entry.reason !== "no-image") return true;
  return false;
}

async function publishItem(item) {
  const targets = item.targets || {};
  const plog = item.publishLog || {};
  item.publishLog = plog;

  // 1) Web sitesi (önce — diğer platformların bağlantısı için)
  if (targets.website && config.platforms.website && !plog.website?.done) {
    try {
      const r = await publishToWebsite(item);
      plog.website = { done: true, ...r };
    } catch (err) {
      plog.website = { error: err.message };
      log.error(`[${item.id}] Web yayını başarısız: ${err.message}`);
    }
    saveItem(item);
  }

  const link = plog.website?.url || config.siteUrl;

  // 2) Facebook
  if (targets.facebook && config.platforms.facebook && !plog.facebook?.done) {
    try {
      const r = await publishToFacebook(item, link);
      plog.facebook = r.skipped ? { skipped: true, ...r } : { done: true, ...r };
    } catch (err) {
      plog.facebook = { error: err.message };
      log.error(`[${item.id}] Facebook yayını başarısız: ${err.message}`);
    }
    saveItem(item);
  }

  // 3) Instagram
  if (targets.instagram && config.platforms.instagram && !plog.instagram?.done) {
    try {
      const r = await publishToInstagram(item, link);
      plog.instagram = r.skipped ? { skipped: true, ...r } : { done: true, ...r };
    } catch (err) {
      plog.instagram = { error: err.message };
      log.error(`[${item.id}] Instagram yayını başarısız: ${err.message}`);
    }
    saveItem(item);
  }

  // Etkin tüm hedefler tamamlandıysa published'a taşı
  const pending = [];
  if (targets.website && config.platforms.website && !isSettled(plog.website))
    pending.push("website");
  if (targets.facebook && config.platforms.facebook && !isSettled(plog.facebook))
    pending.push("facebook");
  if (targets.instagram && config.platforms.instagram && !isSettled(plog.instagram))
    pending.push("instagram");

  if (pending.length === 0) {
    item.publishedAt = new Date().toISOString();
    moveItem(item, "published");
    log.ok(`[${item.id}] Yayın tamamlandı.`);
  } else {
    log.warn(`[${item.id}] Bekleyen platform(lar): ${pending.join(", ")} — approved'da kalıyor.`);
  }
}

/** Onaylanmış (approved) tüm öğeleri yayınlamayı dener. */
export async function publishApproved() {
  const items = listItems("approved");
  if (items.length === 0) {
    log.info("Yayınlanacak onaylı içerik yok.");
    return;
  }
  log.info(`${items.length} onaylı içerik yayınlanıyor...`);
  for (const item of items) {
    await publishItem(item);
  }
}
