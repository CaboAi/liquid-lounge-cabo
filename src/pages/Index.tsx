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
      <section id="specialist" className="scroll-mt-20">
        <About />
      </section>
      <Footer />
    </div>
  );
};

export default Index;
