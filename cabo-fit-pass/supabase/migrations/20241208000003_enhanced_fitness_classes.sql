-- =====================================================================================
-- ENHANCED FITNESS CLASSES WITH ADVANCED SCHEDULING
-- =====================================================================================
-- Migration: Enhanced class management with instructors, categories, and scheduling
-- Version: 20241208000003
-- Description: Enhances existing classes table and adds comprehensive class management

-- Enhance existing classes table
ALTER TABLE classes 
  ADD COLUMN IF NOT EXISTS instructor_id UUID REFERENCES gym_staff(id),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
  ADD COLUMN IF NOT EXISTS class_type VARCHAR(50) NOT NULL DEFAULT 'fitness',
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
  ADD COLUMN IF NOT EXISTS min_capacity INTEGER DEFAULT 1 CHECK (min_capacity > 0),
  ADD COLUMN IF NOT EXISTS current_bookings INTEGER NOT NULL DEFAULT 0 CHECK (current_bookings >= 0),
  ADD COLUMN IF NOT EXISTS waitlist_count INTEGER NOT NULL DEFAULT 0 CHECK (waitlist_count >= 0),
  ADD COLUMN IF NOT EXISTS credit_cost INTEGER NOT NULL DEFAULT 1 CHECK (credit_cost > 0),
  ADD COLUMN IF NOT EXISTS drop_in_price INTEGER, -- Price in cents for non-members
  ADD COLUMN IF NOT EXISTS early_booking_hours INTEGER DEFAULT 168 CHECK (early_booking_hours >= 0), -- How far in advance to allow booking (default 7 days)
  ADD COLUMN IF NOT EXISTS late_cancellation_hours INTEGER DEFAULT 24 CHECK (late_cancellation_hours >= 0), -- Cancellation policy
  ADD COLUMN IF NOT EXISTS class_status VARCHAR(20) DEFAULT 'scheduled' CHECK (class_status IN ('scheduled', 'cancelled', 'completed', 'in_progress')),
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS special_instructions TEXT,
  ADD COLUMN IF NOT EXISTS equipment_needed TEXT[],
  ADD COLUMN IF NOT EXISTS tags TEXT[], -- For filtering and search
  ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_pattern JSONB, -- For recurring class definitions
  ADD COLUMN IF NOT EXISTS room_location VARCHAR(100),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Rename schedule to starts_at for clarity and add ends_at
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'schedule') THEN
        ALTER TABLE classes RENAME COLUMN schedule TO starts_at;
    END IF;
END $$;

ALTER TABLE classes 
  ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Update ends_at based on starts_at and duration_minutes
UPDATE classes 
SET ends_at = starts_at + (duration_minutes || ' minutes')::INTERVAL
WHERE ends_at IS NULL AND starts_at IS NOT NULL AND duration_minutes IS NOT NULL;

-- Update capacity column to use max_capacity
UPDATE classes 
SET max_capacity = COALESCE(capacity, 20)
WHERE max_capacity = 20; -- Only update default values

-- Create class_categories table
CREATE TABLE IF NOT EXISTS class_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color_hex VARCHAR(7), -- Hex color for UI
    icon VARCHAR(50), -- Icon identifier
    parent_category_id UUID REFERENCES class_categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_class_categories_slug (slug),
    INDEX idx_class_categories_active (is_active),
    INDEX idx_class_categories_parent (parent_category_id)
);

-- Create class_category_assignments table (many-to-many)
CREATE TABLE IF NOT EXISTS class_category_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES class_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique assignments
    CONSTRAINT unique_class_category UNIQUE (class_id, category_id),
    
    -- Indexes
    INDEX idx_class_category_assignments_class (class_id),
    INDEX idx_class_category_assignments_category (category_id)
);

-- Create class_templates table for recurring classes
CREATE TABLE IF NOT EXISTS class_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES gym_staff(id),
    duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
    difficulty_level VARCHAR(20) DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')),
    class_type VARCHAR(50) NOT NULL DEFAULT 'fitness',
    max_capacity INTEGER NOT NULL DEFAULT 20 CHECK (max_capacity > 0),
    min_capacity INTEGER DEFAULT 1 CHECK (min_capacity > 0),
    credit_cost INTEGER NOT NULL DEFAULT 1 CHECK (credit_cost > 0),
    drop_in_price INTEGER,
    early_booking_hours INTEGER DEFAULT 168,
    late_cancellation_hours INTEGER DEFAULT 24,
    special_instructions TEXT,
    equipment_needed TEXT[],
    tags TEXT[],
    image_url VARCHAR(500),
    room_location VARCHAR(100),
    recurring_schedule JSONB NOT NULL, -- Schedule configuration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_class_templates_gym_id (gym_id),
    INDEX idx_class_templates_instructor (instructor_id),
    INDEX idx_class_templates_active (is_active),
    INDEX idx_class_templates_type (class_type)
);

