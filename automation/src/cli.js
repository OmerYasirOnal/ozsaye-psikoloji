#!/usr/bin/env node
import { config } from "./config.js";
import { log } from "./util.js";
import { checkOllama } from "./llm.js";
import { ensureDirs } from "./queue.js";
import { generateOne } from "./generate.js";
import { publishApproved } from "./publish.js";
import { startScheduler } from "./scheduler.js";
import {
  reviewList,
  reviewShow,
  approve,
  reject,
  setImage,
} from "./review.js";

const HELP = `
Öz & Saye Otomasyon — Local LLM tabanlı otomatik içerik & yayın sistemi

Kullanım: ozsaye <komut> [argümanlar]

Komutlar:
  generate [konu...]      Bir içerik taslağı üret (pending'e ekler)
  review                  Bekleyen/onaylı içerikleri listele
  show <id>               Bir içeriği tam göster
  approve <id>            İçeriği onayla (yayın kuyruğuna al)
  reject <id>             İçeriği reddet
  image <id> <url>        Instagram için herkese açık görsel URL'si ekle
  publish                 Onaylı içerikleri şimdi yayınla
  start                   Sürekli mod (zamanlanmış üretim + yayın)
  doctor                  Ortam/bağlantı kontrolü
  help                    Bu yardım

Örnek akış:
  ozsaye generate            # üret
  ozsaye review              # incele, id'yi bul
  ozsaye approve 1700000000  # onayla
  ozsaye publish             # yayınla (web→git push, FB, IG)
`;

async function doctor() {
  log.title("Ortam Kontrolü");
  log.info(`Repo dizini : ${config.repoDir}`);
  log.info(`Model       : ${config.ollama.model} @ ${config.ollama.url}`);
  log.info(`Deploy branch: ${config.website.deployBranch}`);
  log.info(`Platformlar : web=${config.platforms.website} fb=${config.platforms.facebook} ig=${config.platforms.instagram}`);
  log.info(`DRY_RUN     : ${config.dryRun}`);

  const health = await checkOllama();
  if (health.ok) {
    log.ok(`Ollama erişilebilir. Modeller: ${health.models.join(", ") || "(yok)"}`);
    if (!health.hasModel) log.warn(`Önerilen model eksik: ollama pull ${config.ollama.model}`);
  } else {
    log.error(`Ollama'ya bağlanılamadı: ${health.reason}`);
  }

  const meta = config.meta;
  log.info(`Facebook    : ${meta.fbPageId && meta.fbPageToken ? "yapılandırılmış" : "EKSİK"}`);
  log.info(`Instagram   : ${meta.igUserId && meta.igToken ? "yapılandırılmış" : "EKSİK"}`);
}

async function main() {
  ensureDirs();
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case "generate":
      await generateOne(args.length ? args.join(" ") : undefined);
      break;
    case "review":
      reviewList();
      break;
    case "show":
      reviewShow(args[0]);
      break;
    case "approve":
      approve(args[0]);
      break;
    case "reject":
      reject(args[0]);
      break;
    case "image":
      setImage(args[0], args[1]);
      break;
    case "publish":
      await publishApproved();
      break;
    case "start":
      startScheduler();
      break;
    case "doctor":
      await doctor();
      break;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      console.log(HELP);
      break;
    default:
      log.error(`Bilinmeyen komut: ${cmd}`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main().catch((err) => {
  log.error(err.message);
  process.exitCode = 1;
});
