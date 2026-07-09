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

function requireDatabaseUrl(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL ortam değişkeni ayarlanmalı — yanlış veritabanında silme yapılmasını önler.",
    );
  }
}

(async () => {
  let client: { end: () => Promise<void> } | undefined;
  try {
    const gunSayisi = parseGunSayisi();
    requireDatabaseUrl();
    const dbModule = await import("../src/lib/db");
    const randevuDb = await import("../src/lib/randevu-db");
    client = dbModule.client;
    const count = await randevuDb.purgeOldRequests(gunSayisi);
    console.log(`${count} eski randevu talebi silindi (${gunSayisi} gün eşiği).`);
  } catch (error) {
    console.error(
      "Eski randevu talepleri temizlenemedi:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  } finally {
    await client?.end();
  }
})();
