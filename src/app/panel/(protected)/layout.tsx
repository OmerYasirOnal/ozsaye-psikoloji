import { verifySession } from "@/lib/auth/dal";
import { logout } from "./actions";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession(); // oturumsuzsa /panel/giris'e redirect

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex items-center justify-between border-b border-stone bg-warm-white px-6 py-4">
        <span className="font-display text-forest">Öz & Saye · Panel</span>
        <div className="flex items-center gap-4">
          <span className="text-forest-muted text-sm">{session.email}</span>
          <form action={logout}>
            <button type="submit" className="text-forest-muted text-sm underline">
              Çıkış
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
