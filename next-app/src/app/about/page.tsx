import type { Metadata } from "next";
import Header from "@/components/Header";
import About from "@/components/About";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meet Nurse Nate | Nathan Brown BSN RN - Liquid Lounge IV Cabo",
  description:
    "Meet Nathan Brown BSN RN, the licensed registered nurse behind Liquid Lounge. Years of clinical experience delivering premium IV therapy in Los Cabos.",
  alternates: { canonical: "https://liquidloungeiv.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              YOUR NURSE
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              About Nate
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Meet the licensed BSN RN behind every Liquid Lounge IV treatment.
            </p>
          </div>
        </section>
        <About />
        <ReviewsCarousel />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
