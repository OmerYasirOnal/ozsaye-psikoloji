import { neon } from "@neondatabase/serverless";

/**
 * KVKK açık rıza + randevu başvuru kaydı için kalıcı saklama (Postgres / Neon).
 *
 * KVKK m.6 uyarınca açık rızanın ISPATI veri sorumlusuna aittir; bu yüzden rıza
 * (zaman damgası + IP ile) ve başvuru, kalıcı bir kayıt deposunda tutulmalıdır.
 *
 * Yapılandırma: Vercel Marketplace üzerinden bir Postgres (Neon) entegrasyonu
 * eklenince `DATABASE_URL` ortam değişkeni otomatik gelir. Değişken yoksa
 * `saveConsentRecord` sessizce `false` döner; çağıran taraf e-posta/log
 * fallback'ine düşer (build/dev DB olmadan da çalışır). Değişken eklenince
 * kayıt otomatik olarak veritabanına yazılmaya başlar.
 *
 * Tablo şeması ilk yazımda `CREATE TABLE IF NOT EXISTS` ile (idempotent) garanti
 * edilir; manuel/açık kurulum için bkz. db/migrations/0001_appointment_submissions.sql.
 */

const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// neon() yalnızca sorgu fonksiyonunu kurar (HTTP, ağ bağlantısı açmaz); bağlantı
// dizesi yoksa null bırakılır. Build/dev DATABASE_URL olmadan sorunsuz çalışır.
const sql = connectionString ? neon(connectionString) : null;

/** Kalıcı saklama yapılandırılmış mı (DATABASE_URL var mı)? */
export function isDbConfigured(): boolean {
  return sql !== null;
}

// Şema, instance başına yalnızca bir kez garanti edilir (promise önbelleği).
let schemaReady: Promise<void> | null = null;

function ensureSchema(): Promise<void> {
  if (!sql) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS appointment_submissions (
        id BIGSERIAL PRIMARY KEY,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ad TEXT NOT NULL,
        telefon TEXT NOT NULL,
        email TEXT NOT NULL,
        uzman TEXT NOT NULL,
        tarih TEXT,
        mesaj TEXT,
        kvkk_consent BOOLEAN NOT NULL,
        consent_at TIMESTAMPTZ NOT NULL,
        ip TEXT,
        user_agent TEXT
      )
    `.then(() => undefined);
  }
  return schemaReady;
}

/** Saklanan rıza + başvuru kaydı. */
export interface ConsentRecord {
  ad: string;
  telefon: string;
  email: string;
  uzman: string;
  tarih?: string;
  mesaj?: string;
  kvkkConsent: boolean;
  /** ISO 8601 rıza zaman damgası. */
  consentAt: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Rıza + başvuru kaydını kalıcı saklar.
 * - DB yapılandırılmamışsa (DATABASE_URL yok) `false` döner.
 * - Yazım hatasında da `false` döner ve hata loglanır (kullanıcı akışını
 *   ASLA bloklamaz; e-posta bildirimi ikincil kayıt olarak devrede kalır).
 * - Başarıyla yazıldıysa `true` döner.
 */
export async function saveConsentRecord(record: ConsentRecord): Promise<boolean> {
  if (!sql) return false;
  try {
    await ensureSchema();
    await sql`
      INSERT INTO appointment_submissions
        (ad, telefon, email, uzman, tarih, mesaj, kvkk_consent, consent_at, ip, user_agent)
      VALUES
        (${record.ad}, ${record.telefon}, ${record.email}, ${record.uzman},
         ${record.tarih ?? null}, ${record.mesaj ?? null}, ${record.kvkkConsent},
         ${record.consentAt}, ${record.ip ?? null}, ${record.userAgent ?? null})
    `;
    return true;
  } catch (error) {
    // Şema önbelleğini sıfırla ki sonraki istek yeniden denesin.
    schemaReady = null;
    console.error("KVKK rıza kaydı veritabanına yazılamadı:", error);
    return false;
  }
}
