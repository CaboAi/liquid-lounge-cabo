'use client'

import Header from "@/components/Header";
import ClassCard from "@/components/ClassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClasses, useBookClass } from "@/hooks/useClasses";
import { Search, Filter, Calendar } from "lucide-react";
import { useState } from "react";

export default function ClassesPage() {
  const { data: classes, isLoading, error } = useClasses();
  const bookClass = useBookClass();
  const [searchTerm, setSearchTerm] = useState("");

  const handleBookClass = (classId: string) => {
    bookClass.mutate({ classId });
  };

  const filteredClasses = classes?.filter((c: any) => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.studio?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Available Classes</h1>
          
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search classes or studios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p>Loading classes...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">Error loading classes. Please try again.</p>
          </div>
        )}

        {!isLoading && !error && filteredClasses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No classes available at the moment.</p>
          </div>
        )}

        {filteredClasses.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((classItem: any) => (
              <ClassCard
                key={classItem.id}
                classData={classItem}
                onBook={() => handleBookClass(classItem.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
