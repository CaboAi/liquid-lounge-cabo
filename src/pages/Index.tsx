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
      <section aria-label="Team photo" className="pt-10 pb-4 md:py-14">
        <div className="mx-auto w-full max-w-5xl px-4">
          <img 
            src="/images/GroupshotLL.jpg" 
            alt="Liquid Lounge team" 
            loading="lazy" 
            className="w-full h-auto rounded-2xl shadow-xl object-cover aspect-[16/9]" 
          />
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
