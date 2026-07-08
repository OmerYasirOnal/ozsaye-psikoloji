import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken } from "@/lib/auth/magic-token";
import { getStaffByEmail } from "@/lib/auth/staff";
import { createSession } from "@/lib/auth/session";

// POST-only: token'ı burada (kullanıcı onay düğmesine bastığında) tüketir,
// oturum kurar ve /panel'e yönlendirir. Yönlendirmeler 303 (See Other) OLMALI:
// 307 olsaydı tarayıcı POST'u hedefe yeniden gönderirdi.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");

  const email = await consumeMagicToken(token);
  if (!email) {
    return NextResponse.redirect(
      new URL("/panel/giris?hata=1", req.nextUrl),
      303,
    );
  }

  const staffRow = await getStaffByEmail(email);
  if (!staffRow) {
    return NextResponse.redirect(
      new URL("/panel/giris?hata=1", req.nextUrl),
      303,
    );
  }

  await createSession({
    staffId: staffRow.id,
    email: staffRow.email,
    role: staffRow.role,
  });
  return NextResponse.redirect(new URL("/panel", req.nextUrl), 303);
}
