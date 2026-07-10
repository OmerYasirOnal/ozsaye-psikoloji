"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { getTalep, updateTalep } from "@/lib/talepler-db";
import {
  DURUM_DEGERLERI,
  istanbulTarihSaat,
  planlananaCevir,
  type RandevuDurum,
} from "@/lib/talepler";
import { sendHastaPlanlandi } from "@/lib/email/send";

export type TalepFormState = { hata?: string; ok?: boolean; uyari?: string };

// Durum + planlanan tarih + iç not TEK formda güncellenir (tek "Kaydet").
const schema = z.object({
  id: z.uuid("Geçersiz talep kimliği."),
  durum: z.enum(
    DURUM_DEGERLERI as [RandevuDurum, ...RandevuDurum[]],
    "Geçersiz durum değeri.",
  ),
  // datetime-local ham değeri; boş → planlanan tarihi temizle.
  planlanan: z.string().trim(),
  icNot: z.string().trim().max(2000, "İç not en fazla 2000 karakter olabilir."),
});

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

  // 3) Güncelleme ÖNCESİ satır (kapsam-korumalı; admin istisnası kapsamKosulu
  //    içinde; null ise bulunamadı/yetki yok). Hastaya "planlandı" bildirimi
  //    kararı bu ESKİ satıra dayanır (durum/tarih gerçekten değişti mi?) ve
  //    hasta ad/e-postası buradan alınır (bu güncellemede değişmezler).
  const isAdmin = staff.role === "admin";
  const onceki = await getTalep(id, staff.expertSlug, isAdmin);
  if (!onceki) {
    return { hata: "Bu talep bulunamadı veya erişim yetkiniz yok." };
  }

  // 4) KAPSAM-korumalı güncelleme (IDOR: başka uzmanın talebi güncellenemez —
  //    yetki WHERE'de; kapsam dışıysa updateTalep null döner; admin istisnası
  //    kapsamKosulu içinde).
  const guncel = await updateTalep(id, staff.expertSlug, isAdmin, {
    status: durum,
    scheduledAt,
    internalNote: icNot || null,
  });
  if (!guncel) {
    return { hata: "Bu talep bulunamadı veya erişim yetkiniz yok." };
  }

  // 5) İlgili panel yüzeylerini tazele.
  revalidatePath("/panel/talepler");
  revalidatePath(`/panel/talepler/${id}`);
  revalidatePath("/panel");

  // 6) "Planlandı" + tarih → hastaya bilgilendirme e-postası, YALNIZ gerçek bir
  //    DEĞİŞİKLİKTE: yeni durum scheduled + tarih dolu VE (önceki durum scheduled
  //    değildi VEYA planlanan tarih değişti). Tarih değişince hasta YENİ tarihle
  //    yeniden bilgilendirilir; yalnız iç not düzenlemesi mail üretmez.
  const planliBildirim =
    durum === "scheduled" &&
    scheduledAt !== null &&
    (onceki.status !== "scheduled" ||
      onceki.scheduledAt?.getTime() !== scheduledAt.getTime());

  // Mail KENDİ try/catch'inde: düşse bile DB güncellemesi ayakta kalır; uzmana
  // sakin bir uyarı döner (talep yine kaydedildi). `&& scheduledAt` yalnız TS
  // daraltması içindir — planliBildirim zaten tarihin dolu olduğunu garanti eder.
  if (planliBildirim && scheduledAt) {
    try {
      await sendHastaPlanlandi(
        onceki.patientEmail,
        onceki.patientName,
        istanbulTarihSaat(scheduledAt),
      );
    } catch (e) {
      console.error("[panel] hastaya planlandı bildirimi gönderilemedi:", e);
      return {
        ok: true,
        uyari:
          "Talep güncellendi ancak hastaya bilgilendirme e-postası gönderilemedi.",
      };
    }
  }

  return { ok: true };
}
