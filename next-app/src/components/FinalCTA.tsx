"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { contactInfo } from "@/lib/data";

export default function FinalCTA() {
  return (
    <section className="section-teal">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-heading font-semibold tracking-tight text-white sm:text-4xl">
          Ready to Feel Your Best?
        </h2>
        <p className="mt-4 text-lg text-white/80">
          Book your mobile IV therapy session today. Same-day availability in all
          of Los Cabos.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button variant="medical" size="lg" asChild>
            <Link href="/contact">Book Now</Link>
          </Button>
          <Button
            variant="ghost"
            size="lg"
            className="border-2 border-white/30 text-white hover:bg-white/10"
            asChild
          >
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="mr-2 h-4 w-4" />
              WhatsApp Nate
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
