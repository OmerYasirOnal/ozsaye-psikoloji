import { verifySession } from "@/lib/auth/dal";
import { getStaffByEmail } from "@/lib/auth/staff";

export default async function PanelHome() {
  const session = await verifySession();
  const staff = await getStaffByEmail(session.email);

  return (
    <section>
      <h1 className="font-display text-2xl text-forest mb-2">
        Merhaba, {staff?.name ?? session.email}
      </h1>
      <p className="text-forest-muted">
        Randevu talepleri ve blog yönetimi buraya gelecek (Faz 1–2).
      </p>
    </section>
  );
}
