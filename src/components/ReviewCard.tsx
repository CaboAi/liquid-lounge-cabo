import { Star, User } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

interface ReviewData {
  rating: number;
  text: string;
  author: string;
  date: string;
  verified?: boolean;
}

interface ReviewCardProps {
  review: ReviewData;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-wellness-gold text-wellness-gold'
            : 'text-muted-foreground/30'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-background to-wellness-cream/30 border-medical-teal-light/20 hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-medical-teal-light/20 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-medical-teal" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground truncate">
                {review.author}
              </h4>
              {review.verified && (
                <span className="text-xs bg-medical-teal text-white px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {renderStars(review.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDate(review.date)}
              </span>
            </div>
          </div>
        </div>
        
        <blockquote className="text-sm leading-relaxed text-foreground/80 italic">
          "{review.text}"
        </blockquote>
      </CardContent>
    </Card>
  );
};