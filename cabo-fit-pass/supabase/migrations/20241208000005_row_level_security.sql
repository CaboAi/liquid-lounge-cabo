-- =====================================================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================================================
-- Migration: Comprehensive Row Level Security implementation for all tables
-- Version: 20241208000005
-- Description: Implements secure access control with role-based permissions

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_category_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.sub', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::UUID
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claim.user_role', true), ''),
    (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'user_role'),
    'user'
  )
$$ LANGUAGE SQL STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.user_id() 
    AND role = 'admin'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user is gym staff
CREATE OR REPLACE FUNCTION is_gym_staff(gym_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM gym_staff gs
    JOIN profiles p ON gs.profile_id = p.id
    WHERE p.id = auth.user_id() 
    AND gs.gym_id = gym_uuid
    AND gs.active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Function to check if user owns the gym
CREATE OR REPLACE FUNCTION is_gym_owner(gym_uuid UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM gym_staff gs
    JOIN profiles p ON gs.profile_id = p.id
    WHERE p.id = auth.user_id() 
    AND gs.gym_id = gym_uuid
    AND gs.staff_type = 'owner'
    AND gs.active = true
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- =====================================================================================
-- PROFILES TABLE POLICIES
-- =====================================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.user_id() = id);

-- Users can update their own profile (except role and credits)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.user_id() = id)
  WITH CHECK (
    auth.user_id() = id 
    AND (OLD.role = NEW.role OR is_admin()) -- Only admins can change roles
    AND (OLD.monthly_credits = NEW.monthly_credits OR is_admin()) -- Only admins can change credits
  );

-- Users can insert their own profile (happens during signup)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.user_id() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR ALL USING (is_admin());

-- Public profiles can be viewed by authenticated users (limited fields)
CREATE POLICY "Authenticated users can view public profile data" ON profiles
  FOR SELECT USING (
    auth.user_id() IS NOT NULL 
    AND (status = 'active' OR auth.user_id() = id OR is_admin())
  );

-- =====================================================================================
-- USER CREDITS TABLE POLICIES
-- =====================================================================================

-- Users can view their own credit information
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.user_id() = user_id);

-- System can update credits (handled by functions)
CREATE POLICY "System can manage user credits" ON user_credits
  FOR ALL USING (
    is_admin() OR 
    (auth.user_id() = user_id AND current_setting('role', true) = 'service_role')
  );

-- =====================================================================================
-- CREDIT TRANSACTIONS TABLE POLICIES
-- =====================================================================================

-- Users can view their own transaction history
CREATE POLICY "Users can view own transactions" ON credit_transactions
  FOR SELECT USING (auth.user_id() = user_id);

-- System and admins can insert transactions
CREATE POLICY "System can insert transactions" ON credit_transactions
  FOR INSERT WITH CHECK (
    is_admin() OR 
    current_setting('role', true) = 'service_role'
  );

-- =====================================================================================
-- PROFILE SETTINGS TABLE POLICIES
-- =====================================================================================

-- Users can manage their own settings
CREATE POLICY "Users can manage own settings" ON profile_settings
  FOR ALL USING (auth.user_id() = user_id);

-- =====================================================================================
-- GYMS TABLE POLICIES
-- =====================================================================================

-- Anyone can view active gyms (public directory)
CREATE POLICY "Anyone can view active gyms" ON gyms
  FOR SELECT USING (status = 'active' OR is_admin());

-- Gym owners can update their gyms
CREATE POLICY "Gym owners can update their gyms" ON gyms
  FOR UPDATE USING (is_gym_owner(id));

-- Admins can manage all gyms
CREATE POLICY "Admins can manage all gyms" ON gyms
  FOR ALL USING (is_admin());

-- =====================================================================================
-- GYM AMENITIES TABLE POLICIES
-- =====================================================================================

-- Anyone can view gym amenities
CREATE POLICY "Anyone can view gym amenities" ON gym_amenities
  FOR SELECT USING (true);

