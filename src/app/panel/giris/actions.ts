"use server";

import { z } from "zod";
import { isStaffEmail } from "@/lib/auth/staff";
import { createMagicToken } from "@/lib/auth/magic-token";
import { sendMagicLink } from "@/lib/email/send";

const schema = z.object({ email: z.email().transform((e) => e.toLowerCase()) });

export type LoginState = { ok?: boolean; error?: string };

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = schema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: "Geçerli bir e-posta girin." };
  const { email } = parsed.data;

  // APP_URL kontrolü isStaffEmail'den ÖNCE ve koşulsuz çalışmalı: aksi halde
  // staff/non-staff e-postaları arasında hata davranışı farkı oluşur ve bu da
  // e-posta sızıntısına yol açan bir enumerasyon kanalı olur.
  const base = process.env.APP_URL;
  if (!base) {
    throw new Error(
      "APP_URL ortam değişkeni ayarlanmalı — giriş linki için gerekli.",
    );
  }

  // Yalnız kayıtlı uzman için token üret+gönder; ama e-posta sızıntısını
  // önlemek için yanıt her durumda aynı ("gönderildi").
  if (await isStaffEmail(email)) {
    const raw = await createMagicToken(email);
    const url = `${base}/panel/giris/dogrula?token=${raw}`;
    await sendMagicLink(email, url);
  }

  return { ok: true };
}
