import { createHash, randomBytes } from "node:crypto";
import { and, count, eq, gt, isNull, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { magicTokens } from "@/lib/db/schema";

const TTL_MS = 15 * 60 * 1000; // 15 dk
const RATE_LIMIT_MAX = 3; // pencere içinde e-posta başına izin verilen istek
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // hız-limiti penceresi (15 dk)
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // dolmuş token'ları 24 saat sonra sil

function hash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createMagicToken(email: string): Promise<string> {
  // Fırsatçı temizlik: 24 saatten uzun süredir dolmuş token'ları sil, böylece
  // tablo sonsuza dek büyümez (cron gerekmez). Yalnız >24s dolmuşları siler;
  // hız-limiti penceresi (15 dk) ile ÇAKIŞMAZ, sayımı etkilemez.
  await db
    .delete(magicTokens)
    .where(lt(magicTokens.expiresAt, new Date(Date.now() - CLEANUP_AGE_MS)));

  const raw = randomBytes(32).toString("hex");
  await db.insert(magicTokens).values({
    email: email.toLowerCase(),
    tokenHash: hash(raw),
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return raw;
}

// Son RATE_LIMIT_WINDOW_MS içinde bu e-posta için RATE_LIMIT_MAX veya daha çok
// token satırı varsa true. Spam/kötüye kullanımı sınırlar; çağıran taraf yanıtı
// yine de aynı tutmalı (enumerasyon güvenliği).
export async function isMagicLinkRateLimited(email: string): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const rows = await db
    .select({ n: count() })
    .from(magicTokens)
    .where(
      and(
        eq(magicTokens.email, email.toLowerCase()),
        gt(magicTokens.createdAt, since),
      ),
    );
  return (rows[0]?.n ?? 0) >= RATE_LIMIT_MAX;
}

export async function consumeMagicToken(
  rawToken: string,
): Promise<string | null> {
  const tokenHash = hash(rawToken);
  const rows = await db
    .select()
    .from(magicTokens)
    .where(
      and(
        eq(magicTokens.tokenHash, tokenHash),
        isNull(magicTokens.usedAt),
        gt(magicTokens.expiresAt, new Date()),
      ),
    );
  const row = rows[0];
  if (!row) return null;

  // Tek-kullanımlık işaretle; yalnız hâlâ kullanılmamışsa (yarış koşulu koruması)
  const updated = await db
    .update(magicTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(magicTokens.id, row.id), isNull(magicTokens.usedAt)))
    .returning({ id: magicTokens.id });
  if (updated.length === 0) return null;

  return row.email;
}
