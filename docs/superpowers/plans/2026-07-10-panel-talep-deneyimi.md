# Randevu Talep Deneyimi Yenileme — Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Panel talep ekranlarını iş takip aracına çevirmek: açılır-kapanır ajanda takvimi, detayda durum stepper'ı + tek tık ilerletme, listede göreli zaman + tercih tarihi çipi, sayılı filtreler + nav rozeti, "Fark etmez" dil düzeltmesi.

**Architecture:** Saf yardımcılar (`talepler.ts`, yeni `takvim.ts`) birim testli; DB katmanına tek yeni kapsam-korumalı sorgu (`listPlanliTakvim`); bir yeni Server Action (`talebiDurumIlerlet`, beyaz-listeli geçişler); UI native `<details>` + saf Tailwind (kütüphane yok). Spec: `docs/superpowers/specs/2026-07-10-randevu-talep-deneyimi-design.md`.

**Tech Stack:** Next 16.2.6 App Router, React 19, Tailwind v4, Drizzle, Vitest (Docker Postgres), `Intl` (tr-TR / Europe/Istanbul).

## Global Constraints

- **Renk disiplini (CLAUDE.md):** metin yalnız `text-forest`/`text-forest-muted`; opaklık-metin yasak; `sage` yalnız ikon/aksan; yüzeyler warm-white/cream/forest.
- **`DurumRozeti.ROZET_SINIF` ve `RANDEVU_AKSAN_SINIFI` DEĞİŞTİRİLMEZ.**
- **Yetki:** her yeni sorgu `kapsamKosulu(expertSlug, isAdmin)`; her yeni action `verifySession` → `getStaffByEmail` ile başlar.
- **Yeni npm bağımlılığı YOK.** `server-only`, düz Vitest'ten import edilen dosyalara KONMAZ (Faz 0 kuralı; `talepler.ts`/`takvim.ts`/`talepler-db.ts` bu sınıftadır).
- Tüm arayüz metni Türkçe. Next 16: `searchParams`/`params` Promise — `await` edilir.
- Saat dilimi: İstanbul (UTC+3, DST yok) — mevcut `istanbulInputDegeri`/`istanbulTarihSaat` desenleriyle tutarlı.
- Her commit `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` trailer'ı ile biter. Commit öncesi `git branch --show-current` = `panel-talep-deneyimi` doğrulanır.
- DB testleri Docker Postgres ister: `DB_HOST_PORT=5433 docker compose up -d db` (bu makinede 5432 dolu).

---

### Task 1: Saf yardımcılar — göreli zaman, tercih tarihi, geçiş beyaz listesi

**Files:**
- Modify: `src/lib/talepler.ts` (dosya sonuna 4 yeni fonksiyon)
- Create: `src/lib/talepler.test.ts`

**Interfaces:**
- Consumes: mevcut `RandevuDurum` tipi (aynı dosya).
- Produces (`@/lib/talepler`):
  - `istanbulGunAnahtari(d: Date): string` — "YYYY-MM-DD" (İstanbul günü; Task 2 ve 5 de kullanır)
  - `goreliZaman(tarih: Date, simdi?: Date): string`
  - `tercihEdilenTarih(preferredNote: string | null): string | null` — Türkçe kısa tarih ("15 Tem") veya null
  - `izinliGecis(mevcut: RandevuDurum, hedef: RandevuDurum): boolean`

- [ ] **Step 1: Başarısız testleri yaz (`src/lib/talepler.test.ts`)**

```ts
import { expect, test } from "vitest";
import {
  goreliZaman,
  istanbulGunAnahtari,
  izinliGecis,
  tercihEdilenTarih,
} from "./talepler";

// Sabit "şimdi": 15 Temmuz 2026 14:00 İstanbul (= 11:00 UTC)
const SIMDI = new Date("2026-07-15T11:00:00Z");

test("istanbulGunAnahtari: UTC gece yarısı sınırında İstanbul gününü verir", () => {
  // 14 Tem 22:30 UTC = 15 Tem 01:30 İstanbul
  expect(istanbulGunAnahtari(new Date("2026-07-14T22:30:00Z"))).toBe("2026-07-15");
  expect(istanbulGunAnahtari(new Date("2026-07-14T20:30:00Z"))).toBe("2026-07-14");
});

test("goreliZaman: dakika/saat/dün/gün/kısa-tarih basamakları", () => {
  expect(goreliZaman(new Date("2026-07-15T10:59:30Z"), SIMDI)).toBe("az önce");
  expect(goreliZaman(new Date("2026-07-15T10:20:00Z"), SIMDI)).toBe("40 dakika önce");
  expect(goreliZaman(new Date("2026-07-15T08:00:00Z"), SIMDI)).toBe("3 saat önce");
  // Önceki İstanbul günü → "dün" (saat farkı <24 olsa bile)
  expect(goreliZaman(new Date("2026-07-14T18:00:00Z"), SIMDI)).toBe("dün");
  expect(goreliZaman(new Date("2026-07-12T11:00:00Z"), SIMDI)).toBe("3 gün önce");
  // ≥7 gün → Türkçe kısa tarih
  expect(goreliZaman(new Date("2026-07-01T11:00:00Z"), SIMDI)).toBe("1 Tem");
});

test("tercihEdilenTarih: kendi önekimizden ayrıştırır", () => {
  expect(
    tercihEdilenTarih("Tercih edilen tarih: 2026-07-20\n\nAkşam uygun."),
  ).toBe("20 Tem");
  expect(tercihEdilenTarih("Tercih edilen tarih: belirtilmedi\n\nNot.")).toBeNull();
  expect(tercihEdilenTarih("Serbest metin, önek yok")).toBeNull();
  expect(tercihEdilenTarih(null)).toBeNull();
  // Takvim-geçersiz tarih sessizce elenmeli
  expect(tercihEdilenTarih("Tercih edilen tarih: 2026-02-30\n\n")).toBeNull();
});

test("izinliGecis: yalnız beyaz-listeli geçişler", () => {
  expect(izinliGecis("new", "contacted")).toBe(true);
  expect(izinliGecis("scheduled", "done")).toBe(true);
  expect(izinliGecis("new", "cancelled")).toBe(true);
  expect(izinliGecis("contacted", "cancelled")).toBe(true);
  expect(izinliGecis("scheduled", "cancelled")).toBe(true);
  // Reddedilenler
  expect(izinliGecis("new", "scheduled")).toBe(false); // tarih gerekir → form
  expect(izinliGecis("contacted", "done")).toBe(false);
  expect(izinliGecis("done", "cancelled")).toBe(false);
  expect(izinliGecis("cancelled", "contacted")).toBe(false);
  expect(izinliGecis("new", "new")).toBe(false);
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test src/lib/talepler.test.ts`
Expected: FAIL (fonksiyonlar export edilmemiş).

