"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Clock, ArrowRight } from "lucide-react";

const nutrients = [
  {
    category: "Vitamins",
    items: ["Vitamin B1-12", "Vitamin C", "Magnesium", "Zinc", "Vitamin D", "Vitamin A & Vitamin E"],
    description: "Essential vitamins for optimal health and energy",
    color: "bg-blue-100 text-blue-800",
  },
  {
    category: "NAD+",
    items: ["Nicotinamide adenine dinucleotide"],
    description:
      "Nicotinamide adenine dinucleotide (NAD+) is a critical coenzyme found in every cell. Anti-aging, cardio & neuro-protective qualities. Clinical studies show improved cellular energy production, enhanced recovery, DNA repair support, and longevity benefits. May help with mental clarity, physical endurance, and metabolic function.",
    color: "bg-purple-100 text-purple-800",
  },
  {
    category: "Glutathione",
    items: ["Master antioxidant tri-peptide"],
    description:
      "Glutathione is the body\u2019s master antioxidant tri-peptide, composed of three amino acids. Essential for detoxification processes, supports liver health, enhances skin brightness and clarity, boosts immune function, and increases cellular energy. Known as the most important antioxidant for overall health and anti-aging.",
    color: "bg-green-100 text-green-800",
  },
  {
    category: "L-Lysine",
    items: ["Essential amino acid"],
    description:
      "L-Lysine is an essential amino acid that cannot be produced by the body and must be obtained through diet or supplementation. Critical for collagen synthesis, immune system support, wound healing, calcium absorption, and protein synthesis. Particularly beneficial for skin health, bone strength, and recovery.",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    category: "L-Carnitine",
    items: ["Naturally occurring amino acid"],
    description:
      "L-Carnitine is a naturally occurring amino acid derivative that plays a crucial role in energy metabolism. Facilitates the conversion of fat to fuel at the cellular level, supports weight management, enhances physical performance, improves mental clarity, and aids in recovery. Essential for optimal mitochondrial function and energy production.",
    color: "bg-red-100 text-red-800",
  },
  {
    category: "Fluid & Electrolytes",
    items: ["Sodium", "Potassium", "Magnesium", "Calcium"],
    description: "Essential for all living organisms: proper hydration and cellular function.",
    color: "bg-teal-100 text-teal-800",
  },
];

const ivPackages = [
  {
    name: "Re-Hydration",
    description: "Essential hydration therapy for optimal wellness",
    nutrients: ["1000mL Fluids", "Electrolytes like sodium, potassium, calcium, chloride"],
    duration: "30-45 minutes",
  },
  {
    name: "Post-Workout",
    description: "Perfect recovery blend for athletic performance",
    nutrients: ["Fluids & electrolytes", "L-Carnitine", "Vitamin B1, B6, B12", "Magnesium"],
    duration: "45 minutes",
  },
  {
    name: "Immunity Myers",
    description: "Immune system support with classic Myers\u2019 cocktail",
    nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium"],
    duration: "45 minutes",
  },
  {
    name: "The \u201CCure\u201D",
    description: "Ultimate wellness therapy with premium antioxidants",
    nutrients: ["Fluids & electrolytes", "Vitamin B1, B6, B12", "Vitamin C", "Zinc", "Magnesium", "Glutathione"],
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

export default function IVMenuContent() {
  const [tab, setTab] = useState("nutrients");

  return (
    <>
      {/* Tabs */}
      <div className="section-white pb-0">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="nutrients">Nutrients</TabsTrigger>
              <TabsTrigger value="packages">Packages</TabsTrigger>
            </TabsList>

            {/* Nutrients Tab */}
            <TabsContent value="nutrients" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-semibold">LL. IV Nutrients</h2>
                <p className="mt-2 text-muted-foreground">
                  High-quality ingredients for maximum therapeutic benefit
                </p>
              </div>

              {/* Mobile: Accordion */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {nutrients.map((nutrient) => (
                    <AccordionItem
                      key={nutrient.category}
                      value={nutrient.category}
                      className="rounded-xl border bg-white px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3">
                          <Badge className={nutrient.color}>{nutrient.category}</Badge>
                          <span className="font-semibold">{nutrient.category}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <p className="text-sm text-muted-foreground">{nutrient.description}</p>
                          <div className="space-y-2">
                            {nutrient.items.map((item) => (
                              <div key={item} className="text-sm flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Desktop: Cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutrients.map((nutrient) => (
                  <Card
                    key={nutrient.category}
                    className="border hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">{nutrient.category}</CardTitle>
                        <Badge className={nutrient.color}>{nutrient.category}</Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {nutrient.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {nutrient.items.map((item) => (
                          <div
                            key={item}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Packages Tab */}
            <TabsContent value="packages" className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-heading font-semibold">IV Therapy Packages</h2>
                <p className="mt-2 text-muted-foreground">
                  Complete treatment options designed for specific wellness goals
                </p>
              </div>

              {/* Mobile: Accordion */}
              <div className="md:hidden">
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {ivPackages.map((pkg) => (
                    <AccordionItem
                      key={pkg.name}
                      value={pkg.name}
                      className="rounded-xl border bg-white px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div>
                          <div className="font-semibold text-primary">{pkg.name}</div>
                          <div className="text-sm text-muted-foreground">{pkg.description}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            {pkg.nutrients.map((item) => (
                              <div key={item} className="text-sm flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {item}
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {pkg.duration}
                          </div>
                          {pkg.specialNote && (
                            <p className="text-xs italic text-muted-foreground">
                              {pkg.specialNote}
                            </p>
                          )}
                          <Button variant="medical" size="sm" asChild className="w-full">
                            <Link href="/contact">Book This IV</Link>
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Desktop: Cards */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ivPackages.map((pkg) => (
                  <Card key={pkg.name} className="border hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-primary">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        {pkg.nutrients.map((item) => (
                          <div
                            key={item}
                            className="text-sm text-muted-foreground flex items-center gap-2"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {pkg.duration}
                      </div>
                      {pkg.specialNote && (
                        <p className="text-xs italic text-muted-foreground">
                          {pkg.specialNote}
                        </p>
                      )}
                      <Button variant="medical" size="sm" asChild className="w-full">
                        <Link href="/contact">
                          Book This IV
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
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
                a: "Yes. All treatments are administered by a licensed medical professional. We use medical-grade equipment, pharmaceutical-quality ingredients, and follow strict sterile protocols.",
              },
              {
                q: "How long does a treatment take?",
                a: "Most treatments take 30-60 minutes depending on the IV selected. You can relax, read, or even work during your session.",
              },
              {
                q: "Where can you come?",
                a: "Serving all of Los Cabos including San Jose del Cabo, the Corridor, and Cabo San Lucas. Tailored travel available upon request.",
              },
              {
                q: "Do I need a prescription?",
                a: "No prescription is needed. Your Liquid Lounge team member will do a brief health assessment before your treatment to ensure the selected IV is appropriate for you.",
              },
              {
                q: "What should I expect during treatment?",
                a: "Your licensed medical professional arrives with everything needed, sets up in a clean area, and inserts a small IV catheter (similar to a blood draw). You\u2019ll feel the cool fluid entering and most people feel relief within minutes.",
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
          <p className="mt-6 text-center text-xs text-muted-foreground italic">
            It is the client&apos;s responsibility to check with their primary health care provider for safety and appropriateness of treatment.
          </p>
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
