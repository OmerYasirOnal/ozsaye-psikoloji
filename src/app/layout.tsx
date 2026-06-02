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

const siteUrl = "https://ozsayepsikoloji.com";
const siteTitle = "Özsaye Psikoloji | Güvenli Bir Bölgede Kendi Özüne Doğru";
const siteDescription =
  "Psikolojik Danışman Melek Yıldız ve Klinik Psikolog Sacide Şahin ile güvenli bir alanda profesyonel psikolojik destek alın.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteUrl,
    siteName: "Özsaye Psikoloji",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Özsaye Psikoloji — Güvenli Bir Bölgede Kendi Özüne Doğru",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og.png"],
  },
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
