import { Calendar, MapPin, Droplets } from "lucide-react";
import Reveal from "@/components/Reveal";

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: "Book online",
    description:
      "Choose your IV therapy and pick a time that works for you. Same-day appointments available.",
  },
  {
    number: 2,
    icon: MapPin,
    title: "We come to you",
    description:
      "Our team arrives at your hotel, villa, or yacht with everything needed for your treatment.",
  },
  {
    number: 3,
    icon: Droplets,
    title: "Feel amazing",
    description:
      "Relax while your custom IV delivers results. Most treatments take just 30–45 minutes.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow justify-center">How it works</p>
          <h2 className="mt-4 text-4xl font-medium sm:text-5xl">
            Three simple steps
          </h2>
        </Reveal>

        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Connecting hairline */}
          <div className="absolute inset-x-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.number}
                delay={i * 120}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-border bg-white shadow-card">
                  <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                  <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent font-heading text-sm font-semibold text-accent-foreground">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-xl font-semibold">
                  {step.title}
                </h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
