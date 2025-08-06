import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplet, Shield, Clock, MapPin } from "lucide-react";

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-medical-teal-light/20 to-wellness-cream/30">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                  Premium Mobile IV Therapy
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                  Liquid Lounge
                  <span className="block text-primary">Mobile IV Therapy</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  Cabo's Best Mobile IV Therapy - Private, Professional, Premium.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  variant="medical" 
                  size="lg" 
                  onClick={() => scrollToSection('contact')}
                  className="px-8 py-4 text-lg"
                >
                  Book Your Session
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={() => scrollToSection('menu')}
                  className="px-8 py-4 text-lg"
                >
                  View IV Menu
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">RN</span>
                  <span className="text-sm text-muted-foreground">Licensed</span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">30min</span>
                  <span className="text-sm text-muted-foreground">Sessions</span>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">Mobile</span>
                  <span className="text-sm text-muted-foreground">Service</span>
                </div>
                <div className="flex flex-col items-center">
                  <Droplet className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold text-foreground">Premium</span>
                  <span className="text-sm text-muted-foreground">Therapy</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <Card className="p-8 bg-gradient-to-br from-background to-wellness-cream/50 shadow-xl border-primary/20">
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <img 
                      src="/lovable-uploads/afba4d72-c696-44c4-99af-93f2db3c9f17.png" 
                      alt="Liquid Lounge Logo" 
                      className="mx-auto h-32 w-auto mb-4"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Hydration Therapy</span>
                      <Droplet className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Vitamin Infusions</span>
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">NAD+ Therapy</span>
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                      <span className="font-medium">Custom Blends</span>
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;