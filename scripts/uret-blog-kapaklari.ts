import fs from "node:fs/promises";
import path from "node:path";
import { and, eq, isNull } from "drizzle-orm";
import sharp from "sharp";
import { db, client } from "../src/lib/db";
import { blogPosts } from "../src/lib/db/schema";

// Yayınlanan blog yazıları için marka-uyumlu, deterministik kapak görselleri
// üretir. İNSAN YÜZÜ/FİGÜRÜ YOK — soyut botanik-geometrik kompozisyon (YMYL
// sağlık sitesi + markanın "sakin botanik minimalizm" dili). Aynı slug her
// zaman aynı görseli üretir (slug'dan türeyen tohum).
//
// SVG string'i compose edilip sharp (librsvg) ile 1200×630 PNG'ye rasterlenir.
//
// Kullanım (IIFE/CJS deseni — db-migrate.ts gibi):
//   npx tsx --env-file=.env.local scripts/uret-blog-kapaklari.ts            (dev: dosya + DB)
//   npx tsx --env-file=.env.local scripts/uret-blog-kapaklari.ts --dry-run  (yalnız dosya)
//   npx tsx --env-file=.env.neon-prod.local ... --prod                       (Blob + prod DB)

const W = 1200;
const H = 630;

// Marka paleti (globals.css token'ları — paletten sapma yok).
const CREAM = "#F5F2EB";
const FOREST = "#1F3B2E";
const SAGE = "#A6B79B";
const BLUSH = "#D8A7A5";

// Slug'dan deterministik sayısal tohum: konuma göre ağırlıklı karakter-kodu
// toplamı (basit char-code sum'dan daha az çakışır).
function seedFromSlug(slug: string): number {
  let s = 0;
  for (let i = 0; i < slug.length; i++) {
    s = (s + slug.charCodeAt(i) * (i + 1)) >>> 0;
  }
  return s || 1;
}

// mulberry32: tohumdan deterministik PRNG. Aynı tohum → aynı sayı dizisi →
// aynı görsel (konum/yarıçap/opaklık varyasyonu bundan türer).
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Yaprak/filiz motifi: +x yönünde uzanan mercek biçimi (iki karşıt yay).
function leafPath(len: number, halfWidth: number): string {
  const l = (len / 2).toFixed(1);
  const w = halfWidth.toFixed(1);
  return `M ${-Number(l)} 0 Q 0 ${-Number(w)} ${l} 0 Q 0 ${w} ${-Number(l)} 0 Z`;
}

