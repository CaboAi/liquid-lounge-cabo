import type { Metadata } from "next";
import Header from "@/components/Header";
import IVMenuContent from "@/components/IVMenuContent";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { faqSchema, ivMenuBreadcrumbSchema } from "@/lib/schema/iv-menu";

export const metadata: Metadata = {
  title: "IV Drip Menu | Treatments & Nutrients",
  description:
    "Browse our IV therapy menu. Premium nutrients and treatment packages tailored to your wellness goals. All treatments by a licensed medical professional in Los Cabos.",
  alternates: { canonical: "https://liquidloungeiv.com/iv-menu" },
};

export default function IVMenuPage() {
  return (
    <>
      <StructuredData data={faqSchema} />
      <StructuredData data={ivMenuBreadcrumbSchema} />
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
