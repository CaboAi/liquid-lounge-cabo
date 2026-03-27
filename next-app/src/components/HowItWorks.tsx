import { Calendar, MapPin, Droplets } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Calendar,
    title: "Book Online",
    description:
      "Choose your IV therapy and pick a time that works for you. Same-day appointments available.",
  },
  {
    number: 2,
    icon: MapPin,
    title: "We Come to You",
    description:
      "Nate arrives at your hotel, villa, or yacht with everything needed for your treatment.",
  },
  {
    number: 3,
    icon: Droplets,
    title: "Feel Amazing",
    description:
      "Relax while your custom IV delivers results. Most treatments take just 30-45 minutes.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="overline mb-2">HOW IT WORKS</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three Simple Steps
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                  {step.number}
                </div>
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
