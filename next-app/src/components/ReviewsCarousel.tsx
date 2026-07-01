"use client";

import { reviews } from "@/lib/data";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Reveal from "@/components/Reveal";

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-border/60 bg-white p-8">
      {/* Stars */}
      <div className="mb-5 flex gap-1">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4 fill-[hsl(43_74%_66%)] text-[hsl(43_74%_66%)]"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="flex-1 font-heading text-xl leading-relaxed text-foreground/90">
        &ldquo;{review.text}&rdquo;
      </p>

      {/* Attribution */}
      <div className="mt-6 border-t border-border/60 pt-5">
        <p className="font-semibold text-foreground">{review.name}</p>
        <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
          {review.context} · {review.date}
        </p>
      </div>
    </div>
  );
}

export default function ReviewsCarousel() {
  return (
    <section className="section-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-16 text-center">
          <p className="eyebrow justify-center">Testimonials</p>
          <h2 className="mt-4 text-4xl font-medium sm:text-5xl">
            What our clients say
          </h2>
        </Reveal>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="mx-auto w-full max-w-5xl"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, i) => (
              <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 border-primary text-primary lg:-left-12" />
          <CarouselNext className="-right-4 border-primary text-primary lg:-right-12" />
        </Carousel>
      </div>
    </section>
  );
}
