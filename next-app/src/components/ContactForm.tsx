"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Shield,
  Clock,
  MapPin,
  Star,
  Phone,
  CheckCircle,
} from "lucide-react";
import {
  contactInfo,
  therapyOptions,
  timeOptions,
  locationOptions,
} from "@/lib/data";

const bookingSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email required"),
  phone_number: z.string().min(7, "Phone number is required"),
  preferred_therapy: z.string().min(1, "Please select a therapy"),
  preferred_date: z.string().min(1, "Please select a date"),
  preferred_time: z.string().min(1, "Please select a time"),
  service_location: z.string().min(1, "Please select a location type"),
  additional_info: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<BookingForm | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      phone_number: "+52 ",
    },
  });

  const onSubmit = async (data: BookingForm) => {
    try {
      // Insert into Supabase
      const { error: insertError } = await supabase
        .from("booking_submissions")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          preferred_therapy: data.preferred_therapy,
          preferred_date: data.preferred_date,
          preferred_time: data.preferred_time,
          service_location: data.service_location,
          additional_info: data.additional_info || null,
        });

      if (insertError) throw insertError;

      // Trigger SMS notification via edge function
      await supabase.functions.invoke("send-booking-notification", {
        body: {
          firstName: data.first_name,
          lastName: data.last_name,
          phone: data.phone_number,
          therapy: data.preferred_therapy,
          date: data.preferred_date,
          time: data.preferred_time,
          location: data.service_location,
        },
      });

      // Fire GA4 conversion event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "booking_submission", {
          event_category: "engagement",
          event_label: data.preferred_therapy,
          value: 1,
        });
      }

      setSubmittedData(data);
      setSubmitted(true);
      toast.success("Booking submitted! Our team will confirm within 1 hour.");
      reset();
    } catch (err) {
      console.error("Booking submission error:", err);
      toast.error("Something went wrong. Please try again or message us on WhatsApp.");
    }
  };

  if (submitted && submittedData) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-card">
        <CheckCircle className="mx-auto h-12 w-12 text-[hsl(152_60%_40%)]" />
        <h2 className="mt-4 text-2xl font-heading font-semibold">
          Booking Request Submitted!
        </h2>
        <p className="mt-3 text-muted-foreground">
          Thanks, {submittedData.first_name}! Our team will confirm your{" "}
          {submittedData.preferred_therapy} session within 1 hour.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check your phone for an SMS confirmation at {submittedData.phone_number}.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="default" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <a
              href={contactInfo.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="mr-2 h-4 w-4" />
              Message Us on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-12 lg:grid-cols-5">
      {/* Form */}
      <div className="lg:col-span-3">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl bg-white p-6 shadow-card md:p-8"
        >
          {/* Name Row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                {...register("first_name")}
                className="mt-1.5"
                placeholder="First name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                {...register("last_name")}
                className="mt-1.5"
                placeholder="Last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="mt-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1.5"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mt-4">
            <Label htmlFor="phone_number">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone_number"
              type="tel"
              {...register("phone_number")}
              className="mt-1.5"
              placeholder="+52 624 XXX XXXX"
            />
            {errors.phone_number && (
              <p className="mt-1 text-sm text-destructive">{errors.phone_number.message}</p>
            )}
          </div>

          {/* Therapy */}
          <div className="mt-4">
            <Label>
              Preferred Therapy <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("preferred_therapy", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select an IV treatment" />
              </SelectTrigger>
              <SelectContent>
                {therapyOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferred_therapy && (
              <p className="mt-1 text-sm text-destructive">{errors.preferred_therapy.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="mt-4">
            <Label htmlFor="preferred_date">
              Preferred Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="preferred_date"
              type="date"
              {...register("preferred_date")}
              className="mt-1.5"
            />
            {errors.preferred_date && (
              <p className="mt-1 text-sm text-destructive">{errors.preferred_date.message}</p>
            )}
          </div>

          {/* Time */}
          <div className="mt-4">
            <Label>
              Preferred Time <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("preferred_time", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select a time window" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.preferred_time && (
              <p className="mt-1 text-sm text-destructive">{errors.preferred_time.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="mt-4">
            <Label>
              Service Location <span className="text-destructive">*</span>
            </Label>
            <Select onValueChange={(v) => setValue("service_location", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Where should we come?" />
              </SelectTrigger>
              <SelectContent>
                {locationOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.service_location && (
              <p className="mt-1 text-sm text-destructive">{errors.service_location.message}</p>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-4">
            <Label htmlFor="additional_info">Additional Information</Label>
            <Textarea
              id="additional_info"
              {...register("additional_info")}
              className="mt-1.5"
              placeholder="Hotel name, room number, special requests, health considerations..."
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="medical"
            size="lg"
            className="mt-6 w-full h-14 text-base"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Book My IV Session"}
          </Button>
        </form>
      </div>

      {/* Trust Panel */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl bg-[hsl(43_36%_95%)] p-6">
            <div className="space-y-4">
              {[
                {
                  icon: Shield,
                  title: "Licensed Professional",
                  desc: "BSN RN — Board Certified Registered Nurse",
                },
                {
                  icon: Clock,
                  title: "Fast Response",
                  desc: "We confirm within 1 hour of booking",
                },
                {
                  icon: MapPin,
                  title: "We Come to You",
                  desc: "Hotels, villas, yachts — all Los Cabos",
                },
                {
                  icon: Star,
                  title: "4.9 Star Rating",
                  desc: "500+ treatments delivered",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-xl bg-white p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Contact alternatives */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-semibold">Prefer to message directly?</p>
              <div className="flex flex-col gap-2">
                <a
                  href={contactInfo.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <Phone className="h-4 w-4" />
                  Message Us on WhatsApp
                </a>
                <a
                  href={contactInfo.phoneHref}
                  className="flex items-center gap-2 rounded-xl border-2 border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <Phone className="h-4 w-4" />
                  Call {contactInfo.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
