import Link from "next/link";
import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import { ServiceIcon } from "@/components/ServiceIcon";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { template: "%s · Panel", default: "Panel" },
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession(); // oturumsuzsa /panel/giris'e redirect

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-stone bg-warm-white px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="font-display text-forest">Öz & Saye · Panel</span>
          <div className="flex items-center gap-4">
            <span className="text-forest-muted text-sm">{session.email}</span>
            <form action={logout}>
              <button
                type="submit"
                className="text-forest-muted text-sm underline"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
        <nav className="mt-3 flex gap-5 text-sm">
          <Link
            href="/panel"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="grid" className="h-4 w-4 text-sage" />
            Gösterge
          </Link>
          <Link
            href="/panel/talepler"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="user" className="h-4 w-4 text-sage" />
            Talepler
          </Link>
          <Link
            href="/panel/blog"
            className="flex items-center gap-1.5 text-forest-muted hover:text-forest"
          >
            <ServiceIcon name="document" className="h-4 w-4 text-sage" />
            Blog
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
