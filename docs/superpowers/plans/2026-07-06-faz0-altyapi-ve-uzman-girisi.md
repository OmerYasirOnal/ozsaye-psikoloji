# Faz 0 — Altyapı + Uzman Girişi · Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Statik export'u kaldırıp siteyi sunuculu bir Next.js uygulamasına çevirmek; Postgres + Drizzle veri katmanını kurmak; ve yalnızca 2 uzmanın girebildiği, magic-link ile çalışan bir `/panel` giriş/oturum altyapısını çalışır hâle getirmek.

**Architecture:** Next 16 App Router (server modu). Veri: Postgres (yerelde Docker, üretimde Neon) + Drizzle ORM (`postgres-js` sürücü). Auth: `jose` ile imzalı httpOnly cookie oturumu + DB'de tek-kullanımlık hashlenmiş magic-token + Next 16 `proxy.ts` ile `/panel` guard + Server Component'lerde DAL (`verifySession`). E-posta: dev'de konsola basan, üretimde Resend'e giden tek bir taşıma.

**Tech Stack:** Next 16.2.6, React 19.2.4, TypeScript 5, Tailwind v4, Drizzle ORM + `postgres` (postgres.js), `jose`, `zod@^4`, Vitest, `tsx`, Docker Compose (Postgres 16).

## Global Constraints

- **Next 16 kırılmaları (ezberden yazma):** Middleware artık **`proxy.ts`** (kök veya `src/`). `cookies()`, `headers()`, `params` artık **`await` ile Promise**. `next/image` `unoptimized` kaldırılıyor (artık optimizasyon sunucusu var).
- **Statik export gidiyor:** `output: "export"` **kaldırılır**; `trailingSlash: true` **korunur** (indeksli `/yol/` URL'leri kırılmasın).
- **Path alias:** `@/*` → `src/*`.
- **Tasarım dili (CLAUDE.md — zorunlu):** metin yalnız `text-forest` (başlık) + `text-forest-muted` (gövde); **opaklık-tabanlı metin rengi yasak** (`text-forest/NN`); `sage` yalnız aksan. Panel UI sade/işlevsel ama bu token disiplinine uyar. Tüm arayüz metni **Türkçe**.
- **Sunucu tarafı gizli veri istemciye sızmaz:** oturum payload'ı yalnız `staffId`, `email`, `role` taşır (telefon/PII yok).
- **DB isimleri:** tablo/kolon `snake_case`; Drizzle TS tarafında `camelCase`.
- **Commit trailer:** her commit `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` ile biter.
- **Yürütme ön-koşulu:** Docker Desktop çalışıyor olmalı (yerel Postgres için). Bulut hesabı (Neon/Resend/Vercel) Faz 0'da GEREKMEZ.

---

### Task 1: Statik export'u kaldır, sunucu moduna geç

**Files:**
- Modify: `next.config.ts`
- Create: `.env.local.example`
- Create: `.gitignore` (satır ekle: `.env.local`, `drizzle/` değil — migration'lar commit'lenir)

**Interfaces:**
- Produces: sunucu modunda build alan Next uygulaması (Server Actions/route handler/cookies artık kullanılabilir).

- [ ] **Step 1: `next.config.ts`'i sunucu moduna çevir**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sunucu modu (Vercel). Statik export KALDIRILDI: artık Server Actions,
  // route handler, cookies() ve DB erişimi mümkün.
  trailingSlash: true, // indeksli /yol/ URL'leri korunur
};

export default nextConfig;
```

- [ ] **Step 2: `.env.local.example` oluştur**

```bash
# Yerel Postgres (Docker) — bkz. docker-compose.yml
DATABASE_URL=postgres://ozsaye:ozsaye@localhost:5432/ozsaye

# Oturum imza anahtarı: openssl rand -base64 32
SESSION_SECRET=degistir-openssl-rand-base64-32

# Magic-link URL'inin tabanı (dev)
APP_URL=http://localhost:3000

