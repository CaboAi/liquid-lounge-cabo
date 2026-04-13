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
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Photo */}
          <div className="order-2 lg:order-1">
            <Image
              src="/images/nate-headshot.jpg"
              alt="Nathan Brown — Licensed medical professional and founder of Liquid Lounge IV"
              width={448}
              height={560}
              className="mx-auto w-full max-w-md rounded-2xl object-cover shadow-lg"
            />
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2">
            <p className="overline mb-2">THE FOUNDER</p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Meet Nurse Nate, Founder, BSN
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Nate is a licensed medical professional with over 10 years of
              clinical experience. After relocating to Los Cabos, he founded
              Liquid Lounge to bring hospital-grade IV therapies and mobile
              treatments to visitors and residents in the comfort of their spaces.
            </p>
            <p className="mt-4 text-muted-foreground">
              Every treatment is administered by a licensed medical professional using
              medical-grade equipment and pharmaceutical-quality vitamins and nutrients.
              Your safety and comfort are his top priorities.
            </p>

            {/* Credentials */}
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="trust-badge">
                <Shield className="h-4 w-4" />
                Licensed BSN RN
              </span>
              <span className="trust-badge">
                <Award className="h-4 w-4" />
                10+ Years Experience
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="medical" size="lg" asChild>
                <Link href="/contact">Schedule Consultation</Link>
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
