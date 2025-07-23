import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, Instagram } from "lucide-react";

const Contact = () => {
  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email",
      details: "nate@liquidloungeiv.com",
      description: "Send us a message anytime"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone", 
      details: "+52 624 228 7777",
      description: "Call or WhatsApp for immediate response"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Service Area",
      details: "Cabo San Lucas, Mexico",
      description: "Mobile service to your location"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hours",
      details: "7 Days a Week",
      description: "Flexible scheduling available"
    },
    {
      icon: <Instagram className="h-6 w-6" />,
      title: "Instagram",
      details: "@liquidlounge.iv",
      description: "Follow for updates and tips"
    }
  ];

  const services = [
    "Hydration Hero",
    "Energy Boost", 
    "Immunity Shield",
    "Beauty Glow",
    "Performance Plus",
    "NAD+ Longevity",
    "Custom Blend",
    "Consultation Only"
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-wellness-cream/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Book Your IV Therapy Session
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to experience premium mobile IV therapy in Cabo San Lucas? 
            Contact Nathan Brown BS RN to schedule your personalized treatment.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
                <p className="text-muted-foreground">
                  Professional IV therapy services delivered directly to your location in Cabo San Lucas.
                </p>
              </div>

              {contactInfo.map((info, index) => (
                <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                        {info.title === "Instagram" ? (
                          <a 
                            href="https://www.instagram.com/liquidlounge.iv/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary mb-1 hover:underline"
                          >
                            {info.details}
                          </a>
                        ) : (
                          <p className="font-medium text-primary mb-1">{info.details}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Quick Info */}
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Quick Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Most booking requests are responded to within 2 hours. 
                    For urgent requests, please include your phone number for faster communication.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Book Your Session</CardTitle>
                  <CardDescription>
                    Fill out the form below and Nathan will contact you to confirm your appointment details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Enter your first name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Enter your last name" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="Enter your email" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="WhatsApp preferred" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="service">Preferred IV Therapy *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your preferred therapy" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service, index) => (
                          <SelectItem key={index} value={service.toLowerCase().replace(/\s+/g, '-')}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Preferred Date</Label>
                      <Input id="date" type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Preferred Time</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                          <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                          <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                          <SelectItem value="flexible">Flexible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Service Location *</Label>
                    <Input id="location" placeholder="Hotel name, address, or area in Cabo San Lucas" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Any medical conditions, specific goals, or special requests..."
                      rows={4}
                    />
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="bg-primary/5 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold mb-2">Important Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Medical consultation included with every session</li>
                        <li>• All treatments performed by licensed RN Nathan Brown</li>
                        <li>• Cancellation policy: 24-hour notice required</li>
                        <li>• Payment accepted: Cash, card, or digital transfer</li>
                      </ul>
                    </div>

                    <Button variant="medical" size="lg" className="w-full">
                      Submit Booking Request
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      By submitting this form, you agree to receive communication from Liquid Lounge regarding your booking.
                    </p>
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

export default Contact;