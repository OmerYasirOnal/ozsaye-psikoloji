import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, decryptSession } from "@/lib/auth/session-core";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Giriş akışı serbest
  if (path.startsWith("/panel/giris")) return NextResponse.next();

  // Görsel yükleme API'leri (fetch ile çağrılır): kendi JSON 401'ini döndürür,
  // redirect değil. Auth'u handler'daki readSessionCookie() uygular — asıl kapı
  // orası; proxy bir HTML giriş sayfasına yönlendirirse fetch istemcisi bozulur.
  // EXACT match (prefix değil): gelecekteki .../gorsel* kardeş route'ları
  // (ör. .../gorsel-sil) sessizce muaf kalmasın; yalnız bu endpoint + trailing-slash.
  if (
    path === "/panel/blog/gorsel" ||
    path === "/panel/blog/gorsel/" ||
    path === "/panel/profil/gorsel" ||
    path === "/panel/profil/gorsel/"
  )
    return NextResponse.next();

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
