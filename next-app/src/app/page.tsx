import type { Metadata } from "next";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Services from "@/components/Services";
import HowItWorks from "@/components/HowItWorks";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import About from "@/components/About";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Liquid Lounge - Mobile IV Therapy in Los Cabos | Cabo's Best IV Service",
  description:
    "Premium mobile IV therapy in Cabo San Lucas & San Jos\u00e9 del Cabo. Licensed RN Nathan Brown delivers hospital-grade hydration, vitamins & wellness treatments to your villa, resort, or yacht. Book today.",
  keywords: [
    "mobile IV therapy Cabo",
    "IV drip Los Cabos",
    "hangover IV Cabo San Lucas",
    "mobile nurse Cabo",
    "IV hydration Cabo",
  ],
  openGraph: {
    title: "Liquid Lounge - Mobile IV Therapy in Los Cabos",
    description:
      "Cabo's Best Mobile IV Therapy. Private, Professional, Premium. Licensed RN delivering hospital-grade treatments to your location.",
    url: "https://liquidloungeiv.com",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Liquid Lounge Mobile IV Therapy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Liquid Lounge - Mobile IV Therapy Cabo",
    description:
      "Premium mobile IV therapy delivered to your location in Los Cabos.",
    images: ["/images/og-image.jpg"],
  },
  alternates: { canonical: "https://liquidloungeiv.com" },
};

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        <Hero />
        <TrustBar />
        <Services />
        <HowItWorks />
        <ReviewsCarousel />
        <About />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