-- Gym staff can manage amenities
CREATE POLICY "Gym staff can manage amenities" ON gym_amenities
  FOR ALL USING (is_gym_staff(gym_id) OR is_admin());

-- =====================================================================================
-- GYM IMAGES TABLE POLICIES
-- =====================================================================================

-- Anyone can view gym images
CREATE POLICY "Anyone can view gym images" ON gym_images
  FOR SELECT USING (true);

-- Gym staff can manage images
CREATE POLICY "Gym staff can manage images" ON gym_images
  FOR ALL USING (is_gym_staff(gym_id) OR is_admin());

-- =====================================================================================
-- GYM STAFF TABLE POLICIES
-- =====================================================================================

-- Authenticated users can view active staff
CREATE POLICY "Users can view gym staff" ON gym_staff
  FOR SELECT USING (auth.user_id() IS NOT NULL AND active = true);

-- Gym owners can manage staff
CREATE POLICY "Gym owners can manage staff" ON gym_staff
  FOR ALL USING (is_gym_owner(gym_id) OR is_admin());

-- Staff can update their own profiles
CREATE POLICY "Staff can update own profile" ON gym_staff
  FOR UPDATE USING (auth.user_id() = profile_id);

-- =====================================================================================
-- GYM REVIEWS TABLE POLICIES
-- =====================================================================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view approved reviews" ON gym_reviews
  FOR SELECT USING (review_status = 'approved');

-- Users can view their own reviews (any status)
CREATE POLICY "Users can view own reviews" ON gym_reviews
  FOR SELECT USING (auth.user_id() = user_id);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON gym_reviews
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- Users can update their own pending/rejected reviews
CREATE POLICY "Users can update own reviews" ON gym_reviews
  FOR UPDATE USING (
    auth.user_id() = user_id 
    AND OLD.review_status IN ('pending', 'rejected')
  );

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews" ON gym_reviews
  FOR ALL USING (is_admin());

-- =====================================================================================
-- GYM OPERATING HOURS TABLE POLICIES
-- =====================================================================================

-- Anyone can view operating hours
CREATE POLICY "Anyone can view operating hours" ON gym_operating_hours
  FOR SELECT USING (true);

-- Gym staff can manage hours
CREATE POLICY "Gym staff can manage hours" ON gym_operating_hours
  FOR ALL USING (is_gym_staff(gym_id) OR is_admin());

-- =====================================================================================
-- CLASSES TABLE POLICIES
-- =====================================================================================

-- Anyone can view scheduled classes
CREATE POLICY "Anyone can view scheduled classes" ON classes
  FOR SELECT USING (class_status = 'scheduled' OR is_admin());

-- Gym staff can manage their gym's classes
CREATE POLICY "Gym staff can manage classes" ON classes
  FOR ALL USING (is_gym_staff(gym_id) OR is_admin());

-- =====================================================================================
-- CLASS CATEGORIES TABLE POLICIES
-- =====================================================================================

-- Anyone can view active categories
CREATE POLICY "Anyone can view categories" ON class_categories
  FOR SELECT USING (is_active = true OR is_admin());

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON class_categories
  FOR ALL USING (is_admin());

-- =====================================================================================
-- CLASS CATEGORY ASSIGNMENTS TABLE POLICIES
-- =====================================================================================

-- Anyone can view category assignments
CREATE POLICY "Anyone can view category assignments" ON class_category_assignments
  FOR SELECT USING (true);

-- Gym staff can manage assignments for their classes
CREATE POLICY "Gym staff can manage category assignments" ON class_category_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c 
      WHERE c.id = class_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- =====================================================================================
-- CLASS TEMPLATES TABLE POLICIES
-- =====================================================================================

-- Gym staff can view their templates
CREATE POLICY "Gym staff can view templates" ON class_templates
  FOR SELECT USING (is_gym_staff(gym_id) OR is_admin());

