import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
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
    default: "Mobile IV Therapy in Cabo San Lucas | Liquid Lounge IV",
    template: "%s | Liquid Lounge IV",
  },
  description:
    "Professional mobile IV therapy in Los Cabos, Mexico. Hydration, recovery, and wellness delivered to your door by a licensed medical professional.",
  metadataBase: new URL("https://liquidloungeiv.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Liquid Lounge IV",
    images: [
      {
        url: "https://liquidloungeiv.com/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Liquid Lounge IV — Mobile IV Therapy in Los Cabos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://liquidloungeiv.com/images/og-image.jpg"],
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
        <GoogleAnalytics />
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
