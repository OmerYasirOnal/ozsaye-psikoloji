import type { Metadata } from "next";
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
    <main className="mx-auto max-w-md px-6 py-28">
      <h1 className="font-display text-3xl text-forest mb-8">Uzman Girişi</h1>
      {hata && (
        <p className="mb-6 font-semibold text-forest">
          Giriş bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı
          isteyin.
        </p>
      )}
      <LoginForm />
    </main>
  );
}
