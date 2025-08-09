-- =====================================================================================
-- ENHANCED STUDIOS/GYMS WITH LOCATION DATA
-- =====================================================================================
-- Migration: Enhanced studio/gym management with comprehensive location data
-- Version: 20241208000002
-- Description: Enhances existing gyms table and adds location/amenity management

-- Enhance existing gyms table (keeping it as primary table)
ALTER TABLE gyms 
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS website VARCHAR(500),
  ADD COLUMN IF NOT EXISTS instagram VARCHAR(100),
  ADD COLUMN IF NOT EXISTS facebook VARCHAR(100),
  ADD COLUMN IF NOT EXISTS address_line1 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_line2 VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state_province VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Mexico',
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mazatlan',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) CHECK (rating >= 0 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS capacity INTEGER CHECK (capacity > 0),
  ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS accessibility_features TEXT[],
  ADD COLUMN IF NOT EXISTS operating_hours JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_title VARCHAR(100),
  ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(20),
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create gym_amenities table for flexible amenity management
CREATE TABLE IF NOT EXISTS gym_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50) NOT NULL CHECK (amenity_type IN (
        'equipment', 'service', 'facility', 'accessibility', 'comfort'
    )),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50), -- Icon identifier for UI
    available BOOLEAN DEFAULT true,
    additional_cost BOOLEAN DEFAULT false,
    cost_amount INTEGER, -- Cost in cents if additional_cost is true
    priority INTEGER DEFAULT 0, -- Display order
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_gym_amenities_gym_id (gym_id),
    INDEX idx_gym_amenities_type (amenity_type),
    INDEX idx_gym_amenities_available (available)
);

-- Create gym_images table for photo gallery
CREATE TABLE IF NOT EXISTS gym_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    image_type VARCHAR(20) NOT NULL DEFAULT 'gallery' CHECK (image_type IN (
        'logo', 'hero', 'gallery', 'equipment', 'facility', 'staff'
    )),
    alt_text VARCHAR(255),
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_gym_images_gym_id (gym_id),
    INDEX idx_gym_images_type (image_type),
    INDEX idx_gym_images_primary (is_primary, gym_id)
);

-- Create gym_staff table for instructor/staff management
CREATE TABLE IF NOT EXISTS gym_staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id),
    staff_type VARCHAR(20) NOT NULL CHECK (staff_type IN (
        'owner', 'manager', 'instructor', 'trainer', 'receptionist', 'maintenance'
    )),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    specializations TEXT[],
    certifications TEXT[],
    experience_years INTEGER CHECK (experience_years >= 0),
    hourly_rate INTEGER, -- Rate in cents per hour
    avatar_url VARCHAR(500),
    social_links JSONB DEFAULT '{}',
    availability JSONB DEFAULT '{}', -- Weekly availability schedule
    active BOOLEAN DEFAULT true,
    hire_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_gym_staff_gym_id (gym_id),
    INDEX idx_gym_staff_type (staff_type),
    INDEX idx_gym_staff_active (active),
    INDEX idx_gym_staff_profile (profile_id)
);

-- Create gym_reviews table for user feedback
CREATE TABLE IF NOT EXISTS gym_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    review_text TEXT,
    pros TEXT[],
    cons TEXT[],
    would_recommend BOOLEAN,
    visited_date DATE,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN (
        'pending', 'approved', 'rejected', 'flagged'
    )),
    helpful_votes INTEGER DEFAULT 0,
    reported_count INTEGER DEFAULT 0,
    moderator_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one review per user per gym
    CONSTRAINT unique_user_gym_review UNIQUE (gym_id, user_id),
    
    -- Indexes
    INDEX idx_gym_reviews_gym_id (gym_id),
    INDEX idx_gym_reviews_user_id (user_id),
    INDEX idx_gym_reviews_rating (rating),
    INDEX idx_gym_reviews_status (review_status),
    INDEX idx_gym_reviews_created_at (created_at)
);

-- Create gym_operating_hours table for detailed scheduling
CREATE TABLE IF NOT EXISTS gym_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT false,
    special_hours_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure unique hours per gym per day
    CONSTRAINT unique_gym_day_hours UNIQUE (gym_id, day_of_week),
    
    -- Indexes
    INDEX idx_gym_operating_hours_gym_id (gym_id),
    INDEX idx_gym_operating_hours_day (day_of_week)
);

-- Add indexes to enhanced gyms table
CREATE INDEX IF NOT EXISTS idx_gyms_status ON gyms(status);
CREATE INDEX IF NOT EXISTS idx_gyms_verified ON gyms(verified);
CREATE INDEX IF NOT EXISTS idx_gyms_featured ON gyms(featured);
CREATE INDEX IF NOT EXISTS idx_gyms_location ON gyms(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gyms_city ON gyms(city);
CREATE INDEX IF NOT EXISTS idx_gyms_rating ON gyms(rating) WHERE rating IS NOT NULL;

-- Create updated_at triggers
CREATE TRIGGER update_gyms_updated_at 
    BEFORE UPDATE ON gyms 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_staff_updated_at 
    BEFORE UPDATE ON gym_staff 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_reviews_updated_at 
    BEFORE UPDATE ON gym_reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update gym rating when reviews change
CREATE OR REPLACE FUNCTION update_gym_rating()
RETURNS TRIGGER AS $$
DECLARE
    new_rating DECIMAL(3, 2);
    review_count INTEGER;
BEGIN
    -- Calculate average rating for the gym
    SELECT 
        ROUND(AVG(rating)::NUMERIC, 2),
        COUNT(*)
    INTO new_rating, review_count
    FROM gym_reviews 
    WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id) 
    AND review_status = 'approved';
    
    -- Update the gym's rating and review count
    UPDATE gyms 
    SET 
        rating = new_rating,
        total_reviews = review_count,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.gym_id, OLD.gym_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers to update gym rating when reviews change
