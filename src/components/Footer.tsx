import { Mail, MapPin, Shield, Heart, Instagram, Star, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/502c30b6-f5cc-4000-afda-21649d723089.png" 
                alt="Liquid Lounge Logo" 
                className="h-12 w-auto"
              />
              <div>
                <h3 className="text-xl font-bold">LIQUID LOUNGE</h3>
                <p className="text-sm opacity-80">MOBILE IV THERAPY</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Cabo's Best Mobile IV Therapy - Private, Professional, Premium.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Licensed RN</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>Professional Care</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-3">
              <button 
                onClick={() => scrollToSection('home')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Services
              </button>
              <button 
                onClick={() => scrollToSection('menu')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                IV Menu
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                About Nathan
              </button>
              <button 
                onClick={() => scrollToSection('blog')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Blog
              </button>
              <button 
                onClick={() => scrollToSection('quiz')} 
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Find Your IV
              </button>
            </nav>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href="mailto:liquidloungeiv@gmail.com"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    liquidloungeiv@gmail.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Service Area</p>
                  <p className="text-sm text-primary-foreground/80">Cabo San Lucas, Mexico</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Instagram className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Follow Us</p>
                  <a 
                    href="https://www.instagram.com/liquidlounge.iv/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    @liquidlounge.iv
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Google Reviews</p>
                  <a 
                    href="https://maps.app.goo.gl/JszkUHYBxfJh3pYN9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Read Our Reviews
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Facebook className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Facebook</p>
                  <a 
                    href="https://www.facebook.com/share/1PBaJhWUMn/?mibextid=wwXIfr" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    @liquidlounge.iv
                  </a>
                </div>
              </div>
            </div>
            
            <Button 
              variant="secondary" 
              className="mt-6 w-full"
              onClick={() => scrollToSection('contact')}
            >
              Book Now
            </Button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-primary-foreground/80">
              <p>&copy; 2024 Liquid Lounge Mobile IV Therapy. All rights reserved.</p>
              <p className="mt-1">Licensed and operated by Nathan Brown BSN RN</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-primary-foreground/80">
              <button className="hover:text-primary-foreground transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-primary-foreground transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-primary-foreground transition-colors">
                Medical Disclaimer
              </button>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-6 border-t border-primary-foreground/20">
            <p className="text-xs text-primary-foreground/60">
              This website and services are not intended to diagnose, treat, cure, or prevent any disease. 
              Always consult with a healthcare professional before starting any new treatment.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;