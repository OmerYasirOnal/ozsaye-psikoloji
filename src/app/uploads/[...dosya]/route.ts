import fs from "node:fs/promises";
import path from "node:path";

// Dev'de saveImage görselleri `.uploads/blog/`'a yazar; bu route onları kamuya
// servis eder (blog görselleri herkese açıktır). Üretimde görseller mutlak
// Vercel Blob URL'lerinden gelir, bu route hiç çağrılmaz.
const ROOT = path.join(process.cwd(), ".uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

const NOT_FOUND = new Response(null, { status: 404 });

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ dosya: string[] }> },
) {
  const { dosya } = await params;

  // Path-traversal koruması: birleşik yolu çöz; `.uploads` kökünün dışına
  // çıkıyorsa (ör. `..`) servis etme.
  const target = path.resolve(ROOT, ...dosya);
  if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
    return NOT_FOUND;
  }

  const contentType = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!contentType) return NOT_FOUND;

  let buf: Buffer;
  try {
    buf = await fs.readFile(target);
  } catch {
    return NOT_FOUND;
  }

  // Buffer'ı düz ArrayBuffer destekli Uint8Array'e kopyala: Next'in Response
  // BodyInit tipi Node Buffer'ını (Uint8Array<ArrayBufferLike>) kabul etmiyor.
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
