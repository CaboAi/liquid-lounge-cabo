"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Clock, ArrowRight } from "lucide-react";
import { ivMenuFaqs } from "@/lib/data";

const nutrients = [
  {
    category: "Vitamins",
    items: [
      "Vitamin B1-12",
      "Vitamin C",
      "Magnesium",
      "Zinc",
      "Vitamin D",
      "Vitamin A & Vitamin E",
    ],
    description: "Essential vitamins for optimal health and energy",
  },
  {
    category: "NAD+",
    items: ["Nicotinamide adenine dinucleotide"],
    description:
      "Nicotinamide adenine dinucleotide (NAD+) is a critical coenzyme found in every cell. Anti-aging, cardio & neuro-protective qualities. Clinical studies show improved cellular energy production, enhanced recovery, DNA repair support, and longevity benefits. May help with mental clarity, physical endurance, and metabolic function.",
  },
  {
    category: "Glutathione",
    items: ["Master antioxidant tri-peptide"],
    description:
      "Glutathione is the body’s master antioxidant tri-peptide, composed of three amino acids. Essential for detoxification processes, supports liver health, enhances skin brightness and clarity, boosts immune function, and increases cellular energy. Known as the most important antioxidant for overall health and anti-aging.",
  },
  {
    category: "L-Lysine",
    items: ["Essential amino acid"],
    description:
      "L-Lysine is an essential amino acid that cannot be produced by the body and must be obtained through diet or supplementation. Critical for collagen synthesis, immune system support, wound healing, calcium absorption, and protein synthesis. Particularly beneficial for skin health, bone strength, and recovery.",
  },
  {
    category: "L-Carnitine",
    items: ["Naturally occurring amino acid"],
    description:
      "L-Carnitine is a naturally occurring amino acid derivative that plays a crucial role in energy metabolism. Facilitates the conversion of fat to fuel at the cellular level, supports weight management, enhances physical performance, improves mental clarity, and aids in recovery. Essential for optimal mitochondrial function and energy production.",
  },
  {
    category: "Fluid & Electrolytes",
    items: ["Sodium", "Potassium", "Magnesium", "Calcium"],
    description:
      "Essential for all living organisms: proper hydration and cellular function.",
  },
];

const ivPackages = [
  {
    name: "Re-Hydration",
    description: "Essential hydration therapy for optimal wellness",
    nutrients: [
      "1000mL Fluids",
      "Electrolytes like sodium, potassium, calcium, chloride",
    ],
    duration: "30-45 minutes",
  },
  {
    name: "Post-Workout",
    description: "Perfect recovery blend for athletic performance",
    nutrients: [
      "Fluids & electrolytes",
      "L-Carnitine",
      "Vitamin B1, B6, B12",
      "Magnesium",
    ],
    duration: "45 minutes",
  },
  {
    name: "Immunity Myers",
    description: "Immune system support with classic Myers’ cocktail",
    nutrients: [
      "Fluids & electrolytes",
      "Vitamin B1, B6, B12",
      "Vitamin C",
      "Zinc",
      "Magnesium",
    ],
    duration: "45 minutes",
  },
  {
    name: "The “Cure”",
    description: "Ultimate wellness therapy with premium antioxidants",
    nutrients: [
      "Fluids & electrolytes",
      "Vitamin B1, B6, B12",
      "Vitamin C",
      "Zinc",
      "Magnesium",
      "Glutathione",
    ],
    duration: "60 minutes",
  },
  {
    name: "NAD+",
    description: "Premium anti-aging and cellular repair therapy",
    nutrients: ["Fluids & electrolytes", "NAD+ up to 1000mg"],
    duration: "90 minutes",
    specialNote: "Recommended add-on: Vitamin Bs to help with production of energy",
  },
];

function CategoryChip({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-[hsl(164_44%_28%/0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
      {label}
    </span>
  );
}

function NutrientList({ items }: { items: string[] }) {
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--wellness-gold))]" />
          {item}
        </div>
      ))}
    </div>
  );
}

