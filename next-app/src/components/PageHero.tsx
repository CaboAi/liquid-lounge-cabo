type PageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

/**
 * Shared inner-page hero — the Cabo-luxury teal header used across every
 * non-home page. Mirrors the homepage hero's gold-tick eyebrow, serif display
 * title, aurora glow, and grain texture.
 */
export default function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="section-teal aurora">
      <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.05]" />
      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <p className="eyebrow justify-center text-[hsl(43_74%_72%)]">{eyebrow}</p>
        <h1 className="mt-5 text-4xl font-medium text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
