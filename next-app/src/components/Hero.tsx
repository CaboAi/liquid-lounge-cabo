"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { contactInfo } from "@/lib/data";

export default function Hero() {
  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-gradient-hero">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[hsl(43_74%_66%)]">
              Mobile IV Therapy in Los Cabos
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hydration &amp; Wellness Delivered to Your Door
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/80">
              Licensed nurse-administered IV therapy at your hotel, villa, or
              yacht. Recovery, energy, immunity — on your schedule.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button variant="medical" size="lg" asChild>
                <Link href="/contact">Book Your IV</Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/iv-menu">View IV Menu</Link>
              </Button>
            </div>
            <div className="mt-6">
              <a
                href={contactInfo.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                Or message us on WhatsApp: {contactInfo.phone}
              </a>
            </div>
          </div>

          {/* Vertical video — stacks below text on mobile, beside on desktop */}
          <div className="flex justify-center">
            <div
              className="relative w-[220px] sm:w-[240px] lg:w-[280px] overflow-hidden rounded-3xl shadow-2xl"
              style={{ aspectRatio: "9/16" }}
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
