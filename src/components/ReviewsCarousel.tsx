import { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ReviewCard } from './ReviewCard';
import { Star } from 'lucide-react';
interface ReviewData {
  rating: number;
  text: string;
  author: string;
  date: string;
  verified?: boolean;
}

// Mock reviews for demonstration - replace with actual scraped data
const mockReviews: ReviewData[] = [{
  rating: 5,
  text: "Nathan provided exceptional IV therapy service right at our resort. Professional, knowledgeable, and the results were immediate. Highly recommend for anyone in Cabo!",
  author: "Sarah M.",
  date: "2024-01-15",
  verified: true
}, {
  rating: 5,
  text: "Best hangover cure ever! Nathan was punctual, professional, and made the whole experience comfortable. Will definitely use again on our next Cabo trip.",
  author: "Mike R.",
  date: "2024-01-10",
  verified: true
}, {
  rating: 5,
  text: "Amazing service! The hydration therapy helped me recover from food poisoning quickly. Nathan's expertise and care made all the difference.",
  author: "Jessica L.",
  date: "2024-01-08",
  verified: true
}, {
  rating: 5,
  text: "Professional and convenient. Nathan came to our villa and provided excellent IV therapy. Perfect for our vacation wellness needs.",
  author: "David K.",
  date: "2024-01-05",
  verified: true
}, {
  rating: 5,
  text: "Outstanding experience! Nathan is knowledgeable, friendly, and provides top-notch mobile IV therapy. Couldn't ask for better service in Cabo.",
  author: "Emma T.",
  date: "2024-01-03",
  verified: true
}];
export const ReviewsCarousel = () => {
  const [reviews] = useState<ReviewData[]>(mockReviews);
  console.log('ReviewsCarousel: reviews loaded', reviews.length, reviews);
  return <section className="py-16 bg-wellness-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Testimonials from satisfied clients.</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {Array.from({
              length: 5
            }).map((_, i) => <Star key={i} className="h-5 w-5 fill-wellness-gold text-wellness-gold" />)}
            </div>
            <span className="text-sm text-muted-foreground ml-2">
              Based on {reviews.length} reviews
            </span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <Carousel opts={{
          align: "start",
          loop: true
        }} className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {reviews.map((review, index) => <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <ReviewCard review={review} />
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="text-center mt-8">
          <a href="https://maps.app.goo.gl/JszkUHYBxfJh3pYN9" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
            <Star className="h-4 w-4" />
            Read all reviews on Google
          </a>
        </div>
      </div>
    </section>;
};