-- Gym staff can manage their templates
CREATE POLICY "Gym staff can manage templates" ON class_templates
  FOR ALL USING (is_gym_staff(gym_id) OR is_admin());

-- =====================================================================================
-- CLASS WAITLIST TABLE POLICIES
-- =====================================================================================

-- Users can view their own waitlist entries
CREATE POLICY "Users can view own waitlist" ON class_waitlist
  FOR SELECT USING (auth.user_id() = user_id);

-- Users can join/leave waitlists
CREATE POLICY "Users can manage own waitlist" ON class_waitlist
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

CREATE POLICY "Users can leave waitlist" ON class_waitlist
  FOR DELETE USING (auth.user_id() = user_id);

-- Gym staff can view/manage waitlists for their classes
CREATE POLICY "Gym staff can manage class waitlists" ON class_waitlist
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c 
      WHERE c.id = class_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- =====================================================================================
-- CLASS CHECK-INS TABLE POLICIES
-- =====================================================================================

-- Users can view their own check-ins
CREATE POLICY "Users can view own check-ins" ON class_check_ins
  FOR SELECT USING (auth.user_id() = user_id);

-- Gym staff can manage check-ins for their classes
CREATE POLICY "Gym staff can manage check-ins" ON class_check_ins
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c 
      WHERE c.id = class_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- =====================================================================================
-- BOOKINGS TABLE POLICIES
-- =====================================================================================

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.user_id() = user_id);

-- Users can create bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- Users can update their own bookings (limited fields)
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (auth.user_id() = user_id)
  WITH CHECK (
    auth.user_id() = user_id
    -- Users can only update certain fields
    AND OLD.class_id = NEW.class_id
    AND OLD.user_id = NEW.user_id
    AND (OLD.booking_status = NEW.booking_status OR NEW.booking_status = 'cancelled')
  );

-- Gym staff can view/manage bookings for their classes
CREATE POLICY "Gym staff can manage bookings" ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM classes c 
      WHERE c.id = class_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- Staff who made the booking can view it
CREATE POLICY "Staff can view bookings they made" ON bookings
  FOR SELECT USING (auth.user_id() = booked_by);

-- =====================================================================================
-- BOOKING HISTORY TABLE POLICIES
-- =====================================================================================

-- Users can view history of their bookings
CREATE POLICY "Users can view own booking history" ON booking_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND b.user_id = auth.user_id()
    )
  );

-- Gym staff can view booking history for their classes
CREATE POLICY "Gym staff can view booking history" ON booking_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN classes c ON b.class_id = c.id
      WHERE b.id = booking_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- =====================================================================================
-- BOOKING REMINDERS TABLE POLICIES
-- =====================================================================================

-- Users can view reminders for their bookings
CREATE POLICY "Users can view own booking reminders" ON booking_reminders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND b.user_id = auth.user_id()
    )
  );

-- System can manage reminders
CREATE POLICY "System can manage reminders" ON booking_reminders
  FOR ALL USING (current_setting('role', true) = 'service_role' OR is_admin());

-- =====================================================================================
-- BOOKING PAYMENTS TABLE POLICIES
-- =====================================================================================

-- Users can view their own payment records
CREATE POLICY "Users can view own booking payments" ON booking_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b 
      WHERE b.id = booking_id 
      AND b.user_id = auth.user_id()
    )
  );

-- System and admins can manage payment records
CREATE POLICY "System can manage booking payments" ON booking_payments
  FOR ALL USING (current_setting('role', true) = 'service_role' OR is_admin());

-- =====================================================================================
-- PAYMENTS TABLE POLICIES
-- =====================================================================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.user_id() = user_id);

-- System can manage payments
CREATE POLICY "System can manage payments" ON payments
  FOR ALL USING (current_setting('role', true) = 'service_role' OR is_admin());

-- =====================================================================================
-- PLANS TABLE POLICIES
-- =====================================================================================

