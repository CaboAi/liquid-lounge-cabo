import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Liquid Lounge Mobile IV Therapy collects, uses, and protects your personal and health information, in compliance with Mexico's Federal Law on Protection of Personal Data (LFPDPPP).",
  alternates: { canonical: "https://liquidloungeiv.com/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Page Header */}
        <section className="section-teal">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              YOUR PRIVACY
            </p>
            <h1 className="text-4xl font-heading font-semibold text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-white/80">
              How we collect, use, and protect your personal information.
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="section-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="space-y-10 text-muted-foreground">
              <p className="text-sm">Last updated: June 3, 2026</p>

              <p className="leading-relaxed">
                This Privacy Policy explains how Liquid Lounge Mobile IV Therapy
                handles the personal information you provide to us. We are
                committed to protecting your privacy in accordance with
                Mexico&apos;s Federal Law on Protection of Personal Data Held by
                Private Parties (Ley Federal de Protección de Datos Personales en
                Posesión de los Particulares, &ldquo;LFPDPPP&rdquo;).
              </p>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  1. Data Controller
                </h2>
                <p className="leading-relaxed">
                  The party responsible for your personal data is Liquid Lounge
                  Mobile IV Therapy, operated by Nathan Brown, based in Cabo San
                  Lucas, Baja California Sur, Mexico. For any questions about this
                  policy or your personal data, contact us at{" "}
                  <a
                    href="mailto:liquidloungeiv@gmail.com"
                    className="font-medium text-primary hover:underline"
                  >
                    liquidloungeiv@gmail.com
                  </a>
                  .
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  2. Information We Collect
                </h2>
                <p className="leading-relaxed">
                  When you submit our contact or booking form, we collect the
                  personal information you provide, which may include:
                </p>
                <ul className="mt-3 space-y-2">
                  {[
                    "Your name",
                    "Your email address",
                    "Your phone number",
                    "Health information you choose to share in order to book and safely receive IV therapy services",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  3. Purpose of Collection
                </h2>
                <p className="leading-relaxed">
                  We use your personal information solely to schedule and confirm
                  your IV therapy appointments, to communicate with you about your
                  booking, and to provide the health services you request. Health
                  information is used only to ensure that treatment is appropriate
                  and safe for you.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  4. Data Retention
                </h2>
                <p className="leading-relaxed">
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes described above and to comply
                  with any applicable legal or record-keeping obligations. When it
                  is no longer needed, your information is securely deleted.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  5. Your Rights (ARCO)
                </h2>
                <p className="leading-relaxed">
                  Under the LFPDPPP, you have the right to access, rectify
                  (correct), cancel (delete), and object to the use of your
                  personal data — known as your ARCO rights. To exercise any of
                  these rights, email us at{" "}
                  <a
                    href="mailto:liquidloungeiv@gmail.com"
                    className="font-medium text-primary hover:underline"
                  >
                    liquidloungeiv@gmail.com
                  </a>{" "}
                  and we will respond to your request.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  6. Third-Party Services
                </h2>
                <p className="leading-relaxed">
                  Our website uses Google Analytics to understand how visitors use
                  the site. Google Analytics collects anonymized usage data (such
                  as pages viewed and general location) and does not receive the
                  personal or health information you submit through our forms. We
                  do not share that personal information with Google or any other
                  analytics provider.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  7. No Sale of Your Data
                </h2>
                <p className="leading-relaxed">
                  We do not sell your personal information, and we do not share it
                  with third parties for their own marketing purposes.
                </p>
              </div>

              <div>
                <h2 className="mb-3 text-xl font-heading font-semibold text-foreground">
                  8. Changes to This Policy
                </h2>
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. Any changes
                  will be posted on this page with a revised &ldquo;Last
                  updated&rdquo; date.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
