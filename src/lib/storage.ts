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

// Dosya imzasından (magic bytes) gerçek görsel tipini belirler. Upload route'u
// istemcinin beyan ettiği dosya.type'a GÜVENMEZ (spoofing: rasgele baytları
// image/png etiketiyle yükleme) — içerik tipi bu imzadan türetilir.
//   PNG  : 89 50 4E 47 0D 0A 1A 0A  (ilk 8 bayt)
//   JPEG : FF D8 FF                 (ilk 3 bayt)
//   WebP : 0-3 "RIFF" VE 8-11 "WEBP"
// Bağımsız (saf) fonksiyon — birim testi doğrudan çağırır.
const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG_SIG = Buffer.from([0xff, 0xd8, 0xff]);

export function sniffImageType(
  data: Buffer,
): "image/png" | "image/jpeg" | "image/webp" | null {
  if (data.length >= 8 && data.subarray(0, 8).equals(PNG_SIG)) {
    return "image/png";
  }
  if (data.length >= 3 && data.subarray(0, 3).equals(JPEG_SIG)) {
    return "image/jpeg";
  }
  if (
    data.length >= 12 &&
    data.toString("latin1", 0, 4) === "RIFF" &&
    data.toString("latin1", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

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