# Üretimde doldurulur (Faz 3 cutover); dev'de boş bırakılırsa e-posta konsola basılır
RESEND_API_KEY=
```

- [ ] **Step 3: `.gitignore`'a `.env.local` ekli mi kontrol et; değilse ekle**

Run: `grep -q "^.env.local" .gitignore && echo VAR || echo "EKLE: .env.local"`
Expected: `VAR` (Next şablonu ekler). Yoksa `.env.local` satırını ekle.

- [ ] **Step 4: Build'in sunucu modunda geçtiğini doğrula**

Run: `npm run build`
Expected: PASS. Çıktıda artık `Export` aşaması YOK; route'lar `○ (Static)` / `ƒ (Dynamic)` olarak listelenir. `out/` üretilmez.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts .env.local.example .gitignore
git commit -m "feat(altyapi): statik export'u kaldır, sunucu moduna geç" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Test + script araçları (Vitest, tsx, dotenv)

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (scripts + devDependencies)

**Interfaces:**
- Produces: `npm test` (Vitest) çalışır; testler `.env.local`'i yükler. `tsx --env-file=.env.local` ile TS script çalıştırılabilir.

- [ ] **Step 1: Araçları kur**

Run: `npm i -D vitest tsx dotenv`

- [ ] **Step 2: `vitest.config.ts` oluştur**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // DB'ye dokunan entegrasyon testleri seri koşsun (aynı tablolar)
    fileParallelism: false,
  },
  resolve: {
    // Testlerin de üretim koduyla aynı "@/*" -> "src/*" alias'ını çözebilmesi için
    // (tsconfig'deki paths yalnız TS derleyicisi/Next içindir, Vitest'i etkilemez).
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 3: `vitest.setup.ts` oluştur (.env.local yükle)**

```ts
import { config } from "dotenv";
config({ path: ".env.local" });
```

- [ ] **Step 4: `package.json` script'lerini ekle**

`"scripts"` içine ekle:
```json
"test": "vitest run",
"test:watch": "vitest",
"db:generate": "drizzle-kit generate",
"db:migrate": "tsx --env-file=.env.local scripts/db-migrate.ts",
"db:seed": "tsx --env-file=.env.local scripts/seed-staff.ts"
```

- [ ] **Step 5: Geçici duman testi yaz**

Create `src/lib/__smoke__.test.ts`:
```ts
import { expect, test } from "vitest";

