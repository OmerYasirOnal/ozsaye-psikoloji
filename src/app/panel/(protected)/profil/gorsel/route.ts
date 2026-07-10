import { readSessionCookie } from "@/lib/auth/session";
import { saveImage, sniffImageType } from "@/lib/storage";

// Route handler'lar (protected)/layout.tsx'in auth'unu MİRAS ALMAZ (layout'lar
// yalnız sayfaları sarar). Bu yüzden ilk savunma hattı burada: oturum çerezi.
// Blog görsel endpoint'inin (blog/gorsel/route.ts) birebir deseni.
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
  // Hızlı ön-eleme (yalnız UX): istemcinin beyanı yanlış tipte erken reddeder.
  // OTORİTE değildir — gerçek doğrulama aşağıda dosya imzasından (magic bytes).
  if (!ALLOWED_TYPES.has(dosya.type)) {
    return Response.json(
      { hata: "Yalnızca PNG, JPEG veya WebP görseli yükleyebilirsiniz" },
      { status: 415 },
    );
  }
  // Boyut sınırı, tüm dosyayı buffer'lamadan önce (dosya.size arrayBuffer okumaz).
  if (dosya.size > MAX_BYTES) {
    return Response.json(
      { hata: "Görsel en fazla 4 MB olabilir" },
      { status: 413 },
    );
  }

  // Buffer'ı BİR KEZ oku; içerik tipini imzadan doğrula (istemci beyanı değil).
  const buf = Buffer.from(await dosya.arrayBuffer());
  const sniffedType = sniffImageType(buf);
  if (!sniffedType) {
    return Response.json(
      { hata: "Yalnızca PNG, JPEG veya WebP görseli yükleyebilirsiniz" },
      { status: 415 },
    );
  }

  // İmzadan türetilen tip otoritedir: uzantı + (prod) Blob contentType bundan gelir.
  const { url } = await saveImage(buf, dosya.name, sniffedType);
  return Response.json({ url });
}
