import type { Metadata } from "next";
import Image from "next/image";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Uzman Girişi",
  robots: { index: false, follow: false },
};

export default async function GirisPage({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string | string[] }>;
}) {
  const { hata } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-lg border border-stone bg-warm-white p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Öz & Saye Psikoloji"
            width={323}
            height={331}
            className="h-16 w-auto"
          />
        </div>
        <h1 className="font-display text-3xl text-forest mb-8 text-center">
          Uzman Girişi
        </h1>
        {hata && (
          <p className="mb-6 font-semibold text-forest">
            Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir
            bağlantı isteyin.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
