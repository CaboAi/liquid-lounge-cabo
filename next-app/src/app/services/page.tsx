import type { Metadata } from "next";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import Services from "@/components/Services";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { servicesSchema, servicesBreadcrumbSchema } from "@/lib/schema/services";

export const metadata: Metadata = {
  title: "IV Therapy Services in Los Cabos",
  description:
    "Mobile IV therapy services in Los Cabos. Hangover recovery, immune boost, energy & wellness, and custom formulations delivered by a licensed medical professional.",
  alternates: { canonical: "https://liquidloungeiv.com/services" },
};

export default function ServicesPage() {
  return (
    <>
      <StructuredData data={servicesSchema} />
      <StructuredData data={servicesBreadcrumbSchema} />
      <Header />
      <main className="pt-20">
        <PageHero
          eyebrow="What we offer"
          title="Our services"
          subtitle="Professional mobile IV therapy delivered to your location in Los Cabos — every treatment administered by licensed medical professionals."
        />
        <Services detailed />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
