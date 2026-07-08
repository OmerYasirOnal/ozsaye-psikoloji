import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/slug";

// NOT: `import "server-only"` YOK — bu modül doğrudan Vitest ile birim test edilir
// (server-only, düz Vitest altında throw eder). saveImage yalnızca sunucu
// route'larından (Task 3/7 upload endpoint'i) çağrılır.
const LOCAL_DIR = path.join(process.cwd(), ".uploads");

// Görseli saklar. BLOB_READ_WRITE_TOKEN doluysa Vercel Blob'a (public), boşsa
// (dev) `.uploads/blog/`'a yazar. sendMagicLink'teki dev/prod env-anahtar
// desenini yansıtır: Faz 3'e kadar bulut hesabı gerekmez.
export async function saveImage(
  data: Buffer,
  originalName: string,
  contentType: string,
): Promise<{ url: string }> {
  const ext = path.extname(originalName).toLowerCase() || ".bin";
  const base =
    slugify(path.basename(originalName, path.extname(originalName))) || "gorsel";
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}-${base}${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    // Dinamik import: dev yolu @vercel/blob'u hiç yüklemez.
    const { put } = await import("@vercel/blob");
    const blob = await put(`blog/${name}`, data, {
      access: "public",
      contentType,
      token,
    });
    return { url: blob.url };
  }

  const dir = path.join(LOCAL_DIR, "blog");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), data);
  return { url: `/uploads/blog/${name}` };
}
