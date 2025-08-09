'use client'

import Header from "@/components/Header";
import ClassCard from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import { useClasses, useBookClass } from "@/hooks/useClasses";
import { Search, Filter, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

const Index = () => {
  const { data: classes, isLoading, error } = useClasses();
  const bookClass = useBookClass();

  const handleBookClass = (classId: string) => {
    bookClass.mutate({ classId });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            One Pass. Unlimited Possibilities.
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access the best fitness studios in Los Cabos with a single membership
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">Start Free Trial</Button>
            </Link>
            <Link href="/classes">
              <Button size="lg" variant="outline">Browse Classes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Classes Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8">Popular Classes</h2>
          {isLoading && <p>Loading classes...</p>}
          {error && <p>Error loading classes</p>}
          {classes && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.slice(0, 6).map((classItem) => (
                <ClassCard
                  key={classItem.id}
                  classData={classItem}
                  onBook={() => handleBookClass(classItem.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
