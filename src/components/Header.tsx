import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, Mail } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/502c30b6-f5cc-4000-afda-21649d723089.png" 
              alt="Liquid Lounge Logo" 
              className="h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary">LIQUID LOUNGE</h1>
              <p className="text-xs text-muted-foreground">MOBILE IV THERAPY</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-foreground hover:text-primary transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('services')} className="text-foreground hover:text-primary transition-colors">
              Services
            </button>
            <button onClick={() => scrollToSection('menu')} className="text-foreground hover:text-primary transition-colors">
              IV Menu
            </button>
            <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-primary transition-colors">
              About
            </button>
            <button onClick={() => scrollToSection('blog')} className="text-foreground hover:text-primary transition-colors">
              Blog
            </button>
            <button onClick={() => scrollToSection('quiz')} className="text-foreground hover:text-primary transition-colors">
              Find Your IV
            </button>
          </nav>

          {/* Contact Info & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>Contact for booking</span>
            </div>
            <Button variant="medical" onClick={() => scrollToSection('contact')}>
              Book Now
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-3">
              <button onClick={() => scrollToSection('home')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Home
              </button>
              <button onClick={() => scrollToSection('services')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('menu')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                IV Menu
              </button>
              <button onClick={() => scrollToSection('about')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('blog')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Blog
              </button>
              <button onClick={() => scrollToSection('quiz')} className="text-left py-2 text-foreground hover:text-primary transition-colors">
                Find Your IV
              </button>
              <Button variant="medical" className="mt-4" onClick={() => scrollToSection('contact')}>
                Book Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;