- [ ] **Step 3: `src/lib/talepler.ts` sonuna fonksiyonları ekle**

```ts
/** İstanbul gün anahtarı "YYYY-MM-DD" — gün karşılaştırma/bazlama için tek kaynak. */
export function istanbulGunAnahtari(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Türkçe kısa tarih (İstanbul), ör. "8 Tem". */
function istanbulKisaTarih(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "short",
  }).format(d);
}

/**
 * Liste satırları için göreli zaman: "az önce" → "X dakika önce" → (aynı
 * İstanbul günü) "X saat önce" → "dün" → "X gün önce" (<7) → kısa tarih.
 * Tam damga detay sayfasında zaten mevcut; buradaki amaç taranabilirlik.
 */
export function goreliZaman(tarih: Date, simdi: Date = new Date()): string {
  const dakika = Math.floor((simdi.getTime() - tarih.getTime()) / 60_000);
  if (dakika < 1) return "az önce";
  if (dakika < 60) return `${dakika} dakika önce`;
  if (istanbulGunAnahtari(tarih) === istanbulGunAnahtari(simdi)) {
    return `${Math.floor(dakika / 60)} saat önce`;
  }
  // Takvim-günü farkı (İstanbul): "dün" saat farkına değil gün sınırına bakar.
  const gunFarki = Math.round(
    (Date.parse(istanbulGunAnahtari(simdi)) -
      Date.parse(istanbulGunAnahtari(tarih))) /
      86_400_000,
  );
  if (gunFarki === 1) return "dün";
  if (gunFarki < 7) return `${gunFarki} gün önce`;
  return istanbulKisaTarih(tarih);
}

/**
 * Hastanın tercih tarihini, randevu-db.ts'in ürettiği sabit
 * "Tercih edilen tarih: <değer>" önekinden ayrıştırır (v1 köprüsü — kolon
 * eklenirse (v2) tek çağrı yerinden sökülür). Değer YYYY-MM-DD değilse
 * ("belirtilmedi" dahil) veya takvim-geçersizse null → çip gösterilmez.
 */
export function tercihEdilenTarih(preferredNote: string | null): string | null {
  if (!preferredNote) return null;
  const m = /^Tercih edilen tarih: (.+)$/m.exec(preferredNote);
  if (!m) return null;
  const deger = m[1].trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(deger)) return null;
  // Öğlen sabitlemesi: +03:00'da gün kayması imkânsız; ISO ayrıştırıcı
  // takvim-geçersiz günü (30 Şubat) NaN yapar.
  const d = new Date(`${deger}T12:00:00+03:00`);
  if (Number.isNaN(d.getTime())) return null;
  return istanbulKisaTarih(d);
}

/**
 * Tek tık durum ilerletme beyaz listesi. "Planlandı" tarihe ihtiyaç duyduğu
 * için burada YOK (Yönet formu üzerinden). Kapanmış durumlardan (done/
 * cancelled) çıkış da formun durum select'ine bırakılır (kurtarma yolu).
 */
export function izinliGecis(mevcut: RandevuDurum, hedef: RandevuDurum): boolean {
  if (hedef === "cancelled") {
    return mevcut === "new" || mevcut === "contacted" || mevcut === "scheduled";
  }
  return (
    (mevcut === "new" && hedef === "contacted") ||
    (mevcut === "scheduled" && hedef === "done")
  );
}
```

- [ ] **Step 4: Testin geçtiğini gör**

Run: `npm test src/lib/talepler.test.ts`
Expected: PASS (4 test).

- [ ] **Step 5: Tam doğrulama + commit**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: hepsi temiz (yeni testler dahil).

