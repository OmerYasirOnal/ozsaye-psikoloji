-- Randevu başvuruları + KVKK açık rıza kaydı.
-- Uygulama (src/lib/db.ts) bu tabloyu ilk yazımda otomatik (CREATE TABLE IF NOT
-- EXISTS) oluşturur; bu dosya açık/manuel kurulum ve denetim (audit) içindir.
--
-- Kullanım (yapılandırma sonrası, opsiyonel):
--   psql "$DATABASE_URL" -f db/migrations/0001_appointment_submissions.sql

CREATE TABLE IF NOT EXISTS appointment_submissions (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  ad            TEXT        NOT NULL,
  telefon       TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  uzman         TEXT        NOT NULL,
  tarih         TEXT,
  mesaj         TEXT,
  kvkk_consent  BOOLEAN     NOT NULL,
  consent_at    TIMESTAMPTZ NOT NULL,
  ip            TEXT,
  user_agent    TEXT
);

-- Tarihe göre denetim sorgularını hızlandırmak için.
CREATE INDEX IF NOT EXISTS idx_appointment_submissions_created_at
  ON appointment_submissions (created_at DESC);
