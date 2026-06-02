import cron from "node-cron";
import { config } from "./config.js";
import { log } from "./util.js";
import { generateOne } from "./generate.js";
import { publishApproved } from "./publish.js";

// Sürekli çalışan mod: içerik üretimini ve onaylı içeriklerin yayınını
// zamanlanmış olarak yürütür. Üretim "pending" kuyruğuna düşer; siz
// onaylayınca (ozsaye approve) yayın cron'u devreye girer.
export function startScheduler() {
  const { generateCron, publishCron, timezone } = config.schedule;

  if (!cron.validate(generateCron)) {
    throw new Error(`Geçersiz GENERATE_CRON: ${generateCron}`);
  }
  if (!cron.validate(publishCron)) {
    throw new Error(`Geçersiz PUBLISH_CRON: ${publishCron}`);
  }

  log.title("Öz & Saye Otomasyon — sürekli mod");
  log.info(`Üretim zamanlaması : ${generateCron}  (${timezone})`);
  log.info(`Yayın zamanlaması  : ${publishCron}`);
  log.info(`Model              : ${config.ollama.model} @ ${config.ollama.url}`);
  log.info(`DRY_RUN            : ${config.dryRun}`);
  log.info("Onay için ayrı bir terminalde: npm run review\n");

  cron.schedule(
    generateCron,
    async () => {
      log.info("⏰ Zamanlanmış üretim başlıyor...");
      try {
        await generateOne();
      } catch (err) {
        log.error("Üretim hatası:", err.message);
      }
    },
    { timezone },
  );

  cron.schedule(
    publishCron,
    async () => {
      try {
        await publishApproved();
      } catch (err) {
        log.error("Yayın hatası:", err.message);
      }
    },
    { timezone },
  );

  log.ok("Zamanlayıcı çalışıyor. Durdurmak için Ctrl+C.");
}
