import { and, count, eq, gt, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointmentRequests, staff } from "@/lib/db/schema";
import type { RandevuGirdisi } from "@/lib/randevu";

/**
 * Randevu taleplerinin DB katmanı.
 *
 * `randevu.ts` (saf doğrulama) ile `db` (drizzle) arasındaki köprü. Bilinçli
 * olarak `server-only` İÇERMEZ: düz Vitest birim testleri bu dosyayı doğrudan
 * import eder (Faz 0 kuralı: `server-only` düz Vitest'te fırlatır).
 */

// Aynı IP'den son 30 dk içinde bu kadar veya daha çok talep varsa hız-limitli.
// (magic-token limiter deseni: count() + gt(createdAt, ...).)
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000; // 30 dk
type DeleteExecutor = Pick<typeof db, "delete">;

/**
 * Doğrulanmış girdiyi `appointment_requests`'e yazar ve yeni satırın id'sini
 * döndürür. Alan eşlemesi + `preferredNote` kompozisyonu, statik-hosting
 * dönemindeki `public/randevu.php` e-posta gövdesinin aynasıdır.
 */
export async function createAppointmentRequest(
  girdi: RandevuGirdisi,
  ip: string,
): Promise<{ id: string }> {
  const preferredNote =
    `Tercih edilen tarih: ${girdi.tarih || "belirtilmedi"}\n\n` +
    `Mesaj:\n${girdi.mesaj || "(mesaj girilmedi)"}`;

  const rows = await db
    .insert(appointmentRequests)
    .values({
      patientName: girdi.ad,
      patientPhone: girdi.telefon,
      patientEmail: girdi.email,
      expertSlug: girdi.uzman === "farketmez" ? null : girdi.uzman,
      preferredNote,
      kvkkConsent: true,
      consentAt: new Date(),
      consentIp: ip,
      // status default'u ("new") şemadan gelir.
    })
    .returning({ id: appointmentRequests.id });

  return { id: rows[0].id };
}

/**
 * Aynı `consentIp` ile son RATE_LIMIT_WINDOW_MS içinde RATE_LIMIT_MAX veya daha
 * çok talep varsa true. Spam/kötüye kullanımı sınırlar.
 */
export async function isRandevuRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const rows = await db
    .select({ n: count() })
    .from(appointmentRequests)
    .where(
      and(
        eq(appointmentRequests.consentIp, ip),
        gt(appointmentRequests.createdAt, since),
      ),
    );
  return (rows[0]?.n ?? 0) >= RATE_LIMIT_MAX;
}

async function getTerapistEpostalari(): Promise<string[]> {
  const rows = await db
    .select({ email: staff.email })
    .from(staff)
    .where(eq(staff.role, "therapist"));
  return rows.map((r) => r.email);
}

/**
 * Bildirim e-postasının gönderileceği adresler. `expertSlug` doluysa önce o
 * uzman denenir; veri kayması nedeniyle eşleşme yoksa tüm terapistlere düşer.
 * null ("farketmez") ise doğrudan yalnız terapist rolündeki staff adresleri
 * (`role = 'therapist'`) döner. Klinisyen olmayan admin hesapları hasta verisi
 * içeren bu bildirimi ALMAZ.
 *
 * Not: `site.email` (info@ozsaye.com) şu an placeholder olduğundan alıcılara
 * bilinçli olarak EKLENMEZ; gerçek info@ adresi cutover'da (Faz 3) buraya
 * eklenebilir.
 */
export async function getBildirimAlicilari(
  expertSlug: string | null,
): Promise<string[]> {
  if (!expertSlug) return getTerapistEpostalari();

  const rows = await db
    .select({ email: staff.email })
    .from(staff)
    .where(and(eq(staff.expertSlug, expertSlug), eq(staff.role, "therapist")));

  if (rows.length > 0) return rows.map((r) => r.email);

  // Staff seed/prod verisi kayarsa hasta talebi sessizce bildirimsiz kalmasın.
  return getTerapistEpostalari();
}

/**
 * KVKK saklama-süresi varsayılanı (gün). Gerçek süre klinik/hukuk netleşince
 * `PURGE_OLD_REQUESTS_DAYS` env'i ile ayarlanır; cron route bunu taban alır.
 */
export const DEFAULT_PURGE_DAYS = 365;

export async function purgeOldRequests(
  gunSayisi: number,
  database: DeleteExecutor = db,
): Promise<number> {
  if (!Number.isInteger(gunSayisi) || gunSayisi <= 0) {
    throw new Error("gunSayisi pozitif bir tam sayı olmalı.");
  }

  const cutoff = new Date(Date.now() - gunSayisi * 24 * 60 * 60 * 1000);
  const deleted = await database
    .delete(appointmentRequests)
    .where(lt(appointmentRequests.createdAt, cutoff))
    .returning({ id: appointmentRequests.id });

  return deleted.length;
}
