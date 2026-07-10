import { expect, test } from "vitest";
import {
  ayAraligi,
  ayDegeri,
  ayEtiketi,
  ayIzgarasi,
  ayParametresi,
  gunAnahtariOlustur,
  oncekiAy,
  sonrakiAy,
} from "./takvim";

test("ayParametresi: geçerli değer ayrıştırılır, geçersiz bugüne düşer", () => {
  expect(ayParametresi("2026-07")).toEqual({ yil: 2026, ay: 7 });
  // 31 Ara 22:00 UTC = 1 Oca 01:00 İstanbul → İstanbul ayı Ocak 2027
  const simdi = new Date("2026-12-31T22:00:00Z");
  expect(ayParametresi(undefined, simdi)).toEqual({ yil: 2027, ay: 1 });
  expect(ayParametresi("bozuk", simdi)).toEqual({ yil: 2027, ay: 1 });
  expect(ayParametresi("2026-13", simdi)).toEqual({ yil: 2027, ay: 1 });
  expect(ayParametresi("2026-00", simdi)).toEqual({ yil: 2027, ay: 1 });
});

test("ayEtiketi / ayDegeri / önceki / sonraki", () => {
  expect(ayEtiketi({ yil: 2026, ay: 7 })).toBe("Temmuz 2026");
  expect(ayDegeri({ yil: 2026, ay: 7 })).toBe("2026-07");
  expect(oncekiAy({ yil: 2026, ay: 1 })).toEqual({ yil: 2025, ay: 12 });
  expect(sonrakiAy({ yil: 2026, ay: 12 })).toEqual({ yil: 2027, ay: 1 });
});

test("ayAraligi: İstanbul ay sınırları [dahil, hariç)", () => {
  const { baslangic, bitis } = ayAraligi({ yil: 2026, ay: 7 });
  // 1 Tem 2026 00:00 İstanbul = 30 Haz 21:00 UTC
  expect(baslangic.toISOString()).toBe("2026-06-30T21:00:00.000Z");
  expect(bitis.toISOString()).toBe("2026-07-31T21:00:00.000Z");
});

test("ayIzgarasi: Pzt hizalı; Temmuz 2026 Çarşamba başlar", () => {
  const haftalar = ayIzgarasi({ yil: 2026, ay: 7 });
  // 1 Tem 2026 = Çarşamba → ilk hafta [null, null, 1, 2, 3, 4, 5]
  expect(haftalar[0]).toEqual([null, null, 1, 2, 3, 4, 5]);
  const duz = haftalar.flat().filter((g) => g !== null);
  expect(duz.length).toBe(31);
  expect(duz[0]).toBe(1);
  expect(duz[30]).toBe(31);
  for (const hafta of haftalar) expect(hafta.length).toBe(7);
});

test("ayIzgarasi: Şubat 2027 Pazartesi başlar (dolgu yok), artık yıl 2028", () => {
  expect(ayIzgarasi({ yil: 2027, ay: 2 })[0]).toEqual([1, 2, 3, 4, 5, 6, 7]);
  expect(
    ayIzgarasi({ yil: 2028, ay: 2 }).flat().filter((g) => g !== null).length,
  ).toBe(29);
});

test("gunAnahtariOlustur: sıfır dolgulu", () => {
  expect(gunAnahtariOlustur({ yil: 2026, ay: 7 }, 5)).toBe("2026-07-05");
});
