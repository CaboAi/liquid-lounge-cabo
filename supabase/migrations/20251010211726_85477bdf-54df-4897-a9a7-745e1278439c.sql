-- Create booking_submissions table
CREATE TABLE public.booking_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  preferred_therapy TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  service_location TEXT NOT NULL,
  additional_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.booking_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert booking submissions
CREATE POLICY "Anyone can submit bookings"
ON public.booking_submissions
FOR INSERT
TO anon
WITH CHECK (true);