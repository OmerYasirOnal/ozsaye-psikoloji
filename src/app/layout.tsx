import type { Metadata } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Özsaye Psikoloji | Güvenli Bir Bölgede Kendi Özüne Doğru",
  description:
    "Psikolojik Danışman Melek Yıldız ve Klinik Psikolog Sacide Şahin ile güvenli bir alanda profesyonel psikolojik destek alın.",
  keywords: [
    "psikolog",
    "psikolojik danışman",
    "klinik psikolog",
    "terapi",
    "psikoterapi",
    "online terapi",
    "Melek Yıldız",
    "Sacide Şahin",
    "Özsaye Psikoloji",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${cormorant.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-cream font-body text-forest antialiased">
        {children}
      </body>
    </html>
  );
}