test("vitest çalışıyor", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 6: Testi çalıştır**

Run: `npm test`
Expected: PASS (1 test).

- [ ] **Step 7: Duman testini sil ve commit**

```bash
rm src/lib/__smoke__.test.ts
git add package.json package-lock.json vitest.config.ts vitest.setup.ts
git commit -m "chore(test): Vitest + tsx + dotenv araçlarını kur" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Veritabanı temeli (Docker Postgres + Drizzle şema + migration)

**Files:**
- Create: `docker-compose.yml`
- Create: `src/lib/db/schema.ts`
- Create: `src/lib/db/index.ts`
- Create: `drizzle.config.ts`
- Create: `scripts/db-migrate.ts`
- Create: `src/lib/db/schema.test.ts`

**Interfaces:**
- Produces:
  - `db` (Drizzle instance) + `client` (ham `postgres-js` bağlantısı — testlerin `afterAll`'da kapatması için) — `@/lib/db`
  - Tablolar/tipler — `@/lib/db/schema`: `staff`, `appointmentRequests`, `blogPosts`, `magicTokens`; enum'lar `staffRole`, `requestStatus`, `postStatus`. Kolon adları (TS): `staff.id/email/name/expertSlug/role/createdAt`; `magicTokens.id/email/tokenHash/expiresAt/usedAt/createdAt`.

- [ ] **Step 1: `docker-compose.yml` oluştur**

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: ozsaye
      POSTGRES_PASSWORD: ozsaye
      POSTGRES_DB: ozsaye
    ports:
      - "5432:5432"
    volumes:
      - ozsaye_pgdata:/var/lib/postgresql/data

volumes:
  ozsaye_pgdata:
```

- [ ] **Step 2: Postgres'i başlat**

Run: `docker compose up -d db`
Expected: container ayakta. Doğrula: `docker compose ps` → `db` `running`.

- [ ] **Step 3: Drizzle bağımlılıklarını kur**

Run: `npm i drizzle-orm postgres` ve `npm i -D drizzle-kit`

- [ ] **Step 4: `src/lib/db/schema.ts` oluştur**

```ts
import {
  pgTable, uuid, text, timestamp, boolean, pgEnum,
} from "drizzle-orm/pg-core";

export const staffRole = pgEnum("staff_role", ["therapist", "admin"]);
export const requestStatus = pgEnum("request_status", [
  "new", "contacted", "scheduled", "done", "cancelled",
]);
export const postStatus = pgEnum("post_status", ["draft", "published"]);

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  expertSlug: text("expert_slug"), // "melek-yildiz" | "sacide-sahin" | null
  role: staffRole("role").notNull().default("therapist"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const appointmentRequests = pgTable("appointment_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  patientName: text("patient_name").notNull(),
  patientPhone: text("patient_phone").notNull(),
  patientEmail: text("patient_email").notNull(),
  expertSlug: text("expert_slug"), // null = "farketmez"
  preferredNote: text("preferred_note"),
  kvkkConsent: boolean("kvkk_consent").notNull().default(false),
  consentAt: timestamp("consent_at", { withTimezone: true }),
  consentIp: text("consent_ip"),
  status: requestStatus("status").notNull().default("new"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
  internalNote: text("internal_note"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt"),
  bodyMarkdown: text("body_markdown").notNull(),
  coverImageUrl: text("cover_image_url"),
  authorStaffId: uuid("author_staff_id").references(() => staff.id),
  status: postStatus("status").notNull().default("draft"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const magicTokens = pgTable("magic_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
```

- [ ] **Step 5: `src/lib/db/index.ts` oluştur (dev'de bağlantı tekilleştir)**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
};

// "client" export edilir: testler afterAll'da bu bağlantıyı kapatıp
// Vitest'in process'in canlı kalmasını (asılı kalmasını) önler.
export const client =
  globalForDb.client ?? postgres(process.env.DATABASE_URL!, { max: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, { schema });
```

- [ ] **Step 6: `drizzle.config.ts` oluştur**

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 7: `scripts/db-migrate.ts` oluştur (migration uygula)**

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
await migrate(drizzle(sql), { migrationsFolder: "./drizzle" });
await sql.end();
console.log("Migration uygulandı.");
```

- [ ] **Step 8: Migration üret ve uygula**

Run: `npm run db:generate` (drizzle-kit `drizzle/` altında SQL üretir — DATABASE_URL gerekliyse `.env.local` mevcut olmalı)
Then: `npm run db:migrate`
Expected: "Migration uygulandı." Tablolar oluşur.

- [ ] **Step 9: Şema entegrasyon testi yaz (`src/lib/db/schema.test.ts`)**

```ts
import { afterAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { db, client } from "./index";
import { staff } from "./schema";

test("staff tablosuna yazıp okuyabiliyoruz", async () => {
  const email = `test-${Date.now()}@example.com`;
  await db.insert(staff).values({ email, name: "Test", expertSlug: null });
  const rows = await db.select().from(staff).where(sql`email = ${email}`);
  expect(rows.length).toBe(1);
  expect(rows[0].role).toBe("therapist"); // default
  await db.delete(staff).where(sql`email = ${email}`);
});

afterAll(async () => {
  // db/index.ts'in AÇTIĞI gerçek bağlantıyı kapat (yeni bir bağlantı açıp onu
  // kapatmak işe yaramaz — asıl "client" açık kalırsa Vitest process'i asılı kalır).
  await client.end();
});
```

- [ ] **Step 10: Testi çalıştır**

Run: `npm test`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add docker-compose.yml drizzle.config.ts scripts/db-migrate.ts src/lib/db drizzle package.json package-lock.json
git commit -m "feat(db): Docker Postgres + Drizzle şema/migration (staff, randevu, blog, magic_tokens)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Uzman seed script'i

**Files:**
- Create: `scripts/seed-staff.ts`

**Interfaces:**
- Consumes: `db`, `staff` (Task 3).
- Produces: DB'de 2 uzman kaydı. E-postalar `SEED_STAFF` env'inden (virgülle: `ad:email:slug`) ya da varsayılan dev placeholder'larından.

- [ ] **Step 1: `scripts/seed-staff.ts` oluştur**

```ts
import { db, client } from "../src/lib/db";
import { staff } from "../src/lib/db/schema";

// Dev varsayılanı; gerçek e-postalar cutover'da SEED_STAFF ile verilir.
// Biçim: "Ad Soyad:email:expertSlug" virgülle ayrılmış.
const DEFAULT = [
  "Melek Yıldız:melek@example.com:melek-yildiz",
  "Sacide Şahin:sacide@example.com:sacide-sahin",
].join(",");

const rows = (process.env.SEED_STAFF ?? DEFAULT).split(",").map((r) => {
  const [name, email, expertSlug] = r.split(":").map((s) => s.trim());
  return { name, email: email.toLowerCase(), expertSlug: expertSlug || null };
});

for (const r of rows) {
  await db
    .insert(staff)
    .values(r)
    .onConflictDoNothing({ target: staff.email });
  console.log(`seed: ${r.email}`);
}

await client.end();
console.log("Seed tamam.");
```

- [ ] **Step 2: Seed'i çalıştır**

Run: `npm run db:seed`
Expected: iki `seed: ...` satırı + "Seed tamam."

- [ ] **Step 3: Doğrula**

Run: `docker compose exec -T db psql -U ozsaye -d ozsaye -c "select email, expert_slug, role from staff;"`
Expected: 2 satır.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-staff.ts
git commit -m "feat(db): uzman seed script'i (dev placeholder e-postalar)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Oturum çekirdeği (jose) + cookie sarmalayıcı

**Files:**
- Create: `src/lib/auth/session-core.ts` (saf jose mantığı — Next.js'e bağımlı değil, birim test edilir)
- Create: `src/lib/auth/session-core.test.ts`
- Create: `src/lib/auth/session.ts` (cookie sarmalayıcı — `next/headers` kullanır; yalnız Server Component/Action/Route Handler içinde çalışır, o yüzden birim testi yok, Task 9'da uçtan uca doğrulanır)

**Interfaces:**
- Produces (`@/lib/auth/session-core` — Next.js'siz, `proxy.ts` da dahil her yerden import edilebilir):
  - sabit `SESSION_COOKIE = "ozsaye_session"`
  - sabit `SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30`
  - `type SessionPayload = { staffId: string; email: string; role: "therapist" | "admin" }`
  - `encryptSession(payload: SessionPayload): Promise<string>`
  - `decryptSession(token?: string): Promise<SessionPayload | null>`
- Produces (`@/lib/auth/session` — yalnız sunucu render/action bağlamında çalışır):
  - `createSession(payload: SessionPayload): Promise<void>` (cookie yazar)
  - `deleteSession(): Promise<void>`
  - `readSessionCookie(): Promise<SessionPayload | null>`
  - `SESSION_COOKIE`, `type SessionPayload` (session-core'dan re-export)

> **Neden ikiye bölündü:** `next/headers`'ın `cookies()`'i yalnız gerçek bir Next.js istek bağlamında çalışır; Vitest testinde import zincirine girerse kırılgan olur. Saf jose şifreleme/çözme mantığını (`session-core.ts`) `cookies()`'ten ayırmak hem testi sağlamlaştırır hem de `proxy.ts`'nin (Task 10) `next/headers`'a hiç dokunmadan aynı mantığı kullanmasını sağlar.

- [ ] **Step 1: Bağımlılıkları kur**

Run: `npm i jose server-only`

- [ ] **Step 2: Başarısız test yaz (`src/lib/auth/session-core.test.ts`)**

```ts
import { expect, test } from "vitest";
import {
  encryptSession,
  decryptSession,
  type SessionPayload,
} from "./session-core";

const payload: SessionPayload = {
  staffId: "11111111-1111-1111-1111-111111111111",
  email: "melek@example.com",
  role: "therapist",
};

test("encrypt→decrypt payload'ı korur", async () => {
  const token = await encryptSession(payload);
  const out = await decryptSession(token);
  expect(out).toMatchObject(payload);
});

test("bozuk token null döner", async () => {
  expect(await decryptSession("bozuk.jwt.token")).toBeNull();
});

test("undefined token null döner", async () => {
  expect(await decryptSession(undefined)).toBeNull();
});
```

- [ ] **Step 3: Testin başarısız olduğunu gör**

Run: `npm test src/lib/auth/session-core.test.ts`
Expected: FAIL ("Cannot find module './session-core'").

- [ ] **Step 4: `src/lib/auth/session-core.ts` yaz**

```ts
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "ozsaye_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 gün

export type SessionPayload = {
  staffId: string;
  email: string;
  role: "therapist" | "admin";
};

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

export async function decryptSession(
  token?: string,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const { staffId, email, role } = payload as Record<string, unknown>;
    if (typeof staffId === "string" && typeof email === "string" &&
        (role === "therapist" || role === "admin")) {
      return { staffId, email, role };
    }
    return null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: Testin geçtiğini gör**

Run: `npm test src/lib/auth/session-core.test.ts`
Expected: PASS (3 test).

- [ ] **Step 6: Cookie sarmalayıcısını yaz (`src/lib/auth/session.ts`, birim testsiz — Task 9'da uçtan uca doğrulanır)**

```ts
import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  encryptSession,
  decryptSession,
  type SessionPayload,
} from "./session-core";

export { SESSION_COOKIE, type SessionPayload };

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encryptSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE)?.value);
}
```

- [ ] **Step 7: TypeScript'in derlendiğini doğrula**

Run: `npx tsc --noEmit`
Expected: hata yok (bu iki dosya için).

- [ ] **Step 8: Commit**

```bash
git add src/lib/auth/session-core.ts src/lib/auth/session-core.test.ts src/lib/auth/session.ts package.json package-lock.json
git commit -m "feat(auth): jose oturum çekirdeği + cookie sarmalayıcı" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Magic-token modülü (DB'de tek-kullanımlık, hashli)

**Files:**
- Create: `src/lib/auth/magic-token.ts`
- Create: `src/lib/auth/magic-token.test.ts`

**Interfaces:**
- Consumes: `db`, `magicTokens` (Task 3).
- Produces (`@/lib/auth/magic-token`):
  - `createMagicToken(email: string): Promise<string>` — ham token döner (DB'ye hash'i yazılır, 15 dk geçerli).
  - `consumeMagicToken(rawToken: string): Promise<string | null>` — geçerliyse e-posta döner ve token'ı tek-kullanımlık işaretler; değilse null.

- [ ] **Step 1: Başarısız test yaz (`src/lib/auth/magic-token.test.ts`)**

```ts
import { afterAll, expect, test } from "vitest";
import { client } from "@/lib/db";
import { createMagicToken, consumeMagicToken } from "./magic-token";

test("token bir kez tüketilir", async () => {
  const raw = await createMagicToken("melek@example.com");
  expect(await consumeMagicToken(raw)).toBe("melek@example.com");
  // ikinci kez geçersiz (tek kullanımlık)
  expect(await consumeMagicToken(raw)).toBeNull();
});

test("geçersiz token null", async () => {
  expect(await consumeMagicToken("olmayan-token")).toBeNull();
});

afterAll(async () => {
  await client.end();
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test src/lib/auth/magic-token.test.ts`
Expected: FAIL ("Cannot find module './magic-token'").

- [ ] **Step 3: `src/lib/auth/magic-token.ts` yaz**

> **Not:** Burada `"server-only"` import edilmez. Bu paket koşulsuz `throw` eden bir `index.js`'e sahiptir (yalnız Next'in `react-server` bundler koşulu altında no-op bir dosyaya çözülür); düz Vitest altında (bu koşul aktif değilken) her zaman patlar. `magic-token.ts` doğrudan `magic-token.test.ts`'ten import edildiği için `"server-only"` koyarsak tüm testler import anında çöker. Bu dosyanın zaten `next/headers` gibi tarayıcı-uyumsuz bir bağımlılığı yok, o yüzden işareti eklemek bir şey kazandırmaz.

```ts
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
```

- [ ] **Step 4: Testin geçtiğini gör**

Run: `npm test src/lib/auth/magic-token.test.ts`
Expected: PASS (2 test).

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/magic-token.ts src/lib/auth/magic-token.test.ts
git commit -m "feat(auth): DB'de tek-kullanımlık hashli magic-token" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Uzman arama + DAL (`verifySession`)

**Files:**
- Create: `src/lib/auth/staff.ts`
- Create: `src/lib/auth/dal.ts`
- Create: `src/lib/auth/staff.test.ts`

**Interfaces:**
- Consumes: `db`, `staff` (Task 3); `readSessionCookie`, `SessionPayload` (Task 5).
- Produces:
  - `@/lib/auth/staff`: `getStaffByEmail(email: string): Promise<{ id: string; email: string; name: string; role: "therapist" | "admin"; expertSlug: string | null } | null>`; `isStaffEmail(email: string): Promise<boolean>`.
  - `@/lib/auth/dal`: `verifySession(): Promise<SessionPayload>` — oturum yoksa `/panel/giris`'e redirect eder (`cache`'li).

- [ ] **Step 1: Başarısız test yaz (`src/lib/auth/staff.test.ts`)**

```ts
import { afterAll, beforeAll, expect, test } from "vitest";
import { sql } from "drizzle-orm";
import { db, client } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { getStaffByEmail, isStaffEmail } from "./staff";

const EMAIL = `staff-${Date.now()}@example.com`;

beforeAll(async () => {
  await db.insert(staff).values({ email: EMAIL, name: "Dal Test", expertSlug: "x" });
});

test("kayıtlı e-posta bulunur (büyük/küçük harf duyarsız)", async () => {
  const s = await getStaffByEmail(EMAIL.toUpperCase());
  expect(s?.email).toBe(EMAIL);
  expect(await isStaffEmail(EMAIL)).toBe(true);
});

test("kayıtsız e-posta null / false", async () => {
  expect(await getStaffByEmail("yok@example.com")).toBeNull();
  expect(await isStaffEmail("yok@example.com")).toBe(false);
});

afterAll(async () => {
  await db.delete(staff).where(sql`email = ${EMAIL}`);
  await client.end();
});
```

- [ ] **Step 2: Testin başarısız olduğunu gör**

Run: `npm test src/lib/auth/staff.test.ts`
Expected: FAIL ("Cannot find module './staff'").

- [ ] **Step 3: `src/lib/auth/staff.ts` yaz**

> **Not (Task 6'da keşfedildi):** Burada da `"server-only"` import edilmez — aynı sebep: bu dosya doğrudan `staff.test.ts`'ten import ediliyor, ve `"server-only"` paketi düz Vitest altında (Next'in `react-server` bundler koşulu aktif değilken) her zaman `throw` eder. `dal.ts` (Adım 4) farklı — o dosya doğrudan test edilmiyor, `"server-only"` orada kalır.

```ts
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";

export async function getStaffByEmail(email: string) {
  const rows = await db
    .select({
      id: staff.id,
      email: staff.email,
      name: staff.name,
      role: staff.role,
      expertSlug: staff.expertSlug,
    })
    .from(staff)
    .where(eq(staff.email, email.toLowerCase()));
  return rows[0] ?? null;
}

export async function isStaffEmail(email: string): Promise<boolean> {
  return (await getStaffByEmail(email)) !== null;
}
```

- [ ] **Step 4: `src/lib/auth/dal.ts` yaz**

```ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSessionCookie, type SessionPayload } from "./session";

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await readSessionCookie();
  if (!session) redirect("/panel/giris");
  return session;
});
```

- [ ] **Step 5: Testin geçtiğini gör**

Run: `npm test src/lib/auth/staff.test.ts`
Expected: PASS (2 test).

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth/staff.ts src/lib/auth/dal.ts src/lib/auth/staff.test.ts
git commit -m "feat(auth): uzman arama + DAL verifySession" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: E-posta taşıması (dev konsol / üretim Resend)

**Files:**
- Create: `src/lib/email/send.ts`

**Interfaces:**
- Produces (`@/lib/email/send`): `sendMagicLink(email: string, url: string): Promise<void>` — `RESEND_API_KEY` varsa Resend REST API'sine POST eder; yoksa (dev) URL'i konsola basar.

- [ ] **Step 1: `src/lib/email/send.ts` yaz (harici SDK yok — fetch ile Resend REST)**

```ts
import "server-only";

const FROM = "Öz & Saye <randevu@bildirim.ozsaye.com>";

export async function sendMagicLink(email: string, url: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;

  // Dev: anahtar yoksa konsola bas (gerçek e-posta gerekmez)
  if (!key) {
    console.log(`\n[DEV magic-link] ${email} → ${url}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: email,
      subject: "Öz & Saye panel giriş bağlantınız",
      html: `<p>Panele girmek için (15 dk geçerli):</p>
             <p><a href="${url}">${url}</a></p>
             <p>Bu isteği siz yapmadıysanız yok sayın.</p>`,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend hata: ${res.status} ${await res.text()}`);
  }
}
```

- [ ] **Step 2: TypeScript'in derlendiğini doğrula**

Run: `npx tsc --noEmit`
Expected: hata yok (bu dosya için).

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/send.ts
git commit -m "feat(email): magic-link taşıması (dev konsol / prod Resend)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Giriş sayfası + Server Action + doğrulama route'u

**Files:**
- Create: `src/app/panel/giris/page.tsx`
- Create: `src/app/panel/giris/actions.ts`
- Create: `src/app/panel/giris/LoginForm.tsx`
- Create: `src/app/panel/giris/dogrula/route.ts`

**Interfaces:**
- Consumes: `isStaffEmail` (Task 7), `createMagicToken`/`consumeMagicToken` (Task 6), `getStaffByEmail` (Task 7), `createSession` (Task 5), `sendMagicLink` (Task 8).
- Produces: `requestMagicLink(prevState, formData)` server action; GET `/panel/giris/dogrula?token=...` oturum kurup `/panel`'e yönlendirir.

- [ ] **Step 1: `zod` kur**

Run: `npm i zod@^4`

- [ ] **Step 2: Server action yaz (`src/app/panel/giris/actions.ts`)**

```ts
"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { isStaffEmail } from "@/lib/auth/staff";
import { createMagicToken } from "@/lib/auth/magic-token";
import { sendMagicLink } from "@/lib/email/send";

const schema = z.object({ email: z.email().transform((e) => e.toLowerCase()) });

export type LoginState = { ok?: boolean; error?: string };

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Geçerli bir e-posta girin." };
  const { email } = parsed.data;

  // Yalnız kayıtlı uzman için token üret+gönder; ama e-posta sızıntısını
  // önlemek için yanıt her durumda aynı ("gönderildi").
  if (await isStaffEmail(email)) {
    const raw = await createMagicToken(email);
    const base =
      process.env.APP_URL ??
      `https://${(await headers()).get("host") ?? "ozsaye.com"}`;
    const url = `${base}/panel/giris/dogrula?token=${raw}`;
    await sendMagicLink(email, url);
  }

  return { ok: true };
}
```

- [ ] **Step 3: İstemci formu yaz (`src/app/panel/giris/LoginForm.tsx`)**

```tsx
"use client";

import { useActionState } from "react";
import { requestMagicLink, type LoginState } from "./actions";

const initial: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initial);

  if (state.ok) {
    return (
      <p className="text-forest-muted">
        E-postanı kontrol et — giriş bağlantısını gönderdik (15 dk geçerli).
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <label htmlFor="email" className="text-forest font-medium">
        E-posta
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="rounded-md border border-stone px-4 py-3"
      />
      {state.error && (
        <p className="font-semibold text-forest">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-forest px-4 py-3 text-warm-white disabled:opacity-60"
      >
        {pending ? "Gönderiliyor…" : "Giriş bağlantısı gönder"}
      </button>
    </form>
  );
}
```

> **Renk kuralı:** CLAUDE.md metin rengini yalnız `text-forest` + `text-forest-muted` ile sınırlıyor (opaklık-tabanlı `text-forest/NN` ve `sage` metin olarak yasak). Hata metni bu yüzden ayrı bir "kırmızı/blush" renk yerine `text-forest font-semibold` ile vurgulanıyor. `bg-forest`, `text-warm-white`, `border-stone` globals.css'te tanımlı gerçek token'lar. `disabled:opacity-60` bütün butonun durum göstergesi (metin-rengi opaklığı değil), kural ihlali değil.

- [ ] **Step 4: Giriş sayfasını yaz (`src/app/panel/giris/page.tsx`)**

```tsx
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Uzman Girişi",
  robots: { index: false, follow: false },
};

export default function GirisPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-28">
      <h1 className="font-display text-3xl text-forest mb-8">Uzman Girişi</h1>
      <LoginForm />
    </main>
  );
}
```

- [ ] **Step 5: Doğrulama route'unu yaz (`src/app/panel/giris/dogrula/route.ts`)**

```ts
import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken } from "@/lib/auth/magic-token";
import { getStaffByEmail } from "@/lib/auth/staff";
import { createSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const email = await consumeMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/panel/giris?hata=1", req.nextUrl));
  }
  const staffRow = await getStaffByEmail(email);
  if (!staffRow) {
    return NextResponse.redirect(new URL("/panel/giris?hata=1", req.nextUrl));
  }
  await createSession({
    staffId: staffRow.id,
    email: staffRow.email,
    role: staffRow.role,
  });
  return NextResponse.redirect(new URL("/panel", req.nextUrl));
}
```

- [ ] **Step 6: Uçtan uca dene (dev)**

Run: `npm run dev` (Docker Postgres ayakta + seed yapılmış olmalı)
1. `http://localhost:3000/panel/giris` → seed'li e-postayı gir (`melek@example.com`) → "E-postanı kontrol et" görünür.
2. Terminalde `[DEV magic-link] ... → http://localhost:3000/panel/giris/dogrula?token=...` çıkar. O URL'i tarayıcıda aç.
3. `/panel`'e yönlenir (henüz sayfa yoksa 404 — Task 11'de gelecek; ama cookie set edilmiş olur).
Doğrula: DevTools → Application → Cookies → `ozsaye_session` var.

