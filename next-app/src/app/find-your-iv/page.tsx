import type { Metadata } from "next";
import Header from "@/components/Header";
import Quiz from "@/components/Quiz";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Find Your Perfect IV Therapy | Personalized Quiz - Liquid Lounge Cabo",
  description:
    "Take our quick quiz to find the perfect IV therapy for your needs. Personalized recommendations in under a minute based on how you feel.",
  alternates: { canonical: "https://liquidloungeiv.com/find-your-iv" },
};

export default function FindYourIVPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              PERSONALIZED
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Find Your Perfect IV
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Answer 5 quick questions and get a personalized IV therapy
              recommendation in under a minute.
            </p>
          </div>
        </section>

        <section className="section-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Quiz variant="full" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