```bash
git add src/lib/talepler.ts src/lib/talepler.test.ts
git commit -m "feat(panel): saf yardımcılar — göreli zaman, tercih tarihi ayrıştırma, geçiş beyaz listesi" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Takvim saf yardımcıları (`src/lib/takvim.ts`)

**Files:**
- Create: `src/lib/takvim.ts`
- Create: `src/lib/takvim.test.ts`

**Interfaces:**
- Consumes: `istanbulGunAnahtari` (Task 1, `@/lib/talepler`).
- Produces (`@/lib/takvim`):
  - `type TakvimAyi = { yil: number; ay: number }` (ay 1-12)
  - `ayParametresi(ham: string | undefined, simdi?: Date): TakvimAyi` — "YYYY-MM" ayrıştırır; geçersiz/boşsa içinde bulunulan İstanbul ayı
  - `ayEtiketi(a: TakvimAyi): string` — "Temmuz 2026"
  - `oncekiAy(a: TakvimAyi): TakvimAyi` / `sonrakiAy(a: TakvimAyi): TakvimAyi`
  - `ayDegeri(a: TakvimAyi): string` — "2026-07" (link parametresi)
  - `ayAraligi(a: TakvimAyi): { baslangic: Date; bitis: Date }` — İstanbul ay başı [dahil, hariç) mutlak anlar
  - `ayIzgarasi(a: TakvimAyi): (number | null)[][]` — Pzt-hizalı haftalar (null = dolgu)
  - `gunAnahtariOlustur(a: TakvimAyi, gun: number): string` — "YYYY-MM-DD"
  - `HAFTA_GUNLERI: readonly string[]` — ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"]

- [ ] **Step 1: Başarısız testleri yaz (`src/lib/takvim.test.ts`)**

```ts
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
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test src/lib/takvim.test.ts`
Expected: FAIL ("Cannot find module './takvim'").

- [ ] **Step 3: `src/lib/takvim.ts` yaz**

```ts
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
```

- [ ] **Step 4: Testin geçtiğini gör**

Run: `npm test src/lib/takvim.test.ts`
Expected: PASS (6 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/takvim.ts src/lib/takvim.test.ts
git commit -m "feat(panel): takvim saf yardımcıları (ay ızgarası, İstanbul ay sınırları)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: DB katmanı — `listPlanliTakvim` + listeye `preferredNote`

**Files:**
- Modify: `src/lib/talepler-db.ts`
- Modify: `src/lib/talepler-db.test.ts` (yeni test + mevcutlara dokunma)

**Interfaces:**
- Consumes: `kapsamKosulu` (dosya içi), `appointmentRequests` şeması.
- Produces (`@/lib/talepler-db`):
  - `listTalepler` seçimine `preferredNote: appointmentRequests.preferredNote` eklenir (imza değişmez).
  - `listPlanliTakvim(expertSlug: string | null, isAdmin: boolean, baslangic: Date, bitis: Date): Promise<{ id: string; patientName: string; scheduledAt: Date; expertSlug: string | null }[]>` — yalnız `status="scheduled"`, `scheduledAt ∈ [baslangic, bitis)`, kapsam-korumalı, `scheduledAt` artan.

- [ ] **Step 1: Başarısız testi yaz (`talepler-db.test.ts`'e ekle, mevcut `ekleTalep` yardımcısının yanına)**

Önce `ekleTalep` yardımcısını `scheduledAt` alabilecek şekilde genişlet (geriye uyumlu):

```ts
async function ekleTalep(v: {
  slug: string | null;
  durum?: RandevuDurum;
  scheduledAt?: Date;
}): Promise<string> {
  const [row] = await db
    .insert(appointmentRequests)
    .values({
      patientName: "Sentetik Hasta",
      patientPhone: "0555 000 00 00",
      patientEmail: "sentetik@example.com",
      expertSlug: v.slug,
      preferredNote: "test",
      status: v.durum ?? "new",
      scheduledAt: v.scheduledAt ?? null,
    })
    .returning({ id: appointmentRequests.id });
  return row.id;
}
```

Sonra dosyaya yeni test ekle (import'a `listPlanliTakvim` eklenerek):

```ts
test("listPlanliTakvim: yalnız scheduled + aralık içi + kapsam", async () => {
  const ts = Date.now();
  const slugA = `tak-a-${ts}`;
  const slugB = `tak-b-${ts}`;
  const icinde = new Date("2026-07-15T11:00:00Z"); // 15 Tem İstanbul
  const disinda = new Date("2026-08-02T11:00:00Z");
  const idPlanli = await ekleTalep({ slug: slugA, durum: "scheduled", scheduledAt: icinde });
  const idFarkPlanli = await ekleTalep({ slug: null, durum: "scheduled", scheduledAt: icinde });
  const idBaskaUzman = await ekleTalep({ slug: slugB, durum: "scheduled", scheduledAt: icinde });
  const idAralikDisi = await ekleTalep({ slug: slugA, durum: "scheduled", scheduledAt: disinda });
  const idPlansiz = await ekleTalep({ slug: slugA, durum: "new" }); // scheduledAt null
  try {
    const bas = new Date("2026-06-30T21:00:00Z"); // 1 Tem 00:00 İstanbul
    const bit = new Date("2026-07-31T21:00:00Z");
    const idler = (await listPlanliTakvim(slugA, false, bas, bit)).map((r) => r.id);
    expect(idler).toContain(idPlanli);
    expect(idler).toContain(idFarkPlanli); // farketmez havuzu kapsamda
    expect(idler).not.toContain(idBaskaUzman); // IDOR
    expect(idler).not.toContain(idAralikDisi);
    expect(idler).not.toContain(idPlansiz);
    // Admin: başka uzmanınki de görünür
    const adminIdler = (await listPlanliTakvim(null, true, bas, bit)).map((r) => r.id);
    expect(adminIdler).toContain(idBaskaUzman);
  } finally {
    for (const id of [idPlanli, idFarkPlanli, idBaskaUzman, idAralikDisi, idPlansiz]) {
      await db.delete(appointmentRequests).where(eq(appointmentRequests.id, id));
    }
  }
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test src/lib/talepler-db.test.ts`
Expected: FAIL (`listPlanliTakvim` export yok).

- [ ] **Step 3: `talepler-db.ts`'i güncelle**

İmport satırına `asc, gte, lt` ekle:

```ts
import { and, asc, count, desc, eq, gte, isNull, lt, or, type SQL } from "drizzle-orm";
```

`listTalepler`'in `.select({...})` bloğuna (`status` satırından önce) ekle:

```ts
      preferredNote: appointmentRequests.preferredNote,
```

Dosya sonuna (talepSayilari'dan sonra) ekle:

```ts
/**
 * Ajanda takvimi: verilen [baslangic, bitis) aralığındaki PLANLANMIŞ
 * randevular, kapsam-korumalı (IDOR: kapsamKosulu aynen), tarih artan.
 * Hafif kolon seti — takvim hücresi yalnız ad + saat + link ister.
 */
export async function listPlanliTakvim(
  expertSlug: string | null,
  isAdmin: boolean,
  baslangic: Date,
  bitis: Date,
) {
  return db
    .select({
      id: appointmentRequests.id,
      patientName: appointmentRequests.patientName,
      scheduledAt: appointmentRequests.scheduledAt,
      expertSlug: appointmentRequests.expertSlug,
    })
    .from(appointmentRequests)
    .where(
      and(
        kapsamKosulu(expertSlug, isAdmin),
        eq(appointmentRequests.status, "scheduled"),
        gte(appointmentRequests.scheduledAt, baslangic),
        lt(appointmentRequests.scheduledAt, bitis),
      ),
    )
    .orderBy(asc(appointmentRequests.scheduledAt));
}
```

- [ ] **Step 4: Testin geçtiğini gör + tam süit**

Run: `npm test`
Expected: PASS (yeni test dahil, mevcutlar bozulmaz).

- [ ] **Step 5: Commit**

```bash
git add src/lib/talepler-db.ts src/lib/talepler-db.test.ts
git commit -m "feat(panel): kapsam-korumalı takvim sorgusu + liste seçiminde tercih notu" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: `talebiDurumIlerlet` Server Action (tek tık geçişler)

**Files:**
- Modify: `src/app/panel/(protected)/talepler/actions.ts`

**Interfaces:**
- Consumes: `izinliGecis` (Task 1), mevcut `getTalep`/`updateTalep`, mevcut `TalepFormState`.
- Produces: `talebiDurumIlerlet(_prev: TalepFormState, formData: FormData): Promise<TalepFormState>` — formData: `id` (uuid) + `hedef` (RandevuDurum). Task 6'nın `HizliAksiyonlar` bileşeni kullanır.

- [ ] **Step 1: `actions.ts`'e action'ı ekle**

İmport bloğunu güncelle (`izinliGecis` ekle):

```ts
import {
  DURUM_DEGERLERI,
  istanbulTarihSaat,
  izinliGecis,
  planlananaCevir,
  type RandevuDurum,
} from "@/lib/talepler";
```

Dosya sonuna ekle:

```ts
// Tek tık durum ilerletme (stepper hızlı aksiyonları). Yalnız-durum yazar:
// scheduledAt/internalNote'a DOKUNMAZ (updateTalep kısmi güncelleme sözleşmesi).
const ilerletSchema = z.object({
  id: z.uuid("Geçersiz talep kimliği."),
  hedef: z.enum(
    DURUM_DEGERLERI as [RandevuDurum, ...RandevuDurum[]],
    "Geçersiz durum değeri.",
  ),
});

export async function talebiDurumIlerlet(
  _prev: TalepFormState,
  formData: FormData,
): Promise<TalepFormState> {
  // 1) Kimlik doğrulama HER ZAMAN ilk sırada.
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  if (!staff) return { hata: "Personel kaydı bulunamadı." };

  // 2) Doğrulama.
  const parsed = ilerletSchema.safeParse({
    id: formData.get("id"),
    hedef: formData.get("hedef"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { hata: first?.message ?? "İstek geçersiz." };
  }
  const { id, hedef } = parsed.data;

  // 3) Mevcut durum (kapsam-korumalı) + beyaz-liste kontrolü. "Planlandı"
  //    burada YOK (tarih ister); done/cancelled'dan çıkış formun select'inde.
  const isAdmin = staff.role === "admin";
  const onceki = await getTalep(id, staff.expertSlug, isAdmin);
  if (!onceki) {
    return { hata: "Bu talep bulunamadı veya erişim yetkiniz yok." };
  }
  if (!izinliGecis(onceki.status, hedef)) {
    return {
      hata: "Bu durum geçişine buradan izin verilmiyor — aşağıdaki formu kullanın.",
    };
  }

  // 4) KAPSAM-korumalı yalnız-durum güncellemesi.
  const guncel = await updateTalep(id, staff.expertSlug, isAdmin, {
    status: hedef,
  });
  if (!guncel) {
    return { hata: "Bu talep bulunamadı veya erişim yetkiniz yok." };
  }

  // 5) Panel yüzeylerini tazele.
  revalidatePath("/panel/talepler");
  revalidatePath(`/panel/talepler/${id}`);
  revalidatePath("/panel");
  return { ok: true };
}
```

> **Not:** İzinli geçişlerin hiçbiri `scheduled`'A GEÇİŞ olmadığından hastaya
> "planlandı" e-postası bu action'da hiçbir zaman gerekmez — o mantık yalnız
> `talebiGuncelle`'de kalır.

- [ ] **Step 2: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test`
Expected: hepsi temiz (izinliGecis birim testleri geçiş kurallarını zaten kanıtlıyor; action'ın kimlik/kapsam iskeleti mevcut action ile birebir aynı desen).

- [ ] **Step 3: Commit**

```bash
git add "src/app/panel/(protected)/talepler/actions.ts"
git commit -m "feat(panel): tek tık durum ilerletme action'ı (beyaz-listeli geçişler)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Ajanda takvimi UI (`TakvimGorunumu` + sayfa entegrasyonu)

**Files:**
- Modify: `src/components/ServiceIcon.tsx` (`calendar` anahtarı)
- Create: `src/app/panel/(protected)/talepler/TakvimGorunumu.tsx`
- Modify: `src/app/panel/(protected)/talepler/page.tsx`

**Interfaces:**
- Consumes: Task 2'nin tüm `@/lib/takvim` exportları; `listPlanliTakvim` (Task 3); `istanbulGunAnahtari` (Task 1); `ServiceIcon`.
- Produces: `TakvimGorunumu({ ay, acik, aktifDurum, randevular })` sunucu bileşeni — `randevular`: `listPlanliTakvim` dönüş tipi.

- [ ] **Step 1: `ServiceIcon.tsx`'e `calendar` ikonu ekle** (`document`'ten sonra)

```tsx
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
```

- [ ] **Step 2: `TakvimGorunumu.tsx` yaz**

```tsx
import Link from "next/link";
import { istanbulGunAnahtari, type RandevuDurum } from "@/lib/talepler";
import {
  HAFTA_GUNLERI,
  ayDegeri,
  ayEtiketi,
  ayIzgarasi,
  gunAnahtariOlustur,
  oncekiAy,
  sonrakiAy,
  type TakvimAyi,
} from "@/lib/takvim";
import { ServiceIcon } from "@/components/ServiceIcon";

type Randevu = {
  id: string;
  patientName: string;
  scheduledAt: Date | null;
  expertSlug: string | null;
};

/** "Ayşe Kaya" → "Ayşe K." — hücre taşmasın. */
function adKisalt(ad: string): string {
  const parcalar = ad.trim().split(/\s+/);
  if (parcalar.length < 2) return ad;
  const son = parcalar[parcalar.length - 1];
  return `${parcalar.slice(0, -1).join(" ")} ${son.charAt(0)}.`;
}

function istanbulSaat(d: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
}

/**
 * Açılır-kapanır ajanda: native <details> (JS'siz, erişilebilir). Ay gezintisi
 * ?ay= linkiyle (sunucu bileşeni); ay parametresi varken açık kalır. Günde
 * en fazla 3 randevu adı, fazlası "+N".
 */
export default function TakvimGorunumu({
  ay,
  acik,
  aktifDurum,
  randevular,
}: {
  ay: TakvimAyi;
  acik: boolean;
  aktifDurum?: RandevuDurum;
  randevular: Randevu[];
}) {
  // Randevuları İstanbul gününe bazla.
  const gunlere = new Map<string, Randevu[]>();
  for (const r of randevular) {
    if (!r.scheduledAt) continue;
    const anahtar = istanbulGunAnahtari(r.scheduledAt);
    const liste = gunlere.get(anahtar) ?? [];
    liste.push(r);
    gunlere.set(anahtar, liste);
  }

  const bugunAnahtari = istanbulGunAnahtari(new Date());
  const durumEki = aktifDurum ? `&durum=${aktifDurum}` : "";
  const ayLinki = (a: TakvimAyi) =>
    `/panel/talepler?ay=${ayDegeri(a)}${durumEki}`;

  return (
    <details
      open={acik}
      className="mb-8 rounded-lg border border-stone bg-warm-white"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-4 text-forest [&::-webkit-details-marker]:hidden">
        <ServiceIcon name="calendar" className="h-5 w-5 shrink-0 text-sage" />
        <span className="font-medium">Takvim görünümü</span>
        <span className="ml-auto text-forest-muted text-sm">aç / kapat</span>
      </summary>

      <div className="border-t border-stone px-5 py-4">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={ayLinki(oncekiAy(ay))}
            className="rounded-md border border-stone px-3 py-1.5 text-sm text-forest-muted"
            aria-label="Önceki ay"
          >
            ←
          </Link>
          <h2 className="font-display text-lg text-forest">{ayEtiketi(ay)}</h2>
          <Link
            href={ayLinki(sonrakiAy(ay))}
            className="rounded-md border border-stone px-3 py-1.5 text-sm text-forest-muted"
            aria-label="Sonraki ay"
          >
            →
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-stone bg-stone">
          {HAFTA_GUNLERI.map((g) => (
            <div
              key={g}
              className="bg-cream px-1 py-1.5 text-center text-xs font-semibold text-forest-muted"
            >
              {g}
            </div>
          ))}
          {ayIzgarasi(ay).flat().map((gun, i) => {
            if (gun === null) {
              return <div key={`bos-${i}`} className="min-h-20 bg-cream" />;
            }
            const anahtar = gunAnahtariOlustur(ay, gun);
            const gununRandevulari = gunlere.get(anahtar) ?? [];
            const bugun = anahtar === bugunAnahtari;
            return (
              <div key={anahtar} className="min-h-20 bg-warm-white p-1">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    bugun
                      ? "bg-forest font-semibold text-warm-white"
                      : "text-forest-muted"
                  }`}
                >
                  {gun}
                </span>
                <ul className="mt-0.5 space-y-0.5">
                  {gununRandevulari.slice(0, 3).map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/panel/talepler/${r.id}`}
                        className="block truncate rounded bg-cream px-1 py-0.5 text-xs text-forest"
                        title={r.patientName}
                      >
                        {r.scheduledAt ? `${istanbulSaat(r.scheduledAt)} ` : ""}
                        {adKisalt(r.patientName)}
                      </Link>
                    </li>
                  ))}
                  {gununRandevulari.length > 3 && (
                    <li className="px-1 text-xs text-forest-muted">
                      +{gununRandevulari.length - 3}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
```

- [ ] **Step 3: `talepler/page.tsx`'e entegre et**

İmport bloğuna ekle:

```tsx
import { listPlanliTakvim, listTalepler } from "@/lib/talepler-db";
import { ayAraligi, ayParametresi } from "@/lib/takvim";
import TakvimGorunumu from "./TakvimGorunumu";
```

(`listTalepler` import'u mevcut satırla birleştirilir.) `searchParams` tipini ve veri çekimini güncelle:

```tsx
export default async function TaleplerListe({
  searchParams,
}: {
  searchParams: Promise<{ durum?: string; ay?: string }>;
}) {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  const slug = staff?.expertSlug ?? null;
  const isAdmin = staff?.role === "admin";

  // ?durum= filtresi — yalnız geçerli enum değeri kabul edilir, aksi halde tümü.
  const { durum, ay: ayHam } = await searchParams;
  const aktifDurum = DURUM_DEGERLERI.find((d) => d === durum);

  // Takvim: ?ay= varsa açık; geçersiz değer içinde bulunulan aya düşer.
  const ay = ayParametresi(ayHam);
  const { baslangic, bitis } = ayAraligi(ay);
  const [talepler, planliRandevular] = await Promise.all([
    listTalepler(slug, isAdmin, aktifDurum),
    listPlanliTakvim(slug, isAdmin, baslangic, bitis),
  ]);
```

Başlığın (`<div className="mb-6 ...">`) hemen ALTINA, filtre çiplerinden önce:

```tsx
      <TakvimGorunumu
        ay={ay}
        acik={ayHam !== undefined}
        aktifDurum={aktifDurum}
        randevular={planliRandevular}
      />
```

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: hepsi temiz. Dev'de (`npm run dev`, Docker + seed'li giriş) `/panel/talepler`: takvim kapalı kart görünür; açınca ay ızgarası; "Planlandı" durumlu demo talep doğru günde link olarak görünür; ay okları gezinir ve takvim açık kalır; `?ay=bozuk` bugünkü aya düşer.

- [ ] **Step 5: Commit**

```bash
git add src/components/ServiceIcon.tsx "src/app/panel/(protected)/talepler/TakvimGorunumu.tsx" "src/app/panel/(protected)/talepler/page.tsx"
git commit -m "feat(panel): açılır-kapanır ajanda takvimi (kapsam-korumalı, kütüphanesiz)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Detay — durum stepper'ı + tek tık aksiyonlar + iki sütun düzen

**Files:**
- Create: `src/app/panel/(protected)/talepler/[id]/DurumAdimlari.tsx`
- Create: `src/app/panel/(protected)/talepler/[id]/HizliAksiyonlar.tsx`
- Modify: `src/app/panel/(protected)/talepler/[id]/page.tsx`

**Interfaces:**
- Consumes: `DURUM_ETIKETLERI`, `izinliGecis`, `type RandevuDurum` (Task 1); `talebiDurumIlerlet`, `type TalepFormState` (Task 4); mevcut `DurumRozeti`.
- Produces: `DurumAdimlari({ durum })` (server, saf sunum) ve `HizliAksiyonlar({ id, durum })` (client).

- [ ] **Step 1: `DurumAdimlari.tsx` yaz (saf sunum — stepper)**

```tsx
import { DURUM_ETIKETLERI, type RandevuDurum } from "@/lib/talepler";

// İş akışı hattı — İptal hat DIŞI (ayrı rozet/aksiyonla gösterilir).
const AKIS = ["new", "contacted", "scheduled", "done"] as const;

/**
 * Yatay durum adım göstergesi. Renkler DurumRozeti'nin forest/stone
 * ailesinden: geçilen/mevcut adım forest dolu, gelecekler stone çizgili.
 * cancelled: hat soluklaşır, yanında "İptal edildi" rozeti görünür.
 */
export default function DurumAdimlari({ durum }: { durum: RandevuDurum }) {
  const iptal = durum === "cancelled";
  const aktifIdx = iptal ? -1 : AKIS.indexOf(durum as (typeof AKIS)[number]);

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Durum akışı">
      <ol className={`flex items-center ${iptal ? "opacity-50" : ""}`}>
        {AKIS.map((adim, i) => {
          const gecildi = aktifIdx >= 0 && i <= aktifIdx;
          return (
            <li key={adim} className="flex items-center">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`mx-1 h-px w-5 sm:w-8 ${
                    gecildi ? "bg-forest" : "bg-stone"
                  }`}
                />
              )}
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                  gecildi
                    ? "bg-forest text-warm-white"
                    : "border border-stone text-forest-muted"
                }`}
                aria-current={i === aktifIdx ? "step" : undefined}
              >
                {DURUM_ETIKETLERI[adim]}
              </span>
            </li>
          );
        })}
      </ol>
      {iptal && (
        <span className="rounded-full border border-stone bg-cream px-2.5 py-1 text-xs text-forest-muted">
          İptal edildi
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `HizliAksiyonlar.tsx` yaz (client — tek tık)**

```tsx
"use client";

import { useActionState } from "react";
import { izinliGecis, type RandevuDurum } from "@/lib/talepler";
import { talebiDurumIlerlet, type TalepFormState } from "../actions";

const bos: TalepFormState = {};

// Duruma göre birincil tek tık aksiyon (izinliGecis beyaz listesiyle uyumlu;
// sunucu yine de doğrular). "Planlandı" tarih istediği için burada yok.
const BIRINCIL: Partial<Record<RandevuDurum, { hedef: RandevuDurum; etiket: string }>> = {
  new: { hedef: "contacted", etiket: "Arandı olarak işaretle" },
  scheduled: { hedef: "done", etiket: "Tamamlandı olarak işaretle" },
};

export default function HizliAksiyonlar({
  id,
  durum,
}: {
  id: string;
  durum: RandevuDurum;
}) {
  const [state, formAction, pending] = useActionState(talebiDurumIlerlet, bos);

  const birincil = BIRINCIL[durum];
  const iptalEdilebilir = izinliGecis(durum, "cancelled");
  if (!birincil && !iptalEdilebilir && durum !== "contacted") return null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {birincil && (
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="hedef" value={birincil.hedef} />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-forest px-4 py-2 text-sm text-warm-white disabled:opacity-60"
            >
              {pending ? "Kaydediliyor…" : birincil.etiket}
            </button>
          </form>
        )}
        {durum === "contacted" && (
          <p className="text-forest-muted text-sm">
            Planlamak için aşağıdaki formdan tarih seçin.
          </p>
        )}
        {iptalEdilebilir && (
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="hedef" value="cancelled" />
            <button
              type="submit"
              disabled={pending}
              className="rounded-md border border-stone px-4 py-2 text-sm text-forest-muted disabled:opacity-60"
            >
              İptal et
            </button>
          </form>
        )}
      </div>
      {state.hata && (
        <p role="alert" className="text-sm font-semibold text-forest">
          {state.hata}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Detay sayfasını yeniden düzenle (`[id]/page.tsx`)**

İmport bloğuna ekle:

```tsx
import DurumAdimlari from "./DurumAdimlari";
import HizliAksiyonlar from "./HizliAksiyonlar";
```

Gövdedeki `<section className="space-y-8">` içeriğini şu yapıya çevir (başlık bloğu ve mevcut kartların İÇERİKLERİ aynen korunur — yalnız yerleşim değişir):

```tsx
    <section className="space-y-8">
      {/* Başlık bloğu — MEVCUT içerik aynen (Taleplere dön + ad + rozet + künye) */}
      <div>
        {/* ... mevcut başlık içeriği değişmeden ... */}
      </div>

      {/* Durum akışı + tek tık aksiyonlar */}
      <div className="space-y-4 rounded-lg border border-stone bg-warm-white p-5">
        <DurumAdimlari durum={talep.status} />
        <HizliAksiyonlar id={talep.id} durum={talep.status} />
      </div>

      {/* Masaüstünde iki sütun: solda iletişim+not, sağda yönetim */}
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {/* İletişim kartı — MEVCUT içerik aynen */}
          {/* Talep notu kartı — MEVCUT içerik aynen */}
        </div>
        <div>
          {/* Yönet kartı — MEVCUT içerik aynen (TalepDuzenleForm dahil) */}
        </div>
      </div>

      {/* KVKK kaydı — MEVCUT içerik aynen, tam genişlik */}
    </section>
```

(Uygulayıcı: mevcut dosyadaki kart JSX'lerini olduğu gibi taşı — İletişim/Talep notu/Yönet/KVKK bloklarının iç içerikleri, sınıfları, aksiyonları değişmez. Yalnız üstteki iki yeni bileşen + grid sarmalayıcı eklenir.)

- [ ] **Step 4: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: temiz. Dev'de: "Yeni" talepte stepper ilk adımda + "Arandı olarak işaretle" ve "İptal et" görünür; tıklanınca durum değişir, sayfa tazelenir, iç not/tarih silinmemiştir; "Arandı" talepte yönlendirme metni; masaüstünde iki sütun; İptal edilen talepte stepper soluk + rozet; Yönet formu her durumda tam çalışır.

- [ ] **Step 5: Commit**

```bash
git add "src/app/panel/(protected)/talepler/[id]/DurumAdimlari.tsx" "src/app/panel/(protected)/talepler/[id]/HizliAksiyonlar.tsx" "src/app/panel/(protected)/talepler/[id]/page.tsx"
git commit -m "feat(panel): talep detayında durum stepper'ı + tek tık ilerletme + iki sütun düzen" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Liste satırları (göreli zaman + tercih çipi) + sayılı çipler + nav rozeti

**Files:**
- Modify: `src/app/panel/(protected)/talepler/page.tsx`
- Modify: `src/app/panel/(protected)/layout.tsx`

**Interfaces:**
- Consumes: `goreliZaman`, `tercihEdilenTarih` (Task 1); `talepSayilari` (mevcut); `listTalepler`'in `preferredNote`'lu dönüşü (Task 3).
- Produces: yok (yaprak UI).

- [ ] **Step 1: `talepler/page.tsx` — sayılar + satır içeriği**

İmport güncellemeleri: `@/lib/talepler`'den `goreliZaman, tercihEdilenTarih` ekle; `formatDateTR` import'unu ve `@/lib/blog` satırını KALDIR (artık kullanılmıyor); `@/lib/talepler-db`'den `talepSayilari` ekle.

Veri çekimini üçlüye çıkar:

```tsx
  const [talepler, planliRandevular, sayilar] = await Promise.all([
    listTalepler(slug, isAdmin, aktifDurum),
    listPlanliTakvim(slug, isAdmin, baslangic, bitis),
    talepSayilari(slug, isAdmin),
  ]);
  const toplam = DURUM_DEGERLERI.reduce((t, d) => t + sayilar[d], 0);
```

Çip fonksiyonunu sayı gösterecek şekilde güncelle (yalnız etiket metni değişir):

```tsx
  const cip = (etiket: string, sayi: number, hedefDurum?: RandevuDurum) => {
    const aktif = aktifDurum === hedefDurum;
    const href = hedefDurum
      ? `/panel/talepler?durum=${hedefDurum}`
      : "/panel/talepler";
    return (
      <Link
        key={etiket}
        href={href}
        className={`rounded-full px-3 py-1 text-xs ${
          aktif
            ? "bg-forest text-warm-white"
            : "border border-stone text-forest-muted"
        }`}
      >
        {etiket} ({sayi})
      </Link>
    );
  };
```

Çağrı yerleri:

```tsx
        {cip("Tümü", toplam, undefined)}
        {DURUM_DEGERLERI.map((d) => cip(DURUM_ETIKETLERI[d], sayilar[d], d))}
```

Satırda tarih ve çip (sağ blok): `formatDateTR(...)` satırını şu blokla değiştir:

```tsx
                <div className="flex shrink-0 items-center gap-4">
                  {tercihEdilenTarih(t.preferredNote) && (
                    <span className="rounded-full border border-stone px-2.5 py-0.5 text-xs text-forest-muted">
                      Tercih: {tercihEdilenTarih(t.preferredNote)}
                    </span>
                  )}
                  <span className="text-forest-muted text-sm">
                    {goreliZaman(t.createdAt)}
                  </span>
                  <DurumRozeti durum={t.status} />
                </div>
```

- [ ] **Step 2: `layout.tsx` — nav rozeti**

İmport ekle:

```tsx
import { getStaffByEmail } from "@/lib/auth/staff";
import { talepSayilari } from "@/lib/talepler-db";
```

Gövde başını güncelle:

```tsx
  const session = await verifySession(); // oturumsuzsa /panel/giris'e redirect
  const staff = await getStaffByEmail(session.email);
  const sayilar = await talepSayilari(
    staff?.expertSlug ?? null,
    staff?.role === "admin",
  );
  const yeniSayisi = sayilar.new;
```

"Talepler" linkinin içine (metinden sonra) rozet ekle:

```tsx
          <Link
            href="/panel/talepler"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="user" className="h-4 w-4 text-sage" />
            Talepler
            {yeniSayisi > 0 && (
              <span
                aria-label={`${yeniSayisi} yeni talep`}
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-forest px-1.5 text-xs text-warm-white"
              >
                {yeniSayisi}
              </span>
            )}
          </Link>
```

- [ ] **Step 3: Doğrula**

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: temiz. Dev'de: çipler "Tümü (4) · Yeni (1)…" biçiminde; satırlarda "2 saat önce"/"dün" + (tercih tarihi olan demo talepte) "Tercih: 20 Tem" çipi; nav'da "Talepler" yanında yeni sayısı rozeti (yeni talep 0 iken rozet YOK — bir talebi Arandı yapıp doğrula).

- [ ] **Step 4: Commit**

```bash
git add "src/app/panel/(protected)/talepler/page.tsx" "src/app/panel/(protected)/layout.tsx"
git commit -m "feat(panel): listede göreli zaman + tercih çipi, sayılı filtreler, nav yeni-talep rozeti" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Dil düzeltmesi — "Fark etmez" (görünen etiketler; slug/DB değişmez)

**Files:**
- Modify: `src/lib/randevu.ts` (UZMAN_SECENEKLERI görünen değeri)
- Modify: `src/lib/talepler.ts` (uzmanEtiketi null dalı + docstring)
- Modify: `src/components/AppointmentForm.tsx` (option etiketi)
- Modify: `src/app/panel/(protected)/talepler/page.tsx` (bilgi metni)
- Modify: `src/lib/talepler-db.test.ts` (mevcut assert güncellenir)

**Interfaces:**
- Consumes/Produces: yok — yalnız görünen string'ler. **`farketmez` slug/value/DB değeri HİÇBİR YERDE değişmez** (form `<option value="farketmez">`, `girdi.uzman === "farketmez"` karşılaştırmaları, zod enum'u aynen kalır).

- [ ] **Step 1: Görünen etiketleri güncelle**

1. `src/lib/randevu.ts`: `farketmez: "Farketmez",` → `farketmez: "Fark etmez",`
2. `src/lib/talepler.ts`: `if (!slug) return "Farketmez";` → `if (!slug) return "Fark etmez";` ve üstündeki docstring'de `→ "Farketmez"` → `→ "Fark etmez"`.
3. `src/components/AppointmentForm.tsx`: `<option value="farketmez">Farketmez</option>` → `<option value="farketmez">Fark etmez</option>` (value DEĞİŞMEZ).
4. `src/app/panel/(protected)/talepler/page.tsx`: bilgi metnindeki `&ldquo;Farketmez&rdquo;` → `&ldquo;Fark etmez&rdquo;`.

- [ ] **Step 2: Mevcut test assert'ini güncelle**

`src/lib/talepler-db.test.ts` içindeki:

```ts
  expect(uzmanEtiketi(null)).toBe("Farketmez");
```

→

```ts
  expect(uzmanEtiketi(null)).toBe("Fark etmez");
```

(Test adındaki "Farketmez" ifadesi de "Fark etmez" olarak güncellenir.)

- [ ] **Step 3: Kalıntı taraması + doğrulama**

Run: `grep -rn '"Farketmez"\|>Farketmez<\|Farketmez&' src/ --include="*.ts" --include="*.tsx" | grep -v farketmez:` 
Expected: eşleşme YOK (yalnız slug `farketmez` kalır — o kasıtlı).

Run: `npx tsc --noEmit && npm run lint && npm test && npm run build`
Expected: hepsi temiz.

- [ ] **Step 4: Commit**

```bash
git add src/lib/randevu.ts src/lib/talepler.ts src/components/AppointmentForm.tsx "src/app/panel/(protected)/talepler/page.tsx" src/lib/talepler-db.test.ts
git commit -m "dil: görünen 'Farketmez' etiketleri TDK'ya uygun 'Fark etmez' yapıldı" -m "Slug/DB değeri (farketmez) ve tüm karşılaştırmalar değişmedi — yalnız kullanıcıya görünen metinler." -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Faz Tamamlanma Kriterleri (kabul — spec'tekiyle aynı)
- [ ] `npx tsc --noEmit && npm run lint && npm test && npm run build` temiz.
- [ ] Takvim: aç/kapa + ay gezintisi (+durum filtresi korunur) + kapsam-doğru randevular + geçersiz `?ay=` düşüşü.
- [ ] Stepper + tek tık geçişler (not/tarih korunur; izinsiz geçiş reddi); Yönet formu tam işlevli.
- [ ] Liste: göreli zaman + tercih çipi; sayılı çipler; nav rozeti yalnız yeni>0.
- [ ] "Fark etmez" tüm görünen yerlerde; slug/DB aynen.
- [ ] Canlı tarayıcı doğrulaması + ekran görüntüleri (kontrolör, final review öncesi).

## Self-Review notu
Spec §1→Task 2+3+5, §2→Task 1(izinliGecis)+4+6, §3→Task 1+3+7, §4→Task 7, §5→Task 8. Tip tutarlılığı: `TakvimAyi`/`listPlanliTakvim` dönüşü/`TalepFormState` imzaları görevler arasında birebir. `formatDateTR` kaldırımı Task 7'de açık. `talebiGuncelle`'nin planlandı-e-postası mantığına dokunulmuyor; `talebiDurumIlerlet` scheduled'a geçemediği için e-posta gerektirmez (Task 4 notu).
