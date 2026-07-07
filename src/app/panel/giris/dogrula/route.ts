import { NextRequest, NextResponse } from "next/server";
import { consumeMagicToken } from "@/lib/auth/magic-token";
import { getStaffByEmail } from "@/lib/auth/staff";
import { createSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const email = await consumeMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/panel/giris?hata=1", req.nextUrl));
  }
  const staffRow = await getStaffByEmail(email);
  if (!staffRow) {
    return NextResponse.redirect(new URL("/panel/giris?hata=1", req.nextUrl));
  }
  await createSession({
    staffId: staffRow.id,
    email: staffRow.email,
    role: staffRow.role,
  });
  return NextResponse.redirect(new URL("/panel", req.nextUrl));
}
