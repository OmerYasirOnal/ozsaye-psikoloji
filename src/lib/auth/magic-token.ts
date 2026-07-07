import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { magicTokens } from "@/lib/db/schema";

const TTL_MS = 15 * 60 * 1000; // 15 dk

function hash(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function createMagicToken(email: string): Promise<string> {
  const raw = randomBytes(32).toString("hex");
  await db.insert(magicTokens).values({
    email: email.toLowerCase(),
    tokenHash: hash(raw),
    expiresAt: new Date(Date.now() + TTL_MS),
  });
  return raw;
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
