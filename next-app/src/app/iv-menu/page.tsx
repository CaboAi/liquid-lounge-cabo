import type { Metadata } from "next";
import Header from "@/components/Header";
import IVMenuContent from "@/components/IVMenuContent";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "IV Therapy Menu & Pricing | Myers Cocktail, Hydration - Liquid Lounge Cabo",
  description:
    "Browse our IV therapy menu with pricing. Recovery, wellness, beauty, and custom formulations starting at $250. All treatments by a licensed RN in Los Cabos.",
  alternates: { canonical: "https://liquidloungeiv.com/iv-menu" },
};

export default function IVMenuPage() {
  return (
    <>
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
              Premium IV therapy formulations, each tailored to specific wellness
              goals. All treatments administered by a licensed nurse.
            </p>
          </div>
        </section>
        <IVMenuContent />
      </main>
      <Footer />
    </>
  );
}