-- Anyone can view active plans
CREATE POLICY "Anyone can view active plans" ON plans
  FOR SELECT USING (is_active = true OR is_admin());

-- Admins can manage plans
CREATE POLICY "Admins can manage plans" ON plans
  FOR ALL USING (is_admin());

-- =====================================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.user_id() = user_id);

-- Users can create subscriptions
CREATE POLICY "Users can create subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- System can update subscriptions (for payment processing)
CREATE POLICY "System can manage subscriptions" ON subscriptions
  FOR UPDATE USING (
    auth.user_id() = user_id OR 
    current_setting('role', true) = 'service_role' OR 
    is_admin()
  );

-- =====================================================================================
-- WORKOUTS TABLE POLICIES
-- =====================================================================================

-- Users can view their own workouts
CREATE POLICY "Users can view own workouts" ON workouts
  FOR SELECT USING (auth.user_id() = user_id);

-- Users can create their own workouts
CREATE POLICY "Users can create own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.user_id() = user_id);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts" ON workouts
  FOR UPDATE USING (auth.user_id() = user_id);

-- Gym staff can view workouts for their classes
CREATE POLICY "Gym staff can view class workouts" ON workouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM classes c 
      WHERE c.id = class_id 
      AND (is_gym_staff(c.gym_id) OR is_admin())
    )
  );

-- =====================================================================================
-- SECURITY FUNCTIONS FOR API ACCESS
-- =====================================================================================

-- Function to securely get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    username VARCHAR,
    full_name VARCHAR,
    email VARCHAR,
    avatar_url VARCHAR,
    role VARCHAR,
    monthly_credits INTEGER,
    status VARCHAR
) 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Use provided UUID or current authenticated user
    target_user_id := COALESCE(user_uuid, auth.user_id());
    
    -- Check if user can access this profile
    IF NOT (target_user_id = auth.user_id() OR is_admin()) THEN
        RAISE EXCEPTION 'Access denied to user profile';
    END IF;
    
    RETURN QUERY
    SELECT 
        p.id,
        p.username,
        p.full_name,
        p.email,
        p.avatar_url,
        p.role,
        p.monthly_credits,
        p.status
    FROM profiles p
    WHERE p.id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to securely get user credits
CREATE OR REPLACE FUNCTION get_user_credits(user_uuid UUID DEFAULT NULL)
RETURNS TABLE (
    user_id UUID,
    current_balance INTEGER,
    monthly_allocation INTEGER,
    lifetime_earned INTEGER,
    lifetime_spent INTEGER,
    last_reset_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Use provided UUID or current authenticated user
    target_user_id := COALESCE(user_uuid, auth.user_id());
    
    -- Check if user can access this data
    IF NOT (target_user_id = auth.user_id() OR is_admin()) THEN
        RAISE EXCEPTION 'Access denied to user credits';
    END IF;
    
    RETURN QUERY
    SELECT 
        uc.user_id,
        uc.current_balance,
        uc.monthly_allocation,
        uc.lifetime_earned,
        uc.lifetime_spent,
        uc.last_reset_at
    FROM user_credits uc
    WHERE uc.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant service role access for system operations
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Comments for documentation
COMMENT ON FUNCTION auth.user_id() IS 'Safely extracts the user ID from JWT token';
COMMENT ON FUNCTION auth.user_role() IS 'Safely extracts the user role from JWT token';
COMMENT ON FUNCTION is_admin() IS 'Checks if the current user has admin role';
COMMENT ON FUNCTION is_gym_staff(UUID) IS 'Checks if the current user is staff at the specified gym';
COMMENT ON FUNCTION is_gym_owner(UUID) IS 'Checks if the current user owns the specified gym';
COMMENT ON FUNCTION get_user_profile(UUID) IS 'Securely retrieves user profile information';
COMMENT ON FUNCTION get_user_credits(UUID) IS 'Securely retrieves user credit information';