export default function IVMenuContent() {
  const [tab, setTab] = useState("nutrients");

  return (
    <>
      {/* Tabs */}
      <div className="section-white pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="mx-auto mb-12 grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="nutrients">Nutrients</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            {/* Nutrients Tab */}
            <TabsContent value="nutrients" className="space-y-8">
              <div className="mb-12 text-center">
                <p className="eyebrow justify-center">The ingredients</p>
                <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
                  LL. IV nutrients
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  High-quality ingredients for maximum therapeutic benefit.
                </p>
              </div>

              {/* Mobile: Accordion */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {nutrients.map((nutrient) => (
                    <AccordionItem
                      key={nutrient.category}
                      value={nutrient.category}
                      className="rounded-2xl border border-border/60 bg-white px-5"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <CategoryChip label={nutrient.category} />
                          <span className="font-heading text-lg font-semibold">
                            {nutrient.category}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">
                            {nutrient.description}
                          </p>
                          <NutrientList items={nutrient.items} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Desktop: Cards */}
              <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
                {nutrients.map((nutrient) => (
                  <div key={nutrient.category} className="card-lux">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h3 className="font-heading text-xl font-semibold">
                        {nutrient.category}
                      </h3>
                      <CategoryChip label={nutrient.category} />
                    </div>
                    <p className="mb-4 text-sm text-muted-foreground">
                      {nutrient.description}
                    </p>
                    <NutrientList items={nutrient.items} />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-8">
              <div className="mb-12 text-center">
                <p className="eyebrow justify-center">Treatment menu</p>
                <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
                  IV therapy packages
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                  Complete treatment options designed for specific wellness goals.
                </p>
              </div>

              {/* Mobile: Accordion */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {ivPackages.map((pkg) => (
                    <AccordionItem
                      key={pkg.name}
                      value={pkg.name}
                      className="rounded-2xl border border-border/60 bg-white px-5"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div>
                          <div className="font-heading text-lg font-semibold text-primary">
                            {pkg.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {pkg.description}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <NutrientList items={pkg.nutrients} />
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {pkg.duration}
                          </div>
                          {pkg.specialNote && (
                            <p className="text-xs italic text-muted-foreground">
                              {pkg.specialNote}
                            </p>
                          )}
                          <Button
                            variant="medical"
                            size="sm"
                            asChild
                            className="w-full"
                          >
                            <Link href="/contact">Book This IV</Link>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Desktop: Cards */}
              <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
                {ivPackages.map((pkg) => (
                  <div key={pkg.name} className="card-lux flex flex-col">
                    <h3 className="font-heading text-xl font-semibold text-primary">
                      {pkg.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {pkg.description}
                    </p>
                    <div className="mt-4">
                      <NutrientList items={pkg.nutrients} />
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {pkg.duration}
                    </div>
                    {pkg.specialNote && (
                      <p className="mt-2 text-xs italic text-muted-foreground">
                        {pkg.specialNote}
                      </p>
                    )}
                    <div className="mt-auto pt-6">
                      <Button
                        variant="medical"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href="/contact">
                          Book This IV
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Decision Help */}
      <div className="section-white">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="eyebrow justify-center">Need a hand?</p>
          <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
            Not sure which IV is right for you?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Take our quick quiz to get a personalized recommendation, or contact
            us directly for a consultation.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="medical" size="lg" asChild>
              <Link href="/find-your-iv">Take the quiz</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://wa.me/526242287777?text=Hi!%20I%20need%20help%20choosing%20an%20IV."
                target="_blank"
                rel="noopener noreferrer"
              >
                Message us on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="section-cream">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-12 text-center">
            <p className="eyebrow justify-center">Good to know</p>
            <h2 className="mt-4 text-3xl font-medium sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            {ivMenuFaqs.map((faq) => (
              <AccordionItem
                key={faq.question}
                value={faq.question}
                className="rounded-2xl border border-border/60 bg-white px-5"
              >
                <AccordionTrigger className="text-left font-heading text-lg font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                {/* forceMount keeps answer text in the server-rendered HTML so
                    it is crawlable on first render (hidden until expanded). */}
                <AccordionContent forceMount className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <p className="mt-6 text-center text-xs italic text-muted-foreground">
            It is the client&apos;s responsibility to check with their primary
            health care provider for safety and appropriateness of treatment.
          </p>
        </div>
      </div>

      {/* Booking CTA Strip */}
      <div className="section-teal aurora py-10">
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p className="font-heading text-2xl font-medium text-white">
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
