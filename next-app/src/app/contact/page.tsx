import type { Metadata } from "next";
import Header from "@/components/Header";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Book IV Therapy in Cabo | Schedule Your Session - Liquid Lounge",
  description:
    "Book your mobile IV therapy session in Los Cabos. Same-day availability. WhatsApp or call +52 624 228 7777. Nate confirms within 1 hour.",
  alternates: { canonical: "https://liquidloungeiv.com/contact" },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              GET STARTED
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Book Your IV Therapy
            </h1>
            <p className="mt-4 text-lg text-white/80">
              Fill out the form below and Nate will confirm your appointment
              within 1 hour. Same-day availability.
            </p>
          </div>
        </section>

        <section className="section-cream">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ContactForm />
          </div>
        </section>

        {/* Service Area */}
        <section className="section-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-heading font-semibold">
              Where We Serve
            </h2>
            <p className="mt-3 text-muted-foreground">
              Mobile IV therapy throughout Los Cabos and surrounding areas.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
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
