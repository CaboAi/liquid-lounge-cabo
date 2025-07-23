import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Heart, MapPin, Shield, Award, Users } from "lucide-react";

const About = () => {
  const credentials = [
    { icon: <GraduationCap className="h-5 w-5" />, text: "Bachelor of Science in Nursing" },
    { icon: <Shield className="h-5 w-5" />, text: "Registered Nurse (RN)" },
    { icon: <Award className="h-5 w-5" />, text: "IV Therapy Certified" },
    { icon: <Heart className="h-5 w-5" />, text: "Advanced Cardiac Life Support" },
  ];

  const experience = [
    { number: "10+", label: "Years Experience" },
    { number: "1000+", label: "Treatments Given" },
    { number: "100%", label: "Safety Record" },
    { number: "24/7", label: "Mobile Service" },
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
              Professional, experienced, and dedicated to your wellness journey in beautiful Cabo San Lucas.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Professional Info */}
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-4">Nathan Brown BS RN</h3>
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

            {/* Right Column - Service Info */}
            <div>
              <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-0">
                  <h4 className="text-xl font-bold mb-6 text-center">Why Choose Liquid Lounge?</h4>
                  
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">Licensed & Insured</h5>
                        <p className="text-sm text-muted-foreground">
                          Fully licensed RN with comprehensive insurance coverage for your peace of mind.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Heart className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">Personalized Care</h5>
                        <p className="text-sm text-muted-foreground">
                          Every treatment is customized based on your health history and wellness goals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">Mobile Convenience</h5>
                        <p className="text-sm text-muted-foreground">
                          Professional IV therapy at your hotel, villa, or preferred location in Cabo.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-semibold mb-1">Premium Experience</h5>
                        <p className="text-sm text-muted-foreground">
                          Hospital-grade equipment and pharmaceutical-grade ingredients for optimal results.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Badge variant="secondary" className="mb-4">
                      Contact Information
                    </Badge>
                    <div className="text-sm text-muted-foreground mb-4">
                      <div>Email: liquidloungeiv@gmail.com</div>
                    </div>
                    <Button variant="medical" onClick={() => scrollToSection('contact')}>
                      Schedule Consultation
                    </Button>
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

export default About;