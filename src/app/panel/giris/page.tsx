import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Uzman Girişi",
  robots: { index: false, follow: false },
};

export default function GirisPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-28">
      <h1 className="font-display text-3xl text-forest mb-8">Uzman Girişi</h1>
      <LoginForm />
    </main>
  );
}
