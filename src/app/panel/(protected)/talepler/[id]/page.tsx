import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";
import { getTalep } from "@/lib/talepler-db";
import {
  istanbulInputDegeri,
  istanbulTarihSaat,
  uzmanEtiketi,
  whatsappNumarasi,
} from "@/lib/talepler";
import DurumRozeti from "../DurumRozeti";
import DurumAdimlari from "./DurumAdimlari";
import HizliAksiyonlar from "./HizliAksiyonlar";
import TalepDuzenleForm from "./TalepDuzenleForm";

export const metadata: Metadata = { title: "Talep Detayı" };

export default async function TalepDetay({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);
  const { id } = await params;
  // Bozuk id (UUID değil) ham Postgres cast hatası (500) yerine 404.
  if (!z.uuid().safeParse(id).success) notFound();

  // KAPSAM-korumalı okuma (IDOR): başka uzmana atanmış talep → null → 404
  // (admin hariç — o herhangi bir talebi görebilir).
  const talep = await getTalep(
    id,
    staff?.expertSlug ?? null,
    staff?.role === "admin",
  );
  if (!talep) notFound();

  const wa = whatsappNumarasi(talep.patientPhone);
  const planlananInitial = talep.scheduledAt
    ? istanbulInputDegeri(talep.scheduledAt)
    : "";

  return (
    <section className="space-y-8">
      <div>
        <Link
          href="/panel/talepler"
          className="text-forest-muted text-sm underline"
        >
          ← Taleplere dön
        </Link>
        <div className="mt-3 flex items-center gap-3">
          <h1 className="font-display text-2xl text-forest">
            {talep.patientName}
          </h1>
          <DurumRozeti durum={talep.status} />
        </div>
        <p className="mt-1 text-forest-muted text-sm">
          Atanan uzman: {uzmanEtiketi(talep.expertSlug)} · Oluşturma:{" "}
          {istanbulTarihSaat(talep.createdAt)}
        </p>
      </div>

      {/* Durum akışı + tek tık aksiyonlar */}
      <div className="space-y-4 rounded-lg border border-stone bg-warm-white p-5">
        <DurumAdimlari durum={talep.status} />
        <HizliAksiyonlar id={talep.id} durum={talep.status} />
      </div>

      {/* Masaüstünde iki sütun: solda iletişim+not, sağda yönetim */}
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          {/* Hızlı iletişim */}
          <div className="rounded-lg border border-stone bg-warm-white p-5">
            <h2 className="font-display text-lg text-forest">İletişim</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-forest-muted w-24 shrink-0">Telefon</dt>
                <dd className="text-forest">{talep.patientPhone}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-forest-muted w-24 shrink-0">E-posta</dt>
                <dd className="text-forest break-all">{talep.patientEmail}</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${talep.patientPhone.replace(/\s+/g, "")}`}
                className="rounded-md bg-forest px-4 py-2 text-sm text-warm-white"
              >
                Ara
              </a>
              {wa && (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-stone px-4 py-2 text-sm text-forest-muted"
                >
                  WhatsApp
                </a>
              )}
              <a
                href={`mailto:${talep.patientEmail}`}
                className="rounded-md border border-stone px-4 py-2 text-sm text-forest-muted"
              >
                E-posta gönder
              </a>
            </div>
          </div>

          {/* Talep detayı */}
          <div className="rounded-lg border border-stone bg-warm-white p-5">
            <h2 className="font-display text-lg text-forest">Talep notu</h2>
            <p className="mt-3 whitespace-pre-wrap text-forest-muted text-sm">
              {talep.preferredNote || "—"}
            </p>
            {talep.scheduledAt && (
              <p className="mt-4 text-forest-muted text-sm">
                Planlanan: {istanbulTarihSaat(talep.scheduledAt)}
              </p>
            )}
          </div>
        </div>
        <div>
          {/* Yönetim formu */}
          <div className="rounded-lg border border-stone bg-warm-white p-5">
            <h2 className="mb-4 font-display text-lg text-forest">Yönet</h2>
            <TalepDuzenleForm
              id={talep.id}
              durum={talep.status}
              planlananInitial={planlananInitial}
              icNotInitial={talep.internalNote ?? ""}
            />
          </div>
        </div>
      </div>

      {/* KVKK kaydı (bilgi amaçlı) */}
      <div className="text-forest-muted text-xs">
        <p className="font-medium text-forest">KVKK kaydı</p>
        <p className="mt-1">
          Onay:{" "}
          {talep.consentAt ? istanbulTarihSaat(talep.consentAt) : "kayıt yok"}
          {talep.consentIp ? ` · IP ${talep.consentIp}` : ""} · Güncelleme:{" "}
          {istanbulTarihSaat(talep.updatedAt)}
        </p>
      </div>
    </section>
  );
}
