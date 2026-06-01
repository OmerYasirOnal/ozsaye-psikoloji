import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Nunito } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.slogan}`,
    template: "%s | Özsaye Psikoloji",
  },
  description: site.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: site.shortName,
    title: `${site.name} | ${site.slogan}`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | ${site.slogan}`,
    description: site.description,
  },
  // dataReady=false iken (placeholder içerik) arama motorlarına kapalı; veri hazır olunca açılır.
  robots: site.dataReady
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#2B5233",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      dir="ltr"
      className={`${cormorant.variable} ${nunito.variable}`}
    >
      <body className="min-h-screen bg-cream font-body text-forest antialiased">
        <a href="#icerik" className="skip-link">
          İçeriğe geç
        </a>
        <Header />
        {children}
        <Footer />
        <StickyCta />
        <JsonLd />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
