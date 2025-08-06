import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, MapPin, Shield, Award, Users } from "lucide-react";

const About = () => {
  const credentials = [
    { icon: <GraduationCap className="h-5 w-5" />, text: "Bachelor of Science in Nursing" },
    { icon: <Shield className="h-5 w-5" />, text: "Registered Nurse (RN)" },
    { icon: <Award className="h-5 w-5" />, text: "IV Therapy Certified" },
    
  ];

  const experience = [
    { number: "10+", label: "Years Experience" },
    { number: "1000+", label: "Treatments Given" },
    { number: "100%", label: "Safety Record" },
    { number: "7 Days a Week", label: "Mobile Service" },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="about" className="py-20 bg-gradient-to-br from-wellness-cream/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Your IV Therapy Specialist
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cabo's Best Mobile IV Therapy - Private, Professional, Premium.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Professional Info */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Nathan Brown BSN RN</h3>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-muted-foreground">From Kelowna, Canada • Now serving Cabo San Lucas</span>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  As a registered nurse with over a decade of experience, I bring hospital-grade IV therapy 
                  directly to you. After years of working in acute care settings across Canada, I've combined 
                  my passion for wellness and the beautiful lifestyle of Cabo San Lucas to offer premium 
                  mobile IV therapy services.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  My approach focuses on personalized care, ensuring each treatment is tailored to your 
                  specific needs. Whether you're recovering from a night out, boosting your immune system, 
                  or optimizing your wellness routine, I provide professional, safe, and effective IV therapy 
                  in the comfort of your chosen location.
                </p>
              </div>

              {/* Credentials */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold mb-4">Professional Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {credentials.map((credential, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                      <div className="text-primary">{credential.icon}</div>
                      <span className="text-sm font-medium">{credential.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {experience.map((stat, index) => (
                  <div key={index} className="text-center p-4 bg-background border border-primary/20 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Photo Placeholder */}
            <div>
              {/* Professional photo */}
              <div className="mb-8">
                <img 
                  src="/lovable-uploads/0bde89f6-98e2-4f0f-9af3-343a9e8ab0c2.png" 
                  alt="Nathan Brown BSN RN - Mobile IV Therapy Specialist"
                  className="w-full max-w-md mx-auto rounded-lg shadow-lg"
                  onError={(e) => {
                    console.warn('Failed to load Nathan\'s professional photo');
                  }}
                />
              </div>

              <div className="text-center">
                <Badge variant="secondary" className="mb-4">
                  Contact Information
                </Badge>
                <div className="text-sm text-muted-foreground mb-4 space-y-1">
                  <div>
                    Email: <a href="mailto:liquidloungeiv@gmail.com" className="text-primary hover:underline">liquidloungeiv@gmail.com</a>
                  </div>
                  <div>
                    Phone: <a 
                      href="https://wa.me/526242287777?text=Hi%20Nurse%20Nate,%20I%27d%20like%20to%20book%20an%20IV%20therapy%20session"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      +52 624 228 7777
                    </a>
                  </div>
                </div>
                <Button 
                  variant="medical" 
                  onClick={() => window.open('https://wa.me/526242287777?text=Hi%20Nurse%20Nate,%20I%27d%20like%20to%20schedule%20a%20consultation%20for%20IV%20therapy', '_blank')}
                >
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;