-- Create class_waitlist table
CREATE TABLE IF NOT EXISTS class_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    position INTEGER NOT NULL CHECK (position > 0),
    auto_book BOOLEAN DEFAULT true, -- Automatically book when spot opens
    notification_sent BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ, -- When waitlist position expires
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique waitlist positions per class
    CONSTRAINT unique_class_waitlist_position UNIQUE (class_id, position),
    -- Ensure user can only be on waitlist once per class
    CONSTRAINT unique_user_class_waitlist UNIQUE (class_id, user_id),
    
    -- Indexes
    INDEX idx_class_waitlist_class_id (class_id),
    INDEX idx_class_waitlist_user_id (user_id),
    INDEX idx_class_waitlist_position (class_id, position),
    INDEX idx_class_waitlist_expires (expires_at)
);

-- Create class_check_ins table for attendance tracking
CREATE TABLE IF NOT EXISTS class_check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    check_in_method VARCHAR(20) DEFAULT 'manual' CHECK (check_in_method IN ('manual', 'qr_code', 'nfc', 'app')),
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_in_by UUID REFERENCES profiles(id), -- Staff member who checked in
    late_arrival BOOLEAN DEFAULT false,
    notes TEXT,
    
    -- Ensure unique check-in per class per user
    CONSTRAINT unique_user_class_checkin UNIQUE (class_id, user_id),
    
    -- Indexes
    INDEX idx_class_check_ins_class_id (class_id),
    INDEX idx_class_check_ins_user_id (user_id),
    INDEX idx_class_check_ins_booking (booking_id),
    INDEX idx_class_check_ins_date (checked_in_at)
);

