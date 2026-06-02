// Ortak yardımcılar: loglama, Türkçe slug, tarih.

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function stamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

export const log = {
  info: (...a) => console.log(`${COLORS.dim}[${stamp()}]${COLORS.reset}`, ...a),
  ok: (...a) =>
    console.log(`${COLORS.green}✓${COLORS.reset}`, ...a),
  warn: (...a) =>
    console.warn(`${COLORS.yellow}⚠${COLORS.reset}`, ...a),
  error: (...a) => console.error(`${COLORS.red}✗${COLORS.reset}`, ...a),
  title: (t) =>
    console.log(`\n${COLORS.cyan}── ${t} ──${COLORS.reset}`),
};

const TR_MAP = {
  ç: "c", Ç: "c", ğ: "g", Ğ: "g", ı: "i", I: "i", İ: "i",
  ö: "o", Ö: "o", ş: "s", Ş: "s", ü: "u", Ü: "u",
};

/** Türkçe karakterleri sadeleştirip URL-uyumlu slug üretir. */
export function slugify(text) {
  return String(text)
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** YYYY-MM-DD (bugün, yerel). */
export function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
