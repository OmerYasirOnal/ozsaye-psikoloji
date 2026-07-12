#!/usr/bin/env node
/**
 * Öz & Saye — ozsaye.com uptime izleyici.
 *
 * launchd ile periyodik (bkz. launchd/com.ozsaye.uptime-izleme.plist) çalışır.
 * Site'e kısa zaman aşımlı bir istek atar; durum ÖNCEKİ kontrole göre
 * DEĞİŞTİYSE Telegram'a haber verir (her kontrolde değil — spam olmasın).
 * Tek bir başarısız kontrol yanlış alarm olabileceğinden, "düşük" durumuna
 * geçmek için art arda 2 başarısız kontrol (varsayılan 5 dk aralıkla ~10 dk
 * sürekli kesinti) gerekir. Kimlik bilgileri tools/icerik-uretici/.env.local
 * ile PAYLAŞILIR (aynı operasyon botu, TG_CHAT_ID=Ömer'in özel sohbeti).
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const ENV_FILE = path.join(ROOT, "tools", "icerik-uretici", ".env.local");
const STATE_FILE = path.join(__dirname, "durum.json");
const URL = process.env.UPTIME_URL || "https://ozsaye.com/";
const TIMEOUT_MS = 12_000;
const FAIL_ESIGI = 2; // art arda başarısız kontrol sayısı — "düşük" ilan etmeden önce

function envDegeriOku(dosya, anahtar) {
  if (!fs.existsSync(dosya)) return null;
  const satir = fs
    .readFileSync(dosya, "utf8")
    .split("\n")
    .find((l) => l.trim().startsWith(`${anahtar}=`));
  if (!satir) return null;
  return satir.slice(satir.indexOf("=") + 1).trim();
}

function durumOku() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function durumYaz(durum) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(durum, null, 2) + "\n");
}

async function siteyiKontrolEt() {
  const controller = new AbortController();
  const zamanAsimi = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const yanit = await fetch(URL, { signal: controller.signal });
    return { basarili: yanit.status >= 200 && yanit.status < 400, detay: `HTTP ${yanit.status}` };
  } catch (e) {
    return { basarili: false, detay: (e && e.message) || "ağ hatası" };
  } finally {
    clearTimeout(zamanAsimi);
  }
}

async function telegramaGonder(mesaj) {
  const token = envDegeriOku(ENV_FILE, "TG_BOT_TOKEN");
  const chatId = envDegeriOku(ENV_FILE, "TG_CHAT_ID");
  if (!token || !chatId) {
    console.error("[uptime-izleme] TG_BOT_TOKEN/TG_CHAT_ID bulunamadı, Telegram atlandı.");
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ chat_id: chatId, text: mesaj }),
    });
    const json = await res.json();
    if (!json.ok) console.error("[uptime-izleme] Telegram hata:", json.description);
  } catch (e) {
    console.error("[uptime-izleme] Telegram gönderilemedi:", e.message);
  }
}

async function main() {
  const onceki = durumOku();
  const sonuc = await siteyiKontrolEt();
  const simdi = new Date().toISOString();

  const oncekiAyaktaMi = onceki ? onceki.ayaktaMi : true; // ilk çalıştırmada baz alınır, alarm basılmaz
  const oncekiSerisi = onceki ? onceki.basarisizSerisi || 0 : 0;

  if (sonuc.basarili) {
    if (!oncekiAyaktaMi) {
      const kacDkOnce = onceki && onceki.dustuguAn
        ? Math.round((Date.now() - new Date(onceki.dustuguAn).getTime()) / 60000)
        : null;
      await telegramaGonder(
        `✅ ozsaye.com tekrar erişilebilir (${sonuc.detay})` +
          (kacDkOnce != null ? `\n~${kacDkOnce} dakika kesintiden sonra.` : ""),
      );
    }
    durumYaz({ ayaktaMi: true, basarisizSerisi: 0, sonKontrol: simdi });
    console.log(`[${simdi}] OK ${sonuc.detay}`);
    return;
  }

  const yeniSerisi = oncekiSerisi + 1;
  if (yeniSerisi >= FAIL_ESIGI && oncekiAyaktaMi) {
    await telegramaGonder(
      `🔴 ozsaye.com'a ulaşılamıyor (${sonuc.detay})\n${yeniSerisi} art arda başarısız kontrol.`,
    );
    durumYaz({ ayaktaMi: false, basarisizSerisi: yeniSerisi, sonKontrol: simdi, dustuguAn: simdi });
  } else {
    durumYaz({
      ayaktaMi: oncekiAyaktaMi,
      basarisizSerisi: yeniSerisi,
      sonKontrol: simdi,
      dustuguAn: onceki && onceki.dustuguAn,
    });
  }
  console.log(`[${simdi}] BAŞARISIZ (${yeniSerisi}. deneme) ${sonuc.detay}`);
}

main().catch((e) => {
  console.error("[uptime-izleme] beklenmeyen hata:", (e && e.stack) || e);
  process.exit(1);
});