-- Add indexes to enhanced classes table
CREATE INDEX IF NOT EXISTS idx_classes_gym_id ON classes(gym_id);
CREATE INDEX IF NOT EXISTS idx_classes_instructor ON classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_starts_at ON classes(starts_at);
CREATE INDEX IF NOT EXISTS idx_classes_ends_at ON classes(ends_at);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(class_status);
CREATE INDEX IF NOT EXISTS idx_classes_type ON classes(class_type);
CREATE INDEX IF NOT EXISTS idx_classes_difficulty ON classes(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_classes_recurring ON classes(is_recurring);
CREATE INDEX IF NOT EXISTS idx_classes_capacity ON classes(max_capacity, current_bookings);

-- Add constraint to ensure ends_at is after starts_at
ALTER TABLE classes 
ADD CONSTRAINT check_class_time_order 
CHECK (ends_at IS NULL OR starts_at IS NULL OR ends_at > starts_at);

-- Add constraint to ensure current_bookings doesn't exceed max_capacity
ALTER TABLE classes 
ADD CONSTRAINT check_booking_capacity 
CHECK (current_bookings <= max_capacity);

-- Add constraint to ensure min_capacity <= max_capacity
ALTER TABLE classes 
ADD CONSTRAINT check_capacity_order 
CHECK (min_capacity <= max_capacity);

-- Create updated_at triggers
CREATE TRIGGER update_classes_updated_at 
    BEFORE UPDATE ON classes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_templates_updated_at 
    BEFORE UPDATE ON class_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update class booking count when bookings change
CREATE OR REPLACE FUNCTION update_class_booking_count()
RETURNS TRIGGER AS $$
DECLARE
    class_uuid UUID;
    new_count INTEGER;
BEGIN
    -- Determine which class to update
    class_uuid := COALESCE(NEW.class_id, OLD.class_id);
    
    -- Count confirmed bookings for this class
    SELECT COUNT(*) INTO new_count
    FROM bookings 
    WHERE class_id = class_uuid 
    AND payment_status IN ('completed', 'confirmed');
    
    -- Update the class current_bookings count
    UPDATE classes 
    SET 
        current_bookings = new_count,
        updated_at = NOW()
    WHERE id = class_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update class booking count
DROP TRIGGER IF EXISTS update_class_booking_count_on_insert ON bookings;
CREATE TRIGGER update_class_booking_count_on_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_class_booking_count();

DROP TRIGGER IF EXISTS update_class_booking_count_on_update ON bookings;
CREATE TRIGGER update_class_booking_count_on_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    WHEN (OLD.payment_status IS DISTINCT FROM NEW.payment_status)
    EXECUTE FUNCTION update_class_booking_count();

DROP TRIGGER IF EXISTS update_class_booking_count_on_delete ON bookings;
CREATE TRIGGER update_class_booking_count_on_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_class_booking_count();

-- Function to manage waitlist positions
CREATE OR REPLACE FUNCTION manage_waitlist_positions()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Reorder positions when someone leaves the waitlist
        UPDATE class_waitlist 
        SET position = position - 1
        WHERE class_id = OLD.class_id 
        AND position > OLD.position;
        
        RETURN OLD;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        -- Set position to next available
        SELECT COALESCE(MAX(position), 0) + 1 
        INTO NEW.position
        FROM class_waitlist 
        WHERE class_id = NEW.class_id;
        
        -- Update waitlist count on class
        UPDATE classes 
        SET waitlist_count = waitlist_count + 1
        WHERE id = NEW.class_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for waitlist management
DROP TRIGGER IF EXISTS manage_waitlist_positions_insert ON class_waitlist;
CREATE TRIGGER manage_waitlist_positions_insert
    BEFORE INSERT ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION manage_waitlist_positions();

DROP TRIGGER IF EXISTS manage_waitlist_positions_delete ON class_waitlist;
CREATE TRIGGER manage_waitlist_positions_delete
    AFTER DELETE ON class_waitlist
    FOR EACH ROW
    EXECUTE FUNCTION manage_waitlist_positions();

-- Insert default class categories
INSERT INTO class_categories (name, slug, description, color_hex, icon, display_order) VALUES
('Strength Training', 'strength', 'Weight training and resistance exercises', '#e74c3c', 'dumbbell', 1),
('Cardio', 'cardio', 'Cardiovascular and endurance training', '#f39c12', 'heart', 2),
('Yoga', 'yoga', 'Mind-body practice combining poses and breathing', '#9b59b6', 'leaf', 3),
('Pilates', 'pilates', 'Core-focused exercise system', '#1abc9c', 'circle', 4),
('HIIT', 'hiit', 'High-intensity interval training', '#e67e22', 'zap', 5),
('Dance', 'dance', 'Dance-based fitness classes', '#f1c40f', 'music', 6),
('Martial Arts', 'martial-arts', 'Combat sports and self-defense', '#34495e', 'shield', 7),
('Aqua Fitness', 'aqua', 'Water-based exercise classes', '#3498db', 'waves', 8),
('Flexibility', 'flexibility', 'Stretching and mobility work', '#2ecc71', 'wind', 9),
('Bootcamp', 'bootcamp', 'Military-style group training', '#c0392b', 'target', 10)
ON CONFLICT (name) DO NOTHING;

-- Update existing classes with enhanced data
UPDATE classes 
SET 
    max_capacity = COALESCE(capacity, 20),
    duration_minutes = 60,
    class_type = CASE 
        WHEN LOWER(title) LIKE '%yoga%' THEN 'yoga'
        WHEN LOWER(title) LIKE '%pilates%' THEN 'pilates'
        WHEN LOWER(title) LIKE '%cardio%' THEN 'cardio'
        WHEN LOWER(title) LIKE '%strength%' OR LOWER(title) LIKE '%weight%' THEN 'strength'
        WHEN LOWER(title) LIKE '%hiit%' THEN 'hiit'
        WHEN LOWER(title) LIKE '%dance%' OR LOWER(title) LIKE '%zumba%' THEN 'dance'
        ELSE 'fitness'
    END,
    credit_cost = CASE 
        WHEN price IS NOT NULL THEN GREATEST(1, price / 500) -- Convert price to credits (approximate)
        ELSE 1
    END,
    drop_in_price = COALESCE(price, 2000), -- Default to $20 if no price set
    ends_at = starts_at + INTERVAL '60 minutes'
WHERE duration_minutes IS NULL OR ends_at IS NULL;

-- Update current booking counts for existing classes
UPDATE classes 
SET current_bookings = (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE bookings.class_id = classes.id 
    AND payment_status IN ('completed', 'confirmed')
);

-- Add comments for documentation
COMMENT ON TABLE classes IS 'Enhanced fitness classes with comprehensive scheduling and management';
COMMENT ON TABLE class_categories IS 'Hierarchical categorization system for classes';
COMMENT ON TABLE class_category_assignments IS 'Many-to-many relationship between classes and categories';
COMMENT ON TABLE class_templates IS 'Templates for creating recurring class schedules';
COMMENT ON TABLE class_waitlist IS 'Waitlist management for fully booked classes';
COMMENT ON TABLE class_check_ins IS 'Attendance tracking for completed classes';

COMMENT ON COLUMN classes.credit_cost IS 'Number of credits required to book this class';
COMMENT ON COLUMN classes.drop_in_price IS 'Price in cents for non-members';
COMMENT ON COLUMN classes.early_booking_hours IS 'How many hours in advance users can book';
COMMENT ON COLUMN classes.late_cancellation_hours IS 'Minimum hours before class to cancel without penalty';
COMMENT ON COLUMN classes.current_bookings IS 'Current number of confirmed bookings';
COMMENT ON COLUMN classes.recurring_pattern IS 'JSON configuration for recurring class generation';
COMMENT ON COLUMN class_waitlist.auto_book IS 'Whether to automatically book user when spot becomes available';
COMMENT ON COLUMN class_templates.recurring_schedule IS 'JSON schedule definition for generating classes';