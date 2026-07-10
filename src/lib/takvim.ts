import { istanbulGunAnahtari } from "@/lib/talepler";

/**
 * Panel ajanda takvimi için SAF ay/ızgara yardımcıları — DB/React YOK, düz
 * Vitest ile test edilir. Saat dilimi İstanbul (UTC+3 sabit, DST yok):
 * mutlak-an dönüşümleri bu varsayımla açık +03:00 offset kullanır.
 */

export type TakvimAyi = { yil: number; ay: number }; // ay: 1-12

export const HAFTA_GUNLERI = [
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
  "Paz",
] as const;

/** "YYYY-MM" → TakvimAyi; geçersiz/boş → içinde bulunulan İstanbul ayı. */
export function ayParametresi(
  ham: string | undefined,
  simdi: Date = new Date(),
): TakvimAyi {
  const m = /^(\d{4})-(\d{2})$/.exec(ham ?? "");
  if (m) {
    const yil = Number(m[1]);
    const ay = Number(m[2]);
    if (ay >= 1 && ay <= 12) return { yil, ay };
  }
  const [y, a] = istanbulGunAnahtari(simdi).split("-");
  return { yil: Number(y), ay: Number(a) };
}

/** "Temmuz 2026" (tr-TR). */
export function ayEtiketi(a: TakvimAyi): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    month: "long",
    year: "numeric",
  }).format(new Date(`${ayDegeri(a)}-15T12:00:00+03:00`));
}

/** Link parametresi biçimi: "2026-07". */
export function ayDegeri(a: TakvimAyi): string {
  return `${a.yil}-${String(a.ay).padStart(2, "0")}`;
}

export function oncekiAy(a: TakvimAyi): TakvimAyi {
  return a.ay === 1 ? { yil: a.yil - 1, ay: 12 } : { yil: a.yil, ay: a.ay - 1 };
}

export function sonrakiAy(a: TakvimAyi): TakvimAyi {
  return a.ay === 12 ? { yil: a.yil + 1, ay: 1 } : { yil: a.yil, ay: a.ay + 1 };
}

/** İstanbul ay sınırları: [ay başı, sonraki ay başı) mutlak anlar. */
export function ayAraligi(a: TakvimAyi): { baslangic: Date; bitis: Date } {
  const baslangic = new Date(`${ayDegeri(a)}-01T00:00:00+03:00`);
  const bitis = new Date(`${ayDegeri(sonrakiAy(a))}-01T00:00:00+03:00`);
  return { baslangic, bitis };
}

/** "YYYY-MM-DD" (sıfır dolgulu) — hücre/randevu eşleme anahtarı. */
export function gunAnahtariOlustur(a: TakvimAyi, gun: number): string {
  return `${ayDegeri(a)}-${String(gun).padStart(2, "0")}`;
}

/**
 * Pzt-hizalı ay ızgarası: hafta dizileri, hücre = ay günü (1..N) veya null
 * (dolgu). Haftanın günü takvim tarihinin kendisinden türetilir (UTC üzerinde
 * hesap; takvim günü saat diliminden bağımsızdır).
 */
export function ayIzgarasi(a: TakvimAyi): (number | null)[][] {
  const gunSayisi = new Date(Date.UTC(a.yil, a.ay, 0)).getUTCDate();
  // getUTCDay: 0=Paz..6=Cmt → Pzt=0..Paz=6'ya çevir.
  const ilkGunIdx = (new Date(Date.UTC(a.yil, a.ay - 1, 1)).getUTCDay() + 6) % 7;

  const hucreler: (number | null)[] = [
    ...Array.from({ length: ilkGunIdx }, () => null),
    ...Array.from({ length: gunSayisi }, (_, i) => i + 1),
  ];
  while (hucreler.length % 7 !== 0) hucreler.push(null);

  const haftalar: (number | null)[][] = [];
  for (let i = 0; i < hucreler.length; i += 7) {
    haftalar.push(hucreler.slice(i, i + 7));
  }
  return haftalar;
}
