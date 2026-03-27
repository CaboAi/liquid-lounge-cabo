import Link from "next/link";
import { services } from "@/lib/data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function Services() {
  return (
    <section className="section-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="overline mb-2">WHAT WE OFFER</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Our Services
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Professional mobile IV therapy delivered directly to your location in
            Los Cabos. Every treatment administered by a licensed BSN RN.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.title} href={service.link} className="group">
                <Card className="h-full border-none bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(164_44%_28%/0.1)]">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors group-hover:text-[hsl(164_35%_40%)]">
                      Learn More
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </CardFooter>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
