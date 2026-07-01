import type { Metadata } from "next";
import Header from "@/components/Header";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { contactBreadcrumbSchema } from "@/lib/schema/contact";

export const metadata: Metadata = {
  title: "Book Mobile IV Therapy in Cabo",
  description:
    "Book your mobile IV therapy session in Los Cabos. Same-day availability. WhatsApp or call +52 624 228 7777. We confirm within 1 hour.",
  alternates: { canonical: "https://liquidloungeiv.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <StructuredData data={contactBreadcrumbSchema} />
      <Header />
      <main className="pt-20">
        <PageHero
          eyebrow="Get started"
          title="Book your IV therapy"
          subtitle="Same-day appointments available when possible. Advance booking is recommended during peak seasons and holidays."
        />

        <section className="section-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ContactForm />
          </div>
        </section>

        {/* Service Area */}
        <section className="section-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <p className="eyebrow justify-center">Service area</p>
            <h2 className="mt-4 text-3xl font-medium sm:text-4xl">Where we serve</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Mobile IV therapy throughout Los Cabos and the surrounding areas.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                "San Jose del Cabo",
                "Cabo San Lucas",
                "The Corridor",
                "Puerto Los Cabos",
              ].map((area) => (
                <span
                  key={area}
                  className="trust-badge"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
