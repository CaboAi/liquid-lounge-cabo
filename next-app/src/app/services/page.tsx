import type { Metadata } from "next";
import Header from "@/components/Header";
import Services from "@/components/Services";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "IV Therapy Services | Blood Work, Consultations & Group Events - Liquid Lounge",
  description:
    "Mobile IV therapy services in Los Cabos. Hangover recovery, immune boost, energy & wellness, and custom formulations delivered by a licensed BSN RN.",
  alternates: { canonical: "https://liquidloungeiv.com/services" },
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              WHAT WE OFFER
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Our Services
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Professional mobile IV therapy delivered to your location in Los Cabos.
              Every treatment administered by a licensed BSN RN.
            </p>
          </div>
        </section>
        <Services />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
