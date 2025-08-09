-- CaboFitPass Database Schema Setup
-- Run this in your Supabase SQL editor

-- 1. First, let's see what we have
-- Check existing tables (run this first to see current state)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

-- 2. Create user_credits table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER DEFAULT 0 CHECK (balance >= 0),
    total_purchased INTEGER DEFAULT 0,
    total_used INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create bookings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    credits_used INTEGER DEFAULT 1 CHECK (credits_used > 0),
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, class_id) -- Prevent duplicate bookings
);

-- 4. Update classes table schema (add missing columns if they don't exist)
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS instructor VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS credits_required INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS studio_id UUID,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Create studios/gyms table if needed
CREATE TABLE IF NOT EXISTS public.studios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Add foreign key constraint for studio_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'classes_studio_id_fkey'
    ) THEN
        ALTER TABLE public.classes 
        ADD CONSTRAINT classes_studio_id_fkey 
        FOREIGN KEY (studio_id) REFERENCES public.studios(id);
    END IF;
END $$;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON public.bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_classes_start_time ON public.classes(start_time);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies
-- Users can only see their own credits
CREATE POLICY IF NOT EXISTS "Users can view their own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own credits" ON public.user_credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can only see their own bookings
CREATE POLICY IF NOT EXISTS "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- 10. Insert sample data if tables are empty
INSERT INTO public.studios (id, name, description, address, phone, email)
SELECT 
    gen_random_uuid(),
    'Ocean View Fitness',
    'Premium fitness studio with stunning ocean views in Los Cabos',
    'Marina Boulevard, Los Cabos, Baja California Sur, Mexico',
    '+52 624 123 4567',
    'info@oceanviewfitness.com'
WHERE NOT EXISTS (SELECT 1 FROM public.studios);

-- Update existing classes to have proper data
UPDATE public.classes 
SET 
    instructor = COALESCE(instructor, 'Maria Rodriguez'),
    start_time = COALESCE(start_time, 
        CASE 
            WHEN schedule IS NOT NULL THEN schedule::timestamp
            ELSE (CURRENT_DATE + INTERVAL '1 day' + TIME '08:00:00')::timestamp
        END
    ),
    duration = COALESCE(duration, 60),
    credits_required = COALESCE(credits_required, CEIL(COALESCE(price, 10) / 10)),
    studio_id = COALESCE(studio_id, (SELECT id FROM public.studios LIMIT 1))
WHERE instructor IS NULL 
   OR start_time IS NULL 
   OR duration IS NULL 
   OR credits_required IS NULL
   OR studio_id IS NULL;

-- 11. Function to automatically create user credits when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, balance)
    VALUES (NEW.id, 5); -- Give 5 free credits to new users
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Trigger to create user credits on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13. Verification queries (run these to check everything worked)
-- SELECT 'classes' as table_name, count(*) as row_count FROM public.classes
-- UNION ALL
-- SELECT 'studios', count(*) FROM public.studios
-- UNION ALL  
-- SELECT 'user_credits', count(*) FROM public.user_credits
-- UNION ALL
-- SELECT 'bookings', count(*) FROM public.bookings;