- [ ] **Step 7: Commit**

```bash
git add src/app/panel/giris package.json package-lock.json
git commit -m "feat(panel): magic-link giriş sayfası + server action + doğrulama route'u" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: `/panel` proxy guard'ı

**Files:**
- Create: `src/proxy.ts`

**Interfaces:**
- Consumes: `SESSION_COOKIE`, `decryptSession` (Task 5 `session-core.ts` — `next/headers` bağımsız, proxy için uygun).
- Produces: `/panel/**` (giriş sayfaları hariç) oturumsuz erişimi `/panel/giris`'e yönlendiren proxy.

- [ ] **Step 1: `src/proxy.ts` yaz**

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, decryptSession } from "@/lib/auth/session-core";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Giriş akışı serbest
  if (path.startsWith("/panel/giris")) return NextResponse.next();

  // /panel/** için optimistik oturum kontrolü (yalnız cookie okur)
  const session = await decryptSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/panel/giris", req.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*"],
};
```

> **Not (Next 16):** dosya adı `proxy.ts` (eski `middleware.ts` değil). Proxy Node.js runtime'da çalışır; `jose` uyumlu. Bu yalnız optimistik kontrol — asıl güvenlik DAL'da (Task 7/11).

- [ ] **Step 2: Doğrula**

Run: `npm run dev`
1. Gizli sekmede `http://localhost:3000/panel` → `/panel/giris`'e yönlenir.
2. `http://localhost:3000/panel/giris` → yönlenmeden açılır.

- [ ] **Step 3: Commit**

```bash
git add src/proxy.ts
git commit -m "feat(panel): proxy ile /panel guard (Next 16 proxy.ts)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Panel kabuğu + gösterge + çıkış

**Files:**
- Create: `src/app/panel/layout.tsx`
- Create: `src/app/panel/page.tsx`
- Create: `src/app/panel/actions.ts`

**Interfaces:**
- Consumes: `verifySession` (Task 7 DAL), `getStaffByEmail` (Task 7), `deleteSession` (Task 5).
- Produces: giriş yapan uzmanın adını gösteren `/panel` göstergesi + çalışan çıkış.

- [ ] **Step 1: Çıkış action'ı yaz (`src/app/panel/actions.ts`)**

```ts
"use server";

import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/auth/session";

export async function logout() {
  await deleteSession();
  redirect("/panel/giris");
}
```

- [ ] **Step 2: Panel layout'u yaz (`src/app/panel/layout.tsx`)**

```tsx
import { verifySession } from "@/lib/auth/dal";
import { logout } from "./actions";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession(); // oturumsuzsa /panel/giris'e redirect

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-stone bg-warm-white px-6 py-4">
        <span className="font-display text-forest">Öz & Saye · Panel</span>
        <div className="flex items-center gap-4">
          <span className="text-forest-muted text-sm">{session.email}</span>
          <form action={logout}>
            <button type="submit" className="text-forest-muted text-sm underline">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Gösterge sayfasını yaz (`src/app/panel/page.tsx`)**

```tsx
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";

export default async function PanelHome() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);

  return (
    <section>
      <h1 className="font-display text-2xl text-forest mb-2">
        Merhaba, {staff?.name ?? session.email}
      </h1>
      <p className="text-forest-muted">
        Randevu talepleri ve blog yönetimi buraya gelecek (Faz 1–2).
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Uçtan uca doğrula**

Run: `npm run dev`
1. `/panel/giris`'ten seed'li e-posta ile gir → konsoldaki magic-link'i aç → `/panel` açılır, "Merhaba, Melek Yıldız" + üstte e-posta görünür.
2. "Çıkış" → `/panel/giris`'e döner; tekrar `/panel` → guard geri yollar.

- [ ] **Step 5: Build'in geçtiğini doğrula**

Run: `npm run build`
Expected: PASS. `/panel*` route'ları `ƒ (Dynamic)` (cookies kullandığı için) listelenir.

- [ ] **Step 6: Commit**

```bash
git add src/app/panel/layout.tsx src/app/panel/page.tsx src/app/panel/actions.ts
git commit -m "feat(panel): kabuk + gösterge + çıkış (DAL korumalı)" -m "Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Faz 0 Tamamlanma Kriterleri (kabul)
- [ ] `npm run build` sunucu modunda geçiyor; `out/` üretilmiyor.
- [ ] `npm test` yeşil (session, magic-token, staff, schema testleri).
- [ ] Docker Postgres + Drizzle migration + seed çalışıyor; 4 tablo mevcut.
- [ ] Seed'li e-posta ile magic-link akışı: giriş → konsol linki → `/panel` oturum açılıyor.
- [ ] Seed'siz/kayıtsız e-posta girişte token üretmiyor (whitelist).
- [ ] Oturumsuz `/panel` → `/panel/giris` (proxy guard).
- [ ] Çıkış oturumu siliyor.

## Bu planın KAPSAM DIŞI bıraktıkları (sonraki fazlar)
- **Faz 1:** randevu formu → Server Action → `appointment_requests` + Resend bildirimi; `/panel/talepler` liste/detay/durum/iç not/hızlı iletişim.
- **Faz 2:** `content/blog/*.md` → `blog_posts` migration; `blog.ts` DB'den okuma; panel WYSIWYG editör + Vercel Blob + ISR.
- **Faz 3:** Vercel + Neon + Resend provizyon; gerçek uzman e-postalarıyla seed; `bildirim.ozsaye.com` SPF/DKIM; GoDaddy DNS web-repoint (MX korunur); PHP/FTP emekli; KVKK/gizlilik metin güncelle.

## Self-Review notu
Spec §4 (mimari), §5 (staff/appointment_requests/blog_posts + auth token tablosu), §7 (panel/giriş/guard/DAL), §12 (maliyet — dev'de sıfır) bu planla karşılanıyor. Auth mekanizması spec'teki "Auth.js" yerine **Next 16 dokümanının önerdiği jose+cookie+DB-token+DAL** ile uygulanıyor (aynı UX: magic-link + 2 beyaz-liste; beta-kütüphane/Next 16.2 uyum riski elenir). Randevu/blog/cutover başka fazların planlarında.
