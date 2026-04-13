import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/Header";
import About from "@/components/About";
import ReviewsCarousel from "@/components/ReviewsCarousel";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Meet the Team | About Liquid Lounge IV Therapy Cabo",
  description:
    "Meet the licensed medical professionals behind Liquid Lounge. Over 10 years of clinical experience delivering premium IV therapy in Los Cabos.",
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
              ABOUT US
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Meet the Team
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Meet the team behind Liquid Lounge&apos;s IV therapies
            </p>
          </div>
        </section>

        {/* Team Group Shot */}
        <section className="section-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Image
              src="/images/GroupshotLL.jpg"
              alt="The Liquid Lounge team"
              width={1200}
              height={600}
              className="w-full rounded-2xl object-cover shadow-lg"
              priority
            />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              The Liquid Lounge Team
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
