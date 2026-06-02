import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function YazilarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {/* Sabit header'ın altında kalmaması için üst boşluk */}
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}
