"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { updateTalep } from "@/lib/talepler-db";
import { DURUM_DEGERLERI, type RandevuDurum } from "@/lib/talepler";

export type TalepFormState = { hata?: string; ok?: boolean };

// Durum + planlanan tarih + iç not TEK formda güncellenir (tek "Kaydet").
const schema = z.object({
  id: z.uuid("Geçersiz talep kimliği."),
  durum: z.enum(DURUM_DEGERLERI as [RandevuDurum, ...RandevuDurum[]]),
  // datetime-local ham değeri; boş → planlanan tarihi temizle.
  planlanan: z.string().trim(),
  icNot: z.string().trim().max(2000, "İç not en fazla 2000 karakter olabilir."),
});

/**
 * datetime-local ("YYYY-MM-DDTHH:mm", İstanbul yereli kabul edilir — UTC+3, DST
 * yok) → mutlak an. Sunucu saat diliminden bağımsız olması için offset açıkça
 * eklenir. Boş → null (temizle). Biçim bozuksa "gecersiz".
 */
function planlananaCevir(ham: string): Date | null | "gecersiz" {
  if (!ham) return null;
  const s = ham.slice(0, 16);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return "gecersiz";
  const d = new Date(`${s}:00+03:00`);
  return Number.isNaN(d.getTime()) ? "gecersiz" : d;
}

export async function talebiGuncelle(
  _prev: TalepFormState,
  formData: FormData,
): Promise<TalepFormState> {
  // 1) Kimlik doğrulama HER ZAMAN ilk sırada.
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  if (!staff) return { hata: "Personel kaydı bulunamadı." };

  // 2) Doğrulama (Türkçe mesajlar).
  const parsed = schema.safeParse({
    id: formData.get("id"),
    durum: formData.get("durum"),
    planlanan: formData.get("planlanan"),
    icNot: formData.get("icNot"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { hata: first?.message ?? "Form geçersiz — alanları kontrol edin." };
  }
  const { id, durum, planlanan, icNot } = parsed.data;

  const scheduledAt = planlananaCevir(planlanan);
  if (scheduledAt === "gecersiz") {
    return {
      hata: "Planlanan tarih geçersiz — lütfen tarih ve saati kontrol edin.",
    };
  }

  // 3) KAPSAM-korumalı güncelleme (IDOR: başka uzmanın talebi güncellenemez —
  //    yetki WHERE'de; kapsam dışıysa updateTalep null döner).
  const guncel = await updateTalep(id, staff.expertSlug, {
    status: durum,
    scheduledAt,
    internalNote: icNot || null,
  });
  if (!guncel) {
    return { hata: "Bu talep bulunamadı veya erişim yetkiniz yok." };
  }

  // 4) İlgili panel yüzeylerini tazele.
  revalidatePath("/panel/talepler");
  revalidatePath(`/panel/talepler/${id}`);
  revalidatePath("/panel");
  return { ok: true };
}
