import { and, asc, count, desc, eq, gte, isNull, lt, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointmentRequests, requestStatus } from "@/lib/db/schema";
import { DURUM_DEGERLERI, type RandevuDurum } from "@/lib/talepler";

/**
 * Randevu talep yönetiminin (panel `/talepler`) DB katmanı.
 *
 * `talepler.ts` (saf etiket/biçim) ile `db` (drizzle) arasındaki köprü.
 * `randevu-db.ts` gibi bilinçli olarak `server-only` İÇERMEZ: düz Vitest birim
 * testleri bu dosyayı doğrudan import edip gerçek DB'ye vurur (Faz 0 kuralı:
 * `server-only` düz Vitest'te fırlatır). Yetki/IDOR koruması UI'da değil, her
 * sorgunun WHERE yükleminde uygulanır (kapsamKosulu).
 */

// Derleme-zamanı güvencesi: `talepler.ts` etiket anahtarları ile DB enum'ı
// birbirinden kaymasın. Enum yeni değer alırsa (eksik anahtar) veya etiket
// değeri enum dışına çıkarsa bu atama tsc'de hata verir.
const _durumUyum: Record<
  (typeof requestStatus.enumValues)[number],
  RandevuDurum
> = {
  new: "new",
  contacted: "contacted",
  scheduled: "scheduled",
  done: "done",
  cancelled: "cancelled",
};
void _durumUyum;

/**
 * KAPSAM (yetki/IDOR) yüklemi: bir uzman yalnız KENDİ atanmış taleplerini
 * (`expert_slug = expertSlug`) + "farketmez" havuzunu (`expert_slug IS NULL`)
 * görebilir/güncelleyebilir. expertSlug null ise (uzman-slug'ı olmayan staff)
 * yalnız farketmez havuzu. `isAdmin` true ise (ör. info@ genel kutusu) hiçbir
 * kısıtlama uygulanmaz — `undefined` döner; bu, aşağıdaki tüm çağıranlarda
 * zaten kullanılan "filtre yok" idiom'udur (`.where(undefined)` / `and(...,
 * undefined)` WHERE'i o yüklemsiz bırakır). Bu yüklem hem okuma hem yazma
 * sorgularında kullanılır — başka uzmanın talebini id tahmin ederek
 * görmek/değiştirmek engellenir.
 */
function kapsamKosulu(
  expertSlug: string | null,
  isAdmin: boolean,
): SQL | undefined {
  if (isAdmin) return undefined;
  return expertSlug
    ? or(
        eq(appointmentRequests.expertSlug, expertSlug),
        isNull(appointmentRequests.expertSlug),
      )
    : isNull(appointmentRequests.expertSlug);
}

/** Yürütücü (executor) tipleri — testlerin rollback transaction'ında koşması için. */
type UpdateExecutor = Pick<typeof db, "update">;

/** Liste için hafif kolon seti; kapsam + (ops.) durum filtresi, en yeni üstte. */
export async function listTalepler(
  expertSlug: string | null,
  isAdmin: boolean,
  durum?: RandevuDurum,
) {
  const kosullar = [kapsamKosulu(expertSlug, isAdmin)];
  if (durum) kosullar.push(eq(appointmentRequests.status, durum));

  return db
    .select({
      id: appointmentRequests.id,
      createdAt: appointmentRequests.createdAt,
      patientName: appointmentRequests.patientName,
      patientPhone: appointmentRequests.patientPhone,
      expertSlug: appointmentRequests.expertSlug,
      preferredNote: appointmentRequests.preferredNote,
      status: appointmentRequests.status,
      scheduledAt: appointmentRequests.scheduledAt,
    })
    .from(appointmentRequests)
    .where(and(...kosullar))
    .orderBy(desc(appointmentRequests.createdAt));
}

/**
 * Tek talebin tam satırı — YALNIZCA kapsam yükleminden geçerse (aksi halde
 * null). IDOR koruması: başka uzmana atanmış bir talep id'si tahmin edilse bile
 * bu sorgu onu döndürmez.
 */
export async function getTalep(
  id: string,
  expertSlug: string | null,
  isAdmin: boolean,
): Promise<typeof appointmentRequests.$inferSelect | null> {
  const rows = await db
    .select()
    .from(appointmentRequests)
    .where(
      and(eq(appointmentRequests.id, id), kapsamKosulu(expertSlug, isAdmin)),
    )
    .limit(1);
  return rows[0] ?? null;
}

/**
 * Talebi günceller — YALNIZCA aynı kapsam yükleminden geçen satırı (id + yetki
 * WHERE'de birlikte). Böylece bir uzman başka uzmanın talebini id tahmin ederek
 * değiştiremez. `updatedAt = now()` her güncellemede yazılır. Güncellenen satırı,
 * yetki yoksa (satır kapsam dışında) null döndürür.
 *
 * `database` parametresi (purgeOldRequests deseni) testlerin rollback
 * transaction'ı içinde koşabilmesi için opsiyoneldir.
 */
export async function updateTalep(
  id: string,
  expertSlug: string | null,
  isAdmin: boolean,
  degisiklik: {
    status?: RandevuDurum;
    scheduledAt?: Date | null;
    internalNote?: string | null;
  },
  database: UpdateExecutor = db,
): Promise<typeof appointmentRequests.$inferSelect | null> {
  const guncelleme: Partial<typeof appointmentRequests.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (degisiklik.status !== undefined) guncelleme.status = degisiklik.status;
  if (degisiklik.scheduledAt !== undefined)
    guncelleme.scheduledAt = degisiklik.scheduledAt;
  if (degisiklik.internalNote !== undefined)
    guncelleme.internalNote = degisiklik.internalNote;

  const rows = await database
    .update(appointmentRequests)
    .set(guncelleme)
    .where(
      and(eq(appointmentRequests.id, id), kapsamKosulu(expertSlug, isAdmin)),
    )
    .returning();
  return rows[0] ?? null;
}

/**
 * Gösterge için durum başına (kapsamlı) talep sayıları. Kapsam dışındaki
 * talepler sayıma girmez; eksik durumlar 0 döner.
 */
export async function talepSayilari(
  expertSlug: string | null,
  isAdmin: boolean,
): Promise<Record<RandevuDurum, number>> {
  const rows = await db
    .select({ status: appointmentRequests.status, n: count() })
    .from(appointmentRequests)
    .where(kapsamKosulu(expertSlug, isAdmin))
    .groupBy(appointmentRequests.status);

  const sayilar = Object.fromEntries(
    DURUM_DEGERLERI.map((d) => [d, 0]),
  ) as Record<RandevuDurum, number>;
  for (const r of rows) sayilar[r.status] = Number(r.n);
  return sayilar;
}

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
