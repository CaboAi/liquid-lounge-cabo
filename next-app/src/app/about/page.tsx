import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import About from "@/components/About";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { personSchema, aboutBreadcrumbSchema } from "@/lib/schema/about";

export const metadata: Metadata = {
  title: { absolute: "About Us | Liquid Lounge IV Therapy Cabo" },
  description:
    "Meet the licensed medical professionals behind Liquid Lounge. Over 10 years of clinical experience delivering premium IV therapy in Los Cabos.",
  alternates: { canonical: "https://liquidloungeiv.com/about" },
};

export default function AboutPage() {
  return (
    <>
      <StructuredData data={personSchema} />
      <StructuredData data={aboutBreadcrumbSchema} />
      <Header />
      <main className="pt-20">
        <PageHero
          eyebrow="About us"
          title="Meet the team"
          subtitle="The people behind Liquid Lounge's IV therapies"
        />

        {/* Team Group Shot */}
        <section className="section-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-border/60">
              <Image
                src="/images/GroupshotLL.jpg"
                alt="The Liquid Lounge team"
                width={1200}
                height={600}
                className="w-full object-cover"
                priority
              />
            </div>
            <p className="mt-5 text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              The Liquid Lounge team
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
