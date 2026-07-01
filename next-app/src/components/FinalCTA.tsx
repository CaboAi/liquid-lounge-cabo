"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { contactInfo } from "@/lib/data";

export default function FinalCTA() {
  return (
    <section className="section-teal aurora">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow justify-center text-[hsl(43_74%_72%)]">
          Book your visit
        </p>
        <h2 className="mt-5 text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
          Ready to enjoy more of Cabo?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">
          Professional, personalized medical care delivered directly to you.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
          <Button variant="medical" size="lg" asChild>
            <Link href="/contact">Book now</Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="border border-white/25 text-white hover:bg-white/10"
            asChild
          >
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="mr-2 h-4 w-4" />
              Message us on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
