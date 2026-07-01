import type { Metadata } from "next";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
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
        <PageHero
          eyebrow="IV treatments"
          title="Our IV menu"
          subtitle="Choose from our expertly crafted IV therapy packages, or let us create a custom blend tailored to your specific needs."
        />
        <IVMenuContent />
      </main>
      <Footer />
    </>
  );
}
