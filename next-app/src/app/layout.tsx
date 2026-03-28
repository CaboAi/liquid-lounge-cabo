import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import StructuredData, { localBusinessSchema } from "@/components/StructuredData";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Liquid Lounge - Mobile IV Therapy Cabo",
    template: "%s | Liquid Lounge IV",
  },
  description:
    "Professional mobile IV therapy in Los Cabos, Mexico. Hydration, recovery, and wellness delivered to your door by a licensed BSN RN nurse.",
  metadataBase: new URL("https://liquidloungeiv.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Liquid Lounge IV",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Liquid Lounge Mobile IV Therapy in Los Cabos",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased">
        <StructuredData data={localBusinessSchema} />
        <GoogleAnalytics />
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
