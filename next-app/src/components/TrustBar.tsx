import { Shield, Award, Droplets, Star } from "lucide-react";

const stats = [
  { icon: Shield, value: "Licensed BSN RN", label: "Registered Nurse" },
  { icon: Award, value: "5+ Years", label: "Experience" },
  { icon: Droplets, value: "500+", label: "Treatments Delivered" },
  { icon: Star, value: "4.9\u2605", label: "Client Rating" },
];

export default function TrustBar() {
  return (
    <section className="border-b bg-white py-8 shadow-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <Icon className="mb-2 h-8 w-8 text-primary" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