// Slug'a göre kompozisyonu (SVG string) üretir.
function buildSvg(slug: string): string {
  const rng = mulberry32(seedFromSlug(slug));
  const rand = (min: number, max: number) => min + rng() * (max - min);
  const n1 = (v: number) => v.toFixed(1);

  // 3 yumuşak, kesişen daire — sağa yaslı gevşek küme, kenarlara taşabilir.
  // Renk+opaklık aralıkları spec kararı (forest %8-14, sage %20-30, blush %15-20).
  const circles = [
    {
      cx: rand(720, 1000),
      cy: rand(120, 300),
      r: rand(280, 360),
      fill: FOREST,
      op: rand(0.08, 0.14),
    },
    {
      cx: rand(860, 1140),
      cy: rand(340, 560),
      r: rand(200, 280),
      fill: SAGE,
      op: rand(0.2, 0.3),
    },
    {
      cx: rand(620, 900),
      cy: rand(360, 600),
      r: rand(150, 220),
      fill: BLUSH,
      op: rand(0.15, 0.2),
    },
  ];

  const circleEls = circles
    .map(
      (c) =>
        `<circle cx="${n1(c.cx)}" cy="${n1(c.cy)}" r="${n1(c.r)}" fill="${c.fill}" fill-opacity="${c.op.toFixed(3)}" />`,
    )
    .join("\n    ");

  // Tek sage filiz/yaprak — kümeye yaslı, dönüşü tohumdan.
  const leafCx = rand(560, 760);
  const leafCy = rand(180, 320);
  const leafRot = rand(-40, 40);
  const leafEl = `<g transform="translate(${n1(leafCx)} ${n1(leafCy)}) rotate(${n1(leafRot)})"><path d="${leafPath(rand(240, 340), rand(52, 78))}" fill="${SAGE}" fill-opacity="0.22" /></g>`;

  // Sol altta tek ince sage hairline (aksan) — spec kararı.
  const hy = rand(520, 570);
  const hx1 = rand(72, 96);
  const hx2 = hx1 + rand(160, 240);
  const hairline = `<line x1="${n1(hx1)}" y1="${n1(hy)}" x2="${n1(hx2)}" y2="${n1(hy)}" stroke="${SAGE}" stroke-width="2" stroke-opacity="0.65" />`;

  // Yumuşaklık için hafif blur (librsvg feGaussianBlur destekler); hairline
  // net kalsın diye blur yalnız dolgu-şekiller grubuna uygulanır.
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="yumusak" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${CREAM}" />
  <g filter="url(#yumusak)">
    ${circleEls}
    ${leafEl}
  </g>
  ${hairline}
</svg>`;
}

// Slug'dan 1200×630 PNG buffer'ı üretir.
async function renderPng(slug: string): Promise<Buffer> {
  const svg = buildSvg(slug);
  return sharp(Buffer.from(svg)).png().toBuffer();
}

// --prod: PNG'yi Vercel Blob'a (public) yükler ve dönen mutlak URL'i verir.
// Yeni bağımlılık yok — @vercel/blob zaten kurulu (storage.ts prod dalı da kullanır).
async function uploadToBlob(slug: string, data: Buffer): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "--prod için BLOB_READ_WRITE_TOKEN gerekli (Vercel Blob yazma token'ı). " +
        "Prod env dosyasını yükleyin: --env-file=.env.neon-prod.local",
    );
  }
  const { put } = await import("@vercel/blob");
  const blob = await put(`blog/kapak-${slug}.png`, data, {
    access: "public",
    contentType: "image/png",
    token,
  });
  return blob.url;
}

(async () => {
  const dryRun = process.argv.includes("--dry-run");
  const prod = process.argv.includes("--prod");

  const localDir = path.join(process.cwd(), ".uploads", "blog");

  // Yalnız yayınlanan yazılar (taslaklara kapak gerekmez).
  const posts = await db
    .select({ slug: blogPosts.slug, cover: blogPosts.coverImageUrl })
    .from(blogPosts)
    .where(eq(blogPosts.status, "published"));

  if (posts.length === 0) {
    console.log("Yayınlanan yazı yok — üretilecek kapak yok.");
    await client.end();
    return;
  }

  for (const post of posts) {
    const { slug } = post;
    const png = await renderPng(slug);

    let url: string;
    if (dryRun) {
      // dry-run: dosyayı üret ama DB'ye dokunma.
      await fs.mkdir(localDir, { recursive: true });
      const file = path.join(localDir, `kapak-${slug}.png`);
      await fs.writeFile(file, png);
      console.log(
        `üretildi: ${file} (${(png.length / 1024).toFixed(1)} KB) — dry-run, DB yazılmadı`,
      );
      continue;
    }

    if (prod) {
      url = await uploadToBlob(slug, png);
      console.log(`Blob'a yüklendi: ${url} (${(png.length / 1024).toFixed(1)} KB)`);
    } else {
      await fs.mkdir(localDir, { recursive: true });
      const file = path.join(localDir, `kapak-${slug}.png`);
      await fs.writeFile(file, png);
      url = `/uploads/blog/kapak-${slug}.png`;
      console.log(`üretildi: ${file} (${(png.length / 1024).toFixed(1)} KB)`);
    }

    // DB'yi YALNIZCA cover_image_url NULL ise güncelle — elle atanmış kapağı
    // asla ezmez.
    const updated = await db
      .update(blogPosts)
      .set({ coverImageUrl: url, updatedAt: new Date() })
      .where(and(eq(blogPosts.slug, slug), isNull(blogPosts.coverImageUrl)))
      .returning({ slug: blogPosts.slug });

    if (updated.length > 0) {
      console.log(`  DB güncellendi: ${slug} → cover_image_url=${url}`);
    } else {
      console.log(`  DB atlandı: ${slug} zaten kapağa sahip (NULL değil).`);
    }
  }

  await client.end();
  console.log("Kapak üretimi tamam.");
})();
