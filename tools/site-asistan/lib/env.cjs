/**
 * Ortam değişkeni yükleyici (standalone CJS araç) — tools/icerik-uretici/lib/env.cjs
 * ile birebir aynı desen, yalnız yol sabitleri bu aracın konumuna göre.
 */
"use strict";
const path = require("path");
const fs = require("fs");

const TOOL_DIR = path.join(__dirname, ".."); // tools/site-asistan
const ROOT_DIR = path.join(__dirname, "..", "..", ".."); // proje kökü

function envCandidates() {
  return [path.join(TOOL_DIR, ".env.local"), path.join(ROOT_DIR, ".env.local")];
}

let loaded = false;
function loadEnv() {
  if (loaded) return [];
  loaded = true;
  const dotenv = require("dotenv");
  const used = [];
  for (const p of envCandidates()) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p, quiet: true });
      used.push(p);
    }
  }
  return used;
}

module.exports = { loadEnv, envCandidates, TOOL_DIR, ROOT_DIR };
