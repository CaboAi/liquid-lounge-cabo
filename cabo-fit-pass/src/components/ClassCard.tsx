'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, Calendar } from "lucide-react";

interface ClassCardProps {
  classData: any;
  onBook: () => void;
}

const ClassCard = ({ classData, onBook }: ClassCardProps) => {
  if (!classData) {
    return null;
  }

  // Safely access nested properties with optional chaining
  const studioName = classData.studio?.name || classData.studio_name || "Studio";
  const studioLogo = classData.studio?.logo_url || classData.studio_logo_url || null;
  const availableSpots = classData.available_spots || classData.max_capacity || 0;
  const className = classData.name || "Class";
  const duration = classData.duration || 60;
  const time = classData.time || classData.start_time || "";
  const credits = classData.credits_required || classData.credits || 1;
  const instructor = classData.instructor || classData.instructor_name || "";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{className}</CardTitle>
            <CardDescription>{studioName}</CardDescription>
          </div>
          {studioLogo && (
            <img 
              src={studioLogo} 
              alt={studioName}
              className="w-12 h-12 rounded object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {instructor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{instructor}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration} minutes</span>
          </div>
          
          {time && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{time}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{availableSpots} spots available</span>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary">
            {credits} {credits === 1 ? 'credit' : 'credits'}
          </Badge>
          {classData.difficulty && (
            <Badge variant="outline">
              {classData.difficulty}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onBook}
          disabled={availableSpots === 0}
        >
          {availableSpots === 0 ? 'Class Full' : 'Book Class'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClassCard;
