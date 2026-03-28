"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Clock, Droplets, ArrowRight } from "lucide-react";
import { ivPackages, type IVPackage } from "@/lib/data";

const categories = [
  { value: "all", label: "All" },
  { value: "recovery", label: "Recovery" },
  { value: "wellness", label: "Wellness" },
  { value: "beauty", label: "Beauty" },
  { value: "custom", label: "Custom" },
];

function PackageCard({ pkg }: { pkg: IVPackage }) {
  const Icon = pkg.icon;
  return (
    <Card className="relative h-full border bg-white transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
      {pkg.popular && (
        <Badge className="absolute -top-3 right-4 bg-accent text-accent-foreground shadow-sm">
          Most Popular
        </Badge>
      )}
      <CardContent className="flex h-full flex-col p-6 md:p-8">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(164_44%_28%/0.1)]">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <Badge variant="outline" className="text-xs uppercase">
            {pkg.category}
          </Badge>
        </div>

        <h3 className="text-xl font-heading font-semibold">{pkg.name}</h3>
        <p className="mt-1 text-sm text-accent-foreground/70">{pkg.tagline}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {pkg.description}
        </p>

        {/* Ingredients */}
        <div className="mt-4 rounded-xl bg-[hsl(164_44%_28%/0.05)] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
            What&apos;s Included
          </p>
          <ul className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
            {pkg.ingredients.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Meta */}
        <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {pkg.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <Droplets className="h-4 w-4" />
            {pkg.volume}
          </span>
        </div>

        {/* Price + CTA */}
        <div className="mt-6 flex items-end justify-between border-t pt-4">
          <p className="text-2xl font-bold text-foreground">
            <span className="text-lg">$</span>
            {pkg.price}
          </p>
          <Button variant="medical" size="sm" asChild>
            <Link href="/contact">
              Book This IV
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function IVMenuContent() {
  const [category, setCategory] = useState("all");

  const filtered =
    category === "all"
      ? ivPackages
      : ivPackages.filter((p) => p.category === category);

  return (
    <>
      {/* Category Tabs */}
      <div className="sticky top-20 z-10 border-b bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="h-auto gap-1 bg-transparent p-0">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="rounded-full px-5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="section-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {filtered.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>
      </div>

      {/* Decision Help */}
      <div className="section-white">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-heading font-semibold">
            Not Sure Which IV Is Right for You?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Take our quick quiz to get a personalized recommendation, or contact
            us directly for a consultation.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="default" size="lg" asChild>
              <Link href="/find-your-iv">Take the Quiz</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://wa.me/526242287777?text=Hi!%20I%20need%20help%20choosing%20an%20IV."
                target="_blank"
                rel="noopener noreferrer"
              >
                Message Us on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="section-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 text-center text-2xl font-heading font-semibold">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-2">
            {[
              {
                q: "What is IV therapy?",
                a: "IV therapy delivers vitamins, minerals, and hydration directly into your bloodstream through an intravenous drip. This bypasses the digestive system for 100% absorption and faster results than oral supplements.",
              },
              {
                q: "Is it safe?",
                a: "Yes. All treatments are administered by licensed BSN RN nurses with years of clinical experience. We use medical-grade equipment, pharmaceutical-quality ingredients, and follow strict sterile protocols.",
              },
              {
                q: "How long does a treatment take?",
                a: "Most treatments take 30-60 minutes depending on the IV selected. You can relax, read, or even work during your session.",
              },
              {
                q: "Where can you come?",
                a: "We serve all of Los Cabos including San Jose del Cabo, Cabo San Lucas, The Corridor, and Puerto Los Cabos. We come to hotels, villas, yachts, offices, and private residences.",
              },
              {
                q: "Do I need a prescription?",
                a: "No prescription is needed. Your nurse will do a brief health assessment before your treatment to ensure the selected IV is appropriate for you.",
              },
              {
                q: "What should I expect during treatment?",
                a: "Your nurse arrives with everything needed, sets up in a clean area, and inserts a small IV catheter (similar to a blood draw). You\u2019ll feel the cool fluid entering and most people feel relief within minutes.",
              },
            ].map((faq) => (
              <AccordionItem key={faq.q} value={faq.q} className="rounded-xl border bg-white px-4">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      {/* Booking CTA Strip */}
      <div className="section-teal py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-lg font-medium text-white">
            Ready to book your treatment?
          </p>
          <Button variant="medical" size="lg" asChild>
            <Link href="/contact">
              Book Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
