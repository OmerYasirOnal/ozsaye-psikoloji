import { client } from "../src/lib/db";
import { purgeOldRequests } from "../src/lib/randevu-db";

const DEFAULT_DAYS = 365;

function parseGunSayisi(): number {
  const raw = process.argv[2] ?? process.env.PURGE_OLD_REQUESTS_DAYS;
  if (!raw) return DEFAULT_DAYS;

  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(
      "Gün sayısı pozitif bir tam sayı olmalı. Örn: tsx scripts/purge-old-requests.ts 365",
    );
  }
  return value;
}

(async () => {
  try {
    const gunSayisi = parseGunSayisi();
    const count = await purgeOldRequests(gunSayisi);
    console.log(`${count} eski randevu talebi silindi (${gunSayisi} gün eşiği).`);
  } catch (error) {
    console.error(
      "Eski randevu talepleri temizlenemedi:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await client.end();
  }
})();
