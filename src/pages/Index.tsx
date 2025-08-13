import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import About from "@/components/About";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Handle hash navigation when arriving from another page
    if (location.hash) {
      const sectionId = location.hash.substring(1);
      const element = document.getElementById(sectionId);
      if (element) {
        // Small delay to ensure page is fully loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <section id="services" className="scroll-mt-20">
        <Services />
      </section>
      <section id="reviews" className="scroll-mt-20">
        <ReviewsCarousel />
      </section>
      <section aria-label="Team photo" className="py-10 md:py-14">
        <div className="mx-auto w-full max-w-5xl px-4">
          <img 
            src="/images/GroupshotLL.jpg" 
            alt="Liquid Lounge team" 
            loading="lazy" 
            className="w-full h-auto rounded-2xl shadow-xl object-cover aspect-[16/9]" 
          />
        </div>
      </section>
      
      {/* Experience Stats Section */}
      <section className="py-10 md:py-14 bg-wellness-cream/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center p-4 bg-background border border-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">10+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center p-4 bg-background border border-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">Treatments Given</div>
              </div>
              <div className="text-center p-4 bg-background border border-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Safety Record</div>
              </div>
              <div className="text-center p-4 bg-background border border-primary/20 rounded-lg">
                <div className="text-2xl font-bold text-primary">7 Days a Week</div>
                <div className="text-sm text-muted-foreground">Mobile Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="specialist" className="scroll-mt-20 pt-0 md:pt-6">
        <About />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
