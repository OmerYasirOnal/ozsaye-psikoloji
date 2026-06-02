import { log } from "./util.js";
import { listItems, findItem, moveItem, saveItem } from "./queue.js";

function shortId(id) {
  return id.slice(0, 24);
}

/** Bekleyen ve onaylı içerikleri listeler. */
export function reviewList() {
  const pending = listItems("pending");
  const approved = listItems("approved");

  log.title(`İnceleme Kuyruğu — ${pending.length} bekliyor, ${approved.length} onaylı`);

  if (pending.length === 0) {
    console.log("  (bekleyen içerik yok)");
  }
  for (const it of pending) {
    console.log(
      `\n  • ${shortId(it.id)}\n    Başlık : ${it.content.title}` +
        `\n    Kategori: ${it.content.category}   Tarih: ${it.createdAt.slice(0, 16).replace("T", " ")}` +
        `\n    Görsel : ${it.imageUrl ? "var" : "YOK (Instagram için gerekli)"}`,
    );
  }

  console.log(
    `\nKomutlar:\n` +
      `  ozsaye show <id>             içeriği tam göster\n` +
      `  ozsaye approve <id>          onayla (yayın kuyruğuna al)\n` +
      `  ozsaye reject <id>           reddet\n` +
      `  ozsaye image <id> <url>      Instagram görseli (herkese açık URL) ekle\n` +
      `  ozsaye publish               onaylıları şimdi yayınla\n`,
  );
}

export function reviewShow(idOrPrefix) {
  const hit = findItem(idOrPrefix);
  if (!hit) return log.error(`Bulunamadı: ${idOrPrefix}`);
  const c = hit.item.content;
  log.title(`${c.title}  [${hit.status}]`);
  console.log(`ID         : ${hit.item.id}`);
  console.log(`Konu       : ${hit.item.topic}`);
  console.log(`Kategori   : ${c.category}`);
  console.log(`Yazar      : ${c.author}`);
  console.log(`Etiketler  : ${c.tags.join(", ")}`);
  console.log(`Açıklama   : ${c.description}`);
  console.log(`Görsel URL : ${hit.item.imageUrl || "(yok)"}`);
  console.log(`\n── Blog Gövdesi ──\n${c.bodyMarkdown}`);
  console.log(`\n── Instagram ──\n${c.instagramCaption}\n${c.hashtags.join(" ")}`);
  console.log(`\n── Facebook ──\n${c.facebookCaption}`);
}

export function approve(idOrPrefix) {
  const hit = findItem(idOrPrefix);
  if (!hit) return log.error(`Bulunamadı: ${idOrPrefix}`);
  if (hit.status !== "pending") {
    return log.warn(`Durum '${hit.status}', yalnızca 'pending' onaylanabilir.`);
  }
  if (hit.item.targets?.instagram && !hit.item.imageUrl) {
    log.warn(
      "Instagram hedefli ama görsel yok. Görsel eklemezseniz Instagram atlanır.",
    );
  }
  moveItem(hit.item, "approved");
  log.ok(`Onaylandı: ${hit.item.content.title}`);
}

export function reject(idOrPrefix) {
  const hit = findItem(idOrPrefix);
  if (!hit) return log.error(`Bulunamadı: ${idOrPrefix}`);
  moveItem(hit.item, "rejected");
  log.ok(`Reddedildi: ${hit.item.content.title}`);
}

export function setImage(idOrPrefix, url) {
  if (!url) return log.error("Görsel URL'si gerekli.");
  const hit = findItem(idOrPrefix);
  if (!hit) return log.error(`Bulunamadı: ${idOrPrefix}`);
  hit.item.imageUrl = url;
  saveItem(hit.item);
  log.ok(`Görsel eklendi: ${hit.item.content.title}`);
}
