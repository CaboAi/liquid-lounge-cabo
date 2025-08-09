-- =====================================================================================
-- ENHANCED USER PROFILES WITH CREDIT SYSTEM
-- =====================================================================================
-- Migration: Enhanced user profiles with comprehensive credit management
-- Version: 20241208000001
-- Description: Enhances existing profiles table and adds credit system functionality

-- Drop existing constraints if they exist
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_monthly_credits_check;

-- Enhance existing profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS fitness_goals TEXT[],
  ADD COLUMN IF NOT EXISTS medical_conditions TEXT[],
  ADD COLUMN IF NOT EXISTS preferred_class_types TEXT[],
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mazatlan',
  ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS waiver_signed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS waiver_signed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Update monthly_credits to have proper constraints
ALTER TABLE profiles 
  ALTER COLUMN monthly_credits SET DEFAULT 0,
  ADD CONSTRAINT profiles_monthly_credits_check CHECK (monthly_credits >= 0 AND monthly_credits <= 1000);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_credits ON profiles(monthly_credits);

-- Create user_credits table for detailed credit management
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_balance INTEGER NOT NULL DEFAULT 0 CHECK (current_balance >= 0),
    lifetime_earned INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_earned >= 0),
    lifetime_spent INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spent >= 0),
    monthly_allocation INTEGER NOT NULL DEFAULT 0 CHECK (monthly_allocation >= 0),
    bonus_credits INTEGER NOT NULL DEFAULT 0 CHECK (bonus_credits >= 0),
    expires_at TIMESTAMPTZ,
    reset_day_of_month INTEGER DEFAULT 1 CHECK (reset_day_of_month >= 1 AND reset_day_of_month <= 28),
    last_reset_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one record per user
    CONSTRAINT unique_user_credits UNIQUE (user_id)
);

-- Create credit_transactions table for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN (
        'earned', 'spent', 'bonus', 'refund', 'expired', 
        'monthly_reset', 'admin_adjustment', 'referral_bonus'
    )),
    amount INTEGER NOT NULL CHECK (amount != 0),
    balance_before INTEGER NOT NULL CHECK (balance_before >= 0),
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT NOT NULL,
    reference_type VARCHAR(20) CHECK (reference_type IN ('booking', 'subscription', 'plan', 'admin', 'system')),
    reference_id UUID,
    admin_user_id UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    INDEX idx_credit_transactions_user_id (user_id),
    INDEX idx_credit_transactions_type (transaction_type),
    INDEX idx_credit_transactions_created_at (created_at),
    INDEX idx_credit_transactions_reference (reference_type, reference_id)
);

-- Create profile_settings table for user preferences
CREATE TABLE IF NOT EXISTS profile_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    notifications_email BOOLEAN DEFAULT true,
    notifications_sms BOOLEAN DEFAULT false,
    notifications_push BOOLEAN DEFAULT true,
    notification_preferences JSONB DEFAULT '{
        "booking_confirmation": true,
        "class_reminder": true,
        "class_cancellation": true,
        "credit_low_balance": true,
        "monthly_reset": true,
        "promotional": false
    }',
    privacy_settings JSONB DEFAULT '{
        "profile_visible": true,
        "workout_stats_visible": false,
        "allow_friend_requests": true
    }',
    app_preferences JSONB DEFAULT '{
        "theme": "system",
        "language": "en",
        "default_view": "classes",
        "show_completed_workouts": true
    }',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure one settings record per user
    CONSTRAINT unique_profile_settings UNIQUE (user_id)
);

-- Create updated_at trigger for user_credits
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_credits_updated_at 
    BEFORE UPDATE ON user_credits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_settings_updated_at 
    BEFORE UPDATE ON profile_settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to initialize user credits when profile is created
CREATE OR REPLACE FUNCTION initialize_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user_credits record
    INSERT INTO user_credits (user_id, current_balance, monthly_allocation, last_reset_at)
    VALUES (NEW.id, COALESCE(NEW.monthly_credits, 0), COALESCE(NEW.monthly_credits, 0), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Create profile_settings record
    INSERT INTO profile_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to initialize credits and settings for new profiles
DROP TRIGGER IF EXISTS initialize_profile_data ON profiles;
CREATE TRIGGER initialize_profile_data
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_credits();

-- Function to sync monthly_credits with user_credits table
CREATE OR REPLACE FUNCTION sync_monthly_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user_credits when profiles.monthly_credits changes
    IF OLD.monthly_credits != NEW.monthly_credits THEN
        UPDATE user_credits 
        SET 
            current_balance = GREATEST(0, current_balance + (NEW.monthly_credits - OLD.monthly_credits)),
            monthly_allocation = NEW.monthly_credits,
            updated_at = NOW()
        WHERE user_id = NEW.id;
        
        -- Log the credit adjustment
        INSERT INTO credit_transactions (
            user_id, 
            transaction_type, 
            amount, 
            balance_before, 
            balance_after,
            description,
            reference_type
        )
        SELECT 
            NEW.id,
            'admin_adjustment',
            NEW.monthly_credits - OLD.monthly_credits,
            uc.current_balance - (NEW.monthly_credits - OLD.monthly_credits),
            uc.current_balance,
            'Monthly credit allocation updated from ' || OLD.monthly_credits || ' to ' || NEW.monthly_credits,
            'admin'
        FROM user_credits uc
        WHERE uc.user_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to sync monthly_credits changes
DROP TRIGGER IF EXISTS sync_profile_credits ON profiles;
CREATE TRIGGER sync_profile_credits
    AFTER UPDATE ON profiles
    FOR EACH ROW
    WHEN (OLD.monthly_credits IS DISTINCT FROM NEW.monthly_credits)
    EXECUTE FUNCTION sync_monthly_credits();

-- Initialize credits for existing profiles
INSERT INTO user_credits (user_id, current_balance, monthly_allocation, last_reset_at)
SELECT 
    id,
    COALESCE(monthly_credits, 0),
    COALESCE(monthly_credits, 0),
    NOW()
FROM profiles
ON CONFLICT (user_id) DO UPDATE SET
    current_balance = EXCLUDED.current_balance,
    monthly_allocation = EXCLUDED.monthly_allocation;

-- Initialize settings for existing profiles
INSERT INTO profile_settings (user_id)
SELECT id FROM profiles
ON CONFLICT (user_id) DO NOTHING;

-- Add comments for documentation
COMMENT ON TABLE profiles IS 'Enhanced user profiles with fitness and preference data';
COMMENT ON TABLE user_credits IS 'Detailed credit balance and allocation tracking';
COMMENT ON TABLE credit_transactions IS 'Complete audit trail of all credit transactions';
COMMENT ON TABLE profile_settings IS 'User preferences for notifications, privacy, and app settings';

COMMENT ON COLUMN profiles.status IS 'Account status: active, suspended, or deleted';
COMMENT ON COLUMN profiles.fitness_goals IS 'Array of user fitness objectives';
COMMENT ON COLUMN profiles.medical_conditions IS 'Array of relevant health conditions';
COMMENT ON COLUMN profiles.preferred_class_types IS 'Array of preferred workout types';
COMMENT ON COLUMN user_credits.current_balance IS 'Available credits for booking classes';
COMMENT ON COLUMN user_credits.lifetime_earned IS 'Total credits earned historically';
COMMENT ON COLUMN user_credits.lifetime_spent IS 'Total credits spent historically';
COMMENT ON COLUMN credit_transactions.amount IS 'Credit amount - positive for earned, negative for spent';