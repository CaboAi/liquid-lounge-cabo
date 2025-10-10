import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Phone, MapPin, Clock, MessageCircle, Instagram, Facebook, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
const bookingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phoneNumber: z.string().trim().min(1, "Phone number is required").max(50, "Phone number must be less than 50 characters"),
  preferredTherapy: z.string().min(1, "Please select a therapy"),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  serviceLocation: z.string().trim().min(1, "Service location is required").max(500, "Location must be less than 500 characters"),
  additionalInfo: z.string().max(1000, "Additional info must be less than 1000 characters").optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      preferredTherapy: "",
      preferredDate: "",
      preferredTime: "",
      serviceLocation: "",
      additionalInfo: "",
    },
  });

  const handleWhatsAppBooking = () => {
    const values = form.getValues();
    const whatsappMessage = `Hi Nurse Nate,

I'd like to book an IV therapy session:

Name: ${values.firstName} ${values.lastName}
Email: ${values.email}
Phone: ${values.phoneNumber}
Service: ${values.preferredTherapy}
Preferred Date: ${values.preferredDate || 'Not specified'}
Preferred Time: ${values.preferredTime || 'Not specified'}
Location: ${values.serviceLocation}
Additional Info: ${values.additionalInfo || 'None'}

Thank you!`;
    const whatsappURL = `https://wa.me/526242287777?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappURL, '_blank');
  };

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Insert into database
      const { error: dbError } = await supabase.from('booking_submissions').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phoneNumber,
        preferred_therapy: data.preferredTherapy,
        preferred_date: data.preferredDate || null,
        preferred_time: data.preferredTime || null,
        service_location: data.serviceLocation,
        additional_info: data.additionalInfo || null,
      });

      if (dbError) throw dbError;

      // Step 2: Call edge function to send notification
      const { error: functionError } = await supabase.functions.invoke('send-booking-notification', {
        body: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone_number: data.phoneNumber,
          preferred_therapy: data.preferredTherapy,
          preferred_date: data.preferredDate || 'Not specified',
          preferred_time: data.preferredTime || 'Not specified',
          service_location: data.serviceLocation,
          additional_info: data.additionalInfo || 'None',
        },
      });

      if (functionError) {
        console.error('Error calling edge function:', functionError);
        // Don't throw - the booking was saved, notification failure is non-critical
      }

      // Step 3: Show success message
      toast({
        title: "Booking request received!",
        description: "We'll contact you within 24 hours via phone or email.",
      });

      // Step 4: Reset form
      form.reset();
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly at +52 624 228 7777",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const contactInfo = [{
    icon: <Mail className="h-6 w-6" />,
    title: "Email",
    details: "liquidloungeiv@gmail.com",
    description: "Send us a message anytime",
    isEmail: true
  }, {
    icon: <Phone className="h-6 w-6" />,
    title: "Phone",
    details: "+52 624 228 7777",
    description: "Call or WhatsApp for immediate response",
    isPhone: true
  }, {
    icon: <MapPin className="h-6 w-6" />,
    title: "Service Area",
    details: "Los Cabos, Mexico",
    description: "Mobile service to your location"
  }, {
    icon: <Clock className="h-6 w-6" />,
    title: "Hours",
    details: "7 Days a Week",
    description: "Flexible scheduling available"
  }, {
    icon: <Instagram className="h-6 w-6" />,
    title: "Instagram",
    details: "@liquidlounge.iv",
    description: "Follow for updates and tips"
  }, {
    icon: <Facebook className="h-6 w-6" />,
    title: "Facebook",
    details: "@liquidlounge.iv",
    description: "Follow us on Facebook"
  }];
  const services = ["Re-Hydration", "Post-Workout", "Immunity Myers", "The \"Cure\"", "NAD+", "Custom Blend", "Consultation Only"];
  return <section id="contact" className="py-20 bg-gradient-to-br from-wellness-cream/30 to-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Book Your IV Therapy Session
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to experience premium mobile IV therapy in Cabo San Lucas? 
            Contact Nathan Brown BSN RN to schedule your personalized treatment.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center lg:text-left mb-8">
                <h3 className="text-2xl font-bold mb-4">Get in Touch</h3>
                <p className="text-muted-foreground">We are excited to help improve your health and wellness journey.</p>
              </div>

              {contactInfo.map((info, index) => <Card key={index} className="border-primary/20 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-full text-primary">
                        {info.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{info.title}</h4>
                        {info.title === "Instagram" ? <a href="https://www.instagram.com/liquidlounge.iv/" target="_blank" rel="noopener noreferrer" className="font-medium text-primary mb-1 hover:underline">
                            {info.details}
                          </a> : info.title === "Facebook" ? <a href="https://www.facebook.com/share/1PBaJhWUMn/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="font-medium text-primary mb-1 hover:underline">
                            {info.details}
                          </a> : info.isPhone ? <a href="https://wa.me/526242287777?text=Hi%20Nurse%20Nate,%20I%27d%20like%20to%20book%20an%20IV%20therapy%20session" target="_blank" rel="noopener noreferrer" className="font-medium text-primary mb-1 hover:underline">
                            {info.details}
                          </a> : info.isEmail ? <a href="mailto:liquidloungeiv@gmail.com" className="font-medium text-primary mb-1 hover:underline">
                            {info.details}
                          </a> : <p className="font-medium text-primary mb-1">{info.details}</p>}
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>)}

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
                  <CardDescription>Please fill out the form below with as much detail as possible to speed up your booking process:</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="WhatsApp preferred" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="preferredTherapy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred IV Therapy *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your preferred therapy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {services.map((service, index) => (
                                  <SelectItem key={index} value={service}>
                                    {service}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="preferredDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="preferredTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preferred Time</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</SelectItem>
                                  <SelectItem value="Afternoon (12PM - 5PM)">Afternoon (12PM - 5PM)</SelectItem>
                                  <SelectItem value="Evening (5PM - 8PM)">Evening (5PM - 8PM)</SelectItem>
                                  <SelectItem value="Flexible">Flexible</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="serviceLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Location *</FormLabel>
                            <FormControl>
                              <Input placeholder="Hotel name, address, or area in Los Cabos" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any medical conditions, specific goals, or special requests..." 
                                rows={4} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              className="w-full h-auto py-4 flex flex-col items-center gap-2"
                              onClick={() => {
                                form.trigger().then((isValid) => {
                                  if (isValid) {
                                    handleWhatsAppBooking();
                                  }
                                });
                              }}
                            >
                              <div className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5" />
                                <span className="font-semibold">Quick WhatsApp Contact</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Have WhatsApp? Get instant response
                              </span>
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Button
                              type="submit"
                              size="lg"
                              className="w-full h-auto py-4 flex flex-col items-center gap-2"
                              disabled={isSubmitting}
                            >
                              <div className="flex items-center gap-2">
                                <Send className="h-5 w-5" />
                                <span className="font-semibold">
                                  {isSubmitting ? "Submitting..." : "Submit Booking Request"}
                                </span>
                              </div>
                              <span className="text-xs opacity-90">
                                We'll confirm within 24 hours
                              </span>
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground text-center mt-4">
                          By submitting this form, you agree to receive communication from Liquid Lounge regarding your booking.
                        </p>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;