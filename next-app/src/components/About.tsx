"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shield, Award, Phone } from "lucide-react";
import { contactInfo } from "@/lib/data";

export default function About() {
  return (
    <section className="section-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Photo with layered gold frame + floating stat */}
          <div className="order-2 lg:order-1">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -left-4 -top-4 h-full w-full rounded-3xl border border-[hsl(43_74%_66%/0.5)]" />
              <Image
                src="/images/nate-headshot.jpg"
                alt="Nathan Brown — licensed BSN registered nurse and founder of Liquid Lounge IV"
                width={448}
                height={560}
                className="relative w-full rounded-3xl object-cover shadow-lg"
              />
              <div className="absolute -bottom-6 -right-6 hidden rounded-2xl bg-primary px-6 py-4 text-center shadow-lg sm:block">
                <p className="font-heading text-3xl font-semibold tabular-nums text-white">
                  10+
                </p>
                <p className="text-xs uppercase tracking-wider text-white/70">
                  years clinical
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="eyebrow">The founder</p>
            <h2 className="mt-4 text-4xl font-medium sm:text-5xl">
              Meet Nurse Nate
            </h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-medical-teal">
              Founder, BSN, RN
            </p>
            <div className="divider-gold mt-6" />
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              With more than 10 years of clinical experience across hospitals,
              clinics, and care homes, I founded Liquid Lounge with a simple
              belief: Exceptional medical care should combine clinical
              excellence with genuine, personalized care.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              After falling in love with Los Cabos, I saw an opportunity to
              bring concierge medical care directly to where people are
              staying. No waiting rooms. No rushed appointments. Just
              professional care, delivered with the time, attention, and
              clinical standards every client deserves.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Because the best medical care doesn&apos;t just help you
              recover, it helps you enjoy more of Los Cabos.
            </p>

            {/* Credentials */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="trust-badge">
                <Shield className="h-4 w-4" />
                Licensed BSN RN
              </span>
              <span className="trust-badge">
                <Award className="h-4 w-4" />
                10+ years experience
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button variant="medical" size="lg" asChild>
                <Link href="/contact">Schedule a consultation</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
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
        </div>
      </div>
    </section>
  );
}
