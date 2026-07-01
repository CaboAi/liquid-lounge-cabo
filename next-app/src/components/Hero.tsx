"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone, Star, Shield } from "lucide-react";
import { contactInfo } from "@/lib/data";

export default function Hero() {
  return (
    <section className="aurora relative flex min-h-[92vh] items-center overflow-hidden bg-gradient-hero">
      {/* Ambient texture */}
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.06]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 50%, white 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Text */}
          <div>
            <p
              className="animate-fade-in-up inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(43_74%_70%)]"
              style={{ animationFillMode: "both" }}
            >
              <span className="h-px w-7 bg-[hsl(43_74%_66%)]" />
              Mobile IV Therapy · Los Cabos
            </p>

            <h1
              className="animate-fade-in-up mt-6 text-[2.75rem] font-medium leading-[1.05] text-white sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "90ms", animationFillMode: "both" }}
            >
              Hospital-grade hydration,{" "}
              <span className="italic text-[hsl(43_74%_70%)]">
                delivered to your door
              </span>
            </h1>

            <p
              className="animate-fade-in-up mt-7 max-w-xl text-lg leading-relaxed text-white/75"
              style={{ animationDelay: "180ms", animationFillMode: "both" }}
            >
              Private IV therapy administered by licensed medical professionals —
              at your villa, resort, or yacht across Los Cabos. Recovery, energy,
              and immunity on your schedule.
            </p>

            <div
              className="animate-fade-in-up mt-9 flex flex-col gap-4 sm:flex-row"
              style={{ animationDelay: "270ms", animationFillMode: "both" }}
            >
              <Button variant="medical" size="lg" asChild>
                <Link href="/contact">Book your IV</Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="border border-white/25 text-white backdrop-blur-sm hover:bg-white/10"
                asChild
              >
                <Link href="/iv-menu">View the IV menu</Link>
              </Button>
            </div>

            {/* Trust row */}
            <div
              className="animate-fade-in-up mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70"
              style={{ animationDelay: "360ms", animationFillMode: "both" }}
            >
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-[hsl(43_74%_66%)] text-[hsl(43_74%_66%)]" />
                4.8 · 44 reviews
              </span>
              <span className="h-4 w-px bg-white/20" />
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-[hsl(43_74%_70%)]" />
                Licensed
              </span>
              <span className="h-4 w-px bg-white/20" />
              <a
                href={contactInfo.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                WhatsApp {contactInfo.phone}
              </a>
            </div>
          </div>

          {/* Framed video */}
          <div
            className="animate-fade-in-up flex justify-center lg:justify-end"
            style={{ animationDelay: "240ms", animationFillMode: "both" }}
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-[hsl(43_74%_66%/0.18)] blur-2xl" />
              <div
                className="relative w-[240px] overflow-hidden rounded-[1.75rem] border border-white/15 shadow-2xl ring-1 ring-[hsl(43_74%_66%/0.35)] sm:w-[260px] lg:w-[300px]"
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

              {/* Floating credential badge — overlap for depth */}
              <div className="absolute -bottom-5 -left-5 flex items-center gap-3 rounded-2xl border border-white/15 bg-[hsl(164_50%_20%/0.85)] px-4 py-3 shadow-lg backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(43_74%_66%)]">
                  <Shield className="h-5 w-5 text-[hsl(164_50%_20%)]" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">Licensed</p>
                  <p className="text-xs text-white/60">Medical team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40">
        <svg
          className="h-6 w-6 animate-bounce"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </section>
  );
}
