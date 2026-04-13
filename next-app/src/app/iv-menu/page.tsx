import type { Metadata } from "next";
import Header from "@/components/Header";
import IVMenuContent from "@/components/IVMenuContent";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is IV therapy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "IV therapy delivers vitamins, minerals, and hydration directly into your bloodstream through an intravenous drip. This bypasses the digestive system for 100% absorption and faster results than oral supplements. Liquid Lounge administers all treatments at your hotel, villa, or yacht in Los Cabos.",
      },
    },
    {
      "@type": "Question",
      name: "Is IV therapy safe?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All Liquid Lounge treatments are administered by Nathan Brown (Nurse Nate), a licensed BSN RN (Registered Nurse) with over 10 years of clinical experience. We use medical-grade equipment, pharmaceutical-quality ingredients, and follow strict sterile protocols.",
      },
    },
    {
      "@type": "Question",
      name: "How long does a treatment take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most treatments take 30–60 minutes depending on the IV selected. You can relax, read, or even work during your session. Our licensed RN brings all equipment directly to your location.",
      },
    },
    {
      "@type": "Question",
      name: "Where does Liquid Lounge provide mobile IV therapy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Liquid Lounge serves all of Los Cabos including San José del Cabo, the Corridor (hotel zone), Cabo San Lucas, and Puerto Los Cabos. We come directly to your hotel, resort, villa, yacht, or private residence. Tailored travel available upon request.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need a prescription for IV therapy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No prescription is needed. Your Liquid Lounge team member will do a brief health assessment before your treatment to ensure the selected IV is appropriate for you.",
      },
    },
    {
      "@type": "Question",
      name: "What should I expect during an IV therapy treatment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your licensed medical professional arrives with everything needed, sets up in a clean area, and inserts a small IV catheter (similar to a blood draw). You'll feel the cool fluid entering and most people feel relief within minutes. Sessions last 30–60 minutes.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "IV Therapy Menu | Nutrients & Packages - Liquid Lounge Cabo",
  description:
    "Browse our IV therapy menu. Premium nutrients and treatment packages tailored to your wellness goals. All treatments by a licensed medical professional in Los Cabos.",
  alternates: { canonical: "https://liquidloungeiv.com/iv-menu" },
};

export default function IVMenuPage() {
  return (
    <>
      <StructuredData data={faqSchema} />
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              IV TREATMENTS
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Our IV Menu
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Choose from our expertly crafted IV therapy packages or let us
              create a custom blend tailored to your specific needs.
            </p>
          </div>
        </section>
        <IVMenuContent />
      </main>
      <Footer />
    </>
  );
}
