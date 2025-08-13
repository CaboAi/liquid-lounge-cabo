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
      <section id="reviews" className="relative scroll-mt-20">
        <ReviewsCarousel />
        <div className="hidden md:block pointer-events-none absolute right-8 -bottom-20">
          <img 
            src="/images/GroupshotLL.jpg" 
            alt="Liquid Lounge team group photo" 
            loading="lazy" 
            className="w-[520px] h-[340px] rounded-2xl shadow-xl ring-1 ring-black/5 object-cover" 
          />
        </div>
      </section>
      <section id="specialist" className="scroll-mt-20 pt-0 md:pt-28">
        <About />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
