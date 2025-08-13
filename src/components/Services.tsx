import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, Users, Stethoscope, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Services = () => {
  const navigate = useNavigate();
  const services = [{
    icon: <TestTube className="h-8 w-8 text-primary" />,
    title: "Blood Work Diagnostics",
    description: "Comprehensive lab testing and health assessments",
    link: "/contact?topic=blood-work"
  }, {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "IV Therapies, 1 on 1, Groups and Events",
    description: "Personalized and group IV therapy sessions",
    link: "/iv-menu"
  }, {
    icon: <Stethoscope className="h-8 w-8 text-primary" />,
    title: "Consults for Health",
    description: "Professional health consultations and guidance",
    link: "/contact?topic=consultation"
  }];
  const handleServiceClick = (link: string) => {
    if (link.startsWith('/')) {
      navigate(link);
    } else {
      window.open(link, '_blank');
    }
  };
  return <section id="services" className="py-20 bg-gradient-to-br from-background to-wellness-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Services</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Professional mobile therapy services delivered in Cabo.</p>
        </div>

        {/* Desktop: 3-column grid, Tablet: 2-column, Mobile: 1-column */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/20 cursor-pointer p-4 md:p-6" onClick={() => handleServiceClick(service.link)}>
              <CardHeader className="pb-3 px-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      {service.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </CardTitle>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="px-0 pt-0">
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>)}
        </div>
      </div>
    </section>;
};
export default Services;