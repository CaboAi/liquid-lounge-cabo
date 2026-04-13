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
import { Card, CardContent } from "@/components/ui/card";

function ReviewCard({ review }: { review: (typeof reviews)[number] }) {
  return (
    <Card className="h-full border-none bg-white">
      <CardContent className="flex h-full flex-col p-6">
        {/* Stars */}
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: review.rating }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-[hsl(43_74%_66%)] text-[hsl(43_74%_66%)]"
            />
          ))}
        </div>

        {/* Quote */}
        <p className="flex-1 text-sm leading-relaxed text-foreground/80 italic">
          &ldquo;{review.text}&rdquo;
        </p>

        {/* Attribution */}
        <div className="mt-4 border-t pt-4">
          <p className="text-sm font-semibold text-foreground">{review.name}</p>
          <p className="text-xs text-muted-foreground">
            {review.context} &middot; {review.date}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReviewsCarousel() {
  return (
    <section className="section-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="overline mb-2">TESTIMONIALS</p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What Our Clients Say
          </h2>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          className="mx-auto w-full max-w-5xl"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review, i) => (
              <CarouselItem
                key={i}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
              >
                <ReviewCard review={review} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 lg:-left-12 border-primary text-primary" />
          <CarouselNext className="-right-4 lg:-right-12 border-primary text-primary" />
        </Carousel>
      </div>
    </section>
  );
}
