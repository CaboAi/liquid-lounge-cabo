import Link from "next/link";
import { services } from "@/lib/data";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function Services({ detailed = false }: { detailed?: boolean }) {
  return (
    <section className="section-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 max-w-2xl">
          <p className="eyebrow">What we offer</p>
          <h2 className="mt-4 text-4xl font-medium sm:text-5xl">
            Care that comes to you
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Professional mobile IV therapy delivered directly to your location in
            Los Cabos. Every treatment administered by licensed medical
            professionals.
          </p>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={i * 110}>
                <Link href={service.link} className="group block h-full">
                  <article className="card-lux flex h-full flex-col">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(164_44%_28%/0.08)] transition-colors duration-500 group-hover:bg-[hsl(43_74%_66%/0.18)]">
                      <Icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="mt-6 font-heading text-2xl font-semibold">
                      {service.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {service.description}
                    </p>
                    {detailed && (
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        {service.details}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-2 pt-8 text-sm font-semibold text-primary">
                      Learn more
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </article>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
