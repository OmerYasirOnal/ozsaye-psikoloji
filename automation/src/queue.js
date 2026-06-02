import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";

// Basit, dosya tabanlı inceleme kuyruğu. Her içerik bir JSON dosyasıdır ve
// durumuna göre bir alt klasörde durur:
//   pending   → üretildi, onay bekliyor
//   approved  → onaylandı, yayınlanacak
//   published → yayınlandı
//   rejected  → reddedildi

export const STATUSES = ["pending", "approved", "published", "rejected"];

const QUEUE_DIR = path.join(config.dataDir, "queue");
const STATE_FILE = path.join(config.dataDir, "state.json");

function dirFor(status) {
  return path.join(QUEUE_DIR, status);
}

export function ensureDirs() {
  for (const s of STATUSES) fs.mkdirSync(dirFor(s), { recursive: true });
}

function fileFor(status, id) {
  return path.join(dirFor(status), `${id}.json`);
}

export function saveItem(item) {
  ensureDirs();
  const file = fileFor(item.status, item.id);
  fs.writeFileSync(file, JSON.stringify(item, null, 2), "utf8");
  return file;
}

export function listItems(status) {
  ensureDirs();
  const dir = dirFor(status);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")))
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

/** Tüm durumlarda id ile (kısmi eşleşme de kabul) öğe bulur. */
export function findItem(idOrPrefix) {
  for (const status of STATUSES) {
    const items = listItems(status);
    const hit =
      items.find((i) => i.id === idOrPrefix) ||
      items.find((i) => i.id.startsWith(idOrPrefix));
    if (hit) return { item: hit, status };
  }
  return null;
}

export function moveItem(item, toStatus) {
  const from = fileFor(item.status, item.id);
  if (fs.existsSync(from)) fs.rmSync(from);
  item.status = toStatus;
  return saveItem(item);
}

export function loadState() {
  if (!fs.existsSync(STATE_FILE)) return { usedTopics: [] };
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { usedTopics: [] };
  }
}

export function saveState(state) {
  ensureDirs();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}
