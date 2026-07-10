import type { Metadata } from "next";
import { verifySession } from "@/lib/auth/dal";
import PostForm from "../PostForm";
import { createPost } from "../actions";

export const metadata: Metadata = { title: "Yeni Yazı" };

export default async function YeniYaziPage() {
  await verifySession(); // DAL cache'li — layout zaten çağırdı, bedava

  return (
    <section>
      <h1 className="font-display text-2xl text-forest mb-8">Yeni Yazı</h1>
      <PostForm action={createPost} submitLabel="Taslak olarak kaydet" />
    </section>
  );
}
