/**
 * Ortam değişkeni yükleyici (standalone CJS araç).
 *
 * Öncelik: gerçek process.env > tools/icerik-uretici/.env.local > proje kökü
 * .env.local. (dotenv varsayılanı: zaten tanımlı değişkeni EZMEZ — bu yüzden
 * önce araç-yerel, sonra kök yüklenir; kök yalnız boşlukları doldurur.)
 *
 * Not: bu araç proje TypeScript'ini import ETMEZ; kök node_modules'tan
 * `dotenv`/`postgres`/`@vercel/blob` paketlerini çözer.
 */
"use strict";
const path = require("path");
const fs = require("fs");

const TOOL_DIR = path.join(__dirname, ".."); // tools/icerik-uretici
const ROOT_DIR = path.join(__dirname, "..", "..", ".."); // proje kökü

/** Yüklenecek .env.local adaylarını (öncelik sırasıyla) döndürür. */
function envCandidates() {
  return [path.join(TOOL_DIR, ".env.local"), path.join(ROOT_DIR, ".env.local")];
}

let loaded = false;
/** .env.local dosyalarını process.env'e yükler (bir kez). Yüklenen yolları döndürür. */
function loadEnv() {
  if (loaded) return [];
  loaded = true;
  const dotenv = require("dotenv");
  const used = [];
  for (const p of envCandidates()) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, quiet: true }); // override:false (varsayılan) → ilk/gerçek env kazanır
      used.push(p);
    }
  }
  return used;
}

module.exports = { loadEnv, envCandidates, TOOL_DIR, ROOT_DIR };
