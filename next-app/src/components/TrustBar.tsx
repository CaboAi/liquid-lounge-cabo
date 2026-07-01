import { Shield, Award, Droplets, Star } from "lucide-react";

const stats = [
  { icon: Shield, value: "Licensed", label: "Medical team" },
  { icon: Award, value: "10+ yrs", label: "Clinical experience" },
  { icon: Droplets, value: "500+", label: "Treatments delivered" },
  { icon: Star, value: "4.8★", label: "Across 44 reviews" },
];

export default function TrustBar() {
  return (
    <section className="border-y border-border/60 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/60 sm:grid-cols-4 sm:divide-y-0">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center justify-center gap-3 px-4 py-7 sm:py-8"
            >
              <Icon
                className="h-6 w-6 shrink-0 text-wellness-gold-dark"
                strokeWidth={1.5}
              />
              <div>
                <p className="font-heading text-lg font-semibold leading-none tabular-nums text-foreground">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
