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
