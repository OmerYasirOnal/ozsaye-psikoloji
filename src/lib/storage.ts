import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { slugify } from "@/lib/slug";

// NOT: `import "server-only"` YOK — bu modül doğrudan Vitest ile birim test edilir
// (server-only, düz Vitest altında throw eder). saveImage yalnızca sunucu
// route'larından (Task 3/7 upload endpoint'i) çağrılır.
const LOCAL_DIR = path.join(process.cwd(), ".uploads");

// Kanonik uzantı MIME'dan türetilir: upload endpoint'i görseli MIME ile doğrular,
// bu yüzden uzantısız/yanlış-adlı ama geçerli bir görsel de doğru uzantıyla
// saklanır — aksi halde `.bin` olur ve dev-serve route (uzantı allowlist'i:
// src/app/uploads/[...dosya]/route.ts) onu servis etmez.
const MIME_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

// Görseli saklar. BLOB_READ_WRITE_TOKEN doluysa Vercel Blob'a (public), boşsa
// (dev) `.uploads/blog/`'a yazar. sendMagicLink'teki dev/prod env-anahtar
// desenini yansıtır: Faz 3'e kadar bulut hesabı gerekmez.
export async function saveImage(
  data: Buffer,
  originalName: string,
  contentType: string,
): Promise<{ url: string }> {
  const rawExt = path.extname(originalName).toLowerCase();
  // Eşlenmemiş tipler için fallback: dosya-adı uzantısı (baştaki-nokta koruması:
  // yalnız "." olan uzantıyı reddet), o da yoksa `.bin`.
  const fallbackExt = rawExt && rawExt !== "." ? rawExt : ".bin";
  const ext = MIME_EXT[contentType.toLowerCase()] ?? fallbackExt;
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
