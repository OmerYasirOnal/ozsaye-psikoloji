import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { site } from "@/lib/site";
import JsonLd from "@/components/JsonLd";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StickyCta from "@/components/StickyCta";
import SiteChrome from "@/components/SiteChrome";
import ChatWidget from "@/components/ChatWidget";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const title = `${site.shortName} | ${site.slogan}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    "psikolog",
    "psikolojik danışman",
    "klinik psikolog",
    "terapi",
    "psikoterapi",
    "online terapi",
    "çift terapisi",
    "aile danışmanlığı",
    "Melek Yıldız",
    "Sacide Şahin",
    "Öz & Saye Psikoloji",
    "Özsaye Psikoloji",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    siteName: site.shortName,
    title,
    description: site.description,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${site.shortName} — ${site.slogan}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/og.png"],
  },
  // dataReady=false iken (placeholder NAP/kimlik) arama motorlarına kapalı; veri hazır olunca açılır.
  robots: site.dataReady
    ? { index: true, follow: true }
    : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#1F3B2E",
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
      className={`${playfair.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen bg-cream font-body text-forest antialiased">
        {/* Progressive enhancement: JS çalışıyorsa <html>'e `js` sınıfı ekle.
            Reveal gizleme yalnızca `html.js` altında geçerli; JS yoksa içerik
            tam görünür kalır. Boyamadan önce çalışması için body'nin ilk öğesi. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <a href="#icerik" className="skip-link">
          İçeriğe geç
        </a>
        <SiteChrome
          header={<Header />}
          footer={<Footer />}
          stickyCta={<StickyCta />}
          chatWidget={<ChatWidget />}
        >
          {children}
        </SiteChrome>
        <JsonLd />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
