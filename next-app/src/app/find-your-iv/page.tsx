import type { Metadata } from "next";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Quiz from "@/components/Quiz";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { findYourIvBreadcrumbSchema } from "@/lib/schema/find-your-iv";

export const metadata: Metadata = {
  title: "Find Your IV | Personalized Recommendations",
  description:
    "Take our quick quiz to find the perfect IV therapy for your needs. Personalized recommendations in under a minute based on how you feel.",
  alternates: { canonical: "https://liquidloungeiv.com/find-your-iv" },
};

export default function FindYourIVPage() {
  return (
    <>
      <StructuredData data={findYourIvBreadcrumbSchema} />
      <Header />
      <main className="pt-20">
        <PageHero
          eyebrow="Personalized"
          title="Find your perfect IV"
          subtitle="Answer 5 quick questions and get a personalized IV therapy recommendation in under a minute."
        />

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
