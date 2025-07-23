import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Shield, Zap, Heart, Brain, Sparkles } from "lucide-react";

const Services = () => {
  const services = [
    {
      icon: <Droplet className="h-12 w-12 text-primary" />,
      title: "Hydration Therapy",
      description: "Essential fluid replacement for optimal cellular function and energy restoration.",
      features: ["IV Saline Solution", "Electrolyte Balance", "Rapid Absorption", "30-45 min sessions"]
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Vitamin Infusions", 
      description: "High-dose vitamin delivery for enhanced immunity and vitality.",
      features: ["Vitamin C Megadose", "B-Complex Blend", "Vitamin D3", "Mineral Support"]
    },
    {
      icon: <Brain className="h-12 w-12 text-primary" />,
      title: "NAD+ Therapy",
      description: "Anti-aging therapy for cellular repair, energy, and cognitive enhancement.",
      features: ["Cellular Regeneration", "Enhanced Energy", "Mental Clarity", "Longevity Support"]
    },
    {
      icon: <Sparkles className="h-12 w-12 text-primary" />,
      title: "Glutathione Boost",
      description: "Master antioxidant for detoxification and skin health.",
      features: ["Detox Support", "Skin Brightening", "Immune Enhancement", "Liver Protection"]
    },
    {
      icon: <Heart className="h-12 w-12 text-primary" />,
      title: "Performance Recovery",
      description: "Athlete-grade recovery with amino acids and recovery compounds.",
      features: ["L-Carnitine", "L-Lysine", "Muscle Recovery", "Performance Optimization"]
    },
    {
      icon: <Zap className="h-12 w-12 text-primary" />,
      title: "Custom Blends",
      description: "Personalized IV therapy tailored to your specific health goals.",
      features: ["Health Assessment", "Custom Formulation", "Targeted Results", "Professional Guidance"]
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-background to-wellness-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our IV Therapy Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional mobile IV therapy services delivered by Nathan Brown BS RN. 
            Each treatment is customized to your specific wellness needs and health goals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-background to-wellness-cream/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <div className="mb-6">
            <p className="text-lg text-muted-foreground mb-4">
              Not sure which therapy is right for you?
            </p>
            <Button 
              variant="medical" 
              size="lg" 
              onClick={() => scrollToSection('quiz')}
              className="mr-4"
            >
              Take Our IV Quiz
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('contact')}
            >
              Schedule Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;