DROP TRIGGER IF EXISTS update_gym_rating_on_insert ON gym_reviews;
CREATE TRIGGER update_gym_rating_on_insert
    AFTER INSERT ON gym_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_gym_rating();

DROP TRIGGER IF EXISTS update_gym_rating_on_update ON gym_reviews;
CREATE TRIGGER update_gym_rating_on_update
    AFTER UPDATE ON gym_reviews
    FOR EACH ROW
    WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR OLD.review_status IS DISTINCT FROM NEW.review_status)
    EXECUTE FUNCTION update_gym_rating();

DROP TRIGGER IF EXISTS update_gym_rating_on_delete ON gym_reviews;
CREATE TRIGGER update_gym_rating_on_delete
    AFTER DELETE ON gym_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_gym_rating();

-- Function to ensure only one primary image per gym per type
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = true THEN
        -- Remove primary flag from other images of the same type for this gym
        UPDATE gym_images 
        SET is_primary = false 
        WHERE gym_id = NEW.gym_id 
        AND image_type = NEW.image_type 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to ensure single primary image
DROP TRIGGER IF EXISTS ensure_single_primary_gym_image ON gym_images;
CREATE TRIGGER ensure_single_primary_gym_image
    AFTER INSERT OR UPDATE ON gym_images
    FOR EACH ROW
    WHEN (NEW.is_primary = true)
    EXECUTE FUNCTION ensure_single_primary_image();

-- Insert default operating hours for existing gyms
INSERT INTO gym_operating_hours (gym_id, day_of_week, open_time, close_time)
SELECT 
    g.id,
    generate_series(1, 5) as day_of_week, -- Monday to Friday
    '06:00'::TIME as open_time,
    '22:00'::TIME as close_time
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_operating_hours goh 
    WHERE goh.gym_id = g.id
);

-- Insert weekend hours (shorter hours)
INSERT INTO gym_operating_hours (gym_id, day_of_week, open_time, close_time)
SELECT 
    g.id,
    generate_series(0, 0) as day_of_week, -- Sunday
    '08:00'::TIME as open_time,
    '20:00'::TIME as close_time
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_operating_hours goh 
    WHERE goh.gym_id = g.id AND goh.day_of_week = 0
);

INSERT INTO gym_operating_hours (gym_id, day_of_week, open_time, close_time)
SELECT 
    g.id,
    6 as day_of_week, -- Saturday
    '07:00'::TIME as open_time,
    '21:00'::TIME as close_time
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_operating_hours goh 
    WHERE goh.gym_id = g.id AND goh.day_of_week = 6
);

-- Insert common amenities for existing gyms
INSERT INTO gym_amenities (gym_id, amenity_type, name, icon, priority)
SELECT g.id, 'equipment', 'Weight Training Equipment', 'dumbbell', 1
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_amenities ga 
    WHERE ga.gym_id = g.id AND ga.name = 'Weight Training Equipment'
);

INSERT INTO gym_amenities (gym_id, amenity_type, name, icon, priority)
SELECT g.id, 'equipment', 'Cardio Machines', 'activity', 2
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_amenities ga 
    WHERE ga.gym_id = g.id AND ga.name = 'Cardio Machines'
);

INSERT INTO gym_amenities (gym_id, amenity_type, name, icon, priority)
SELECT g.id, 'facility', 'Changing Rooms', 'home', 3
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_amenities ga 
    WHERE ga.gym_id = g.id AND ga.name = 'Changing Rooms'
);

INSERT INTO gym_amenities (gym_id, amenity_type, name, icon, priority)
SELECT g.id, 'comfort', 'Air Conditioning', 'wind', 4
FROM gyms g
WHERE NOT EXISTS (
    SELECT 1 FROM gym_amenities ga 
    WHERE ga.gym_id = g.id AND ga.name = 'Air Conditioning'
);

-- Add comments for documentation
COMMENT ON TABLE gyms IS 'Enhanced gym/studio information with location and operational data';
COMMENT ON TABLE gym_amenities IS 'Flexible amenity tracking for gyms';
COMMENT ON TABLE gym_images IS 'Photo gallery for gym marketing';
COMMENT ON TABLE gym_staff IS 'Staff and instructor management';
COMMENT ON TABLE gym_reviews IS 'User reviews and ratings';
COMMENT ON TABLE gym_operating_hours IS 'Detailed operating schedule';

COMMENT ON COLUMN gyms.latitude IS 'Latitude coordinate for mapping';
COMMENT ON COLUMN gyms.longitude IS 'Longitude coordinate for mapping';
COMMENT ON COLUMN gyms.operating_hours IS 'JSON object with weekly schedule';
COMMENT ON COLUMN gym_amenities.additional_cost IS 'Whether this amenity requires extra payment';
COMMENT ON COLUMN gym_staff.availability IS 'JSON object with weekly availability schedule';
COMMENT ON COLUMN gym_reviews.would_recommend IS 'Whether user would recommend this gym';