import { readSessionCookie } from "@/lib/auth/session";
import { saveImage } from "@/lib/storage";

// Route handler'lar (protected)/layout.tsx'in auth'unu MİRAS ALMAZ (layout'lar
// yalnız sayfaları sarar). Bu yüzden ilk savunma hattı burada: oturum çerezi.
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(req: Request) {
  const session = await readSessionCookie();
  if (!session) {
    return Response.json({ hata: "Oturum gerekli" }, { status: 401 });
  }

  const form = await req.formData();
  const dosya = form.get("dosya");
  if (!(dosya instanceof File)) {
    return Response.json({ hata: "Dosya bulunamadı" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(dosya.type)) {
    return Response.json(
      { hata: "Yalnızca PNG, JPEG veya WebP görseli yükleyebilirsiniz" },
      { status: 415 },
    );
  }
  if (dosya.size > MAX_BYTES) {
    return Response.json(
      { hata: "Görsel en fazla 4 MB olabilir" },
      { status: 413 },
    );
  }

  const { url } = await saveImage(
    Buffer.from(await dosya.arrayBuffer()),
    dosya.name,
    dosya.type,
  );
  return Response.json({ url });
}
