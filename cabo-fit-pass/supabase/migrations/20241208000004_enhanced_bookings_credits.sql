-- =====================================================================================
-- ENHANCED BOOKINGS WITH CREDIT TRANSACTIONS
-- =====================================================================================
-- Migration: Enhanced booking system with comprehensive credit transaction management
-- Version: 20241208000004
-- Description: Enhances existing bookings table and adds credit transaction tracking

-- Enhance existing bookings table
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS booking_status VARCHAR(20) DEFAULT 'pending' CHECK (booking_status IN (
    'pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'waitlisted'
  )),
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0 CHECK (credits_used >= 0),
  ADD COLUMN IF NOT EXISTS amount_paid INTEGER DEFAULT 0 CHECK (amount_paid >= 0),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) CHECK (payment_method IN (
    'credits', 'stripe', 'cash', 'bank_transfer', 'comp', 'refund'
  )),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS booking_source VARCHAR(20) DEFAULT 'app' CHECK (booking_source IN (
    'app', 'web', 'staff', 'phone', 'walk_in', 'import'
  )),
  ADD COLUMN IF NOT EXISTS booked_by UUID REFERENCES profiles(id), -- Staff member who made booking if not self-booking
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancellation_reason VARCHAR(20) CHECK (cancellation_reason IN (
    'user_request', 'class_cancelled', 'no_show', 'system', 'admin'
  )),
  ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0 CHECK (refund_amount >= 0),
  ADD COLUMN IF NOT EXISTS refund_credits INTEGER DEFAULT 0 CHECK (refund_credits >= 0),
  ADD COLUMN IF NOT EXISTS late_cancellation BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS special_requests TEXT,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS reminded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Generate confirmation codes for existing bookings
UPDATE bookings 
SET confirmation_code = UPPER(LEFT(gen_random_uuid()::TEXT, 8))
WHERE confirmation_code IS NULL;

-- Create booking_history table for audit trail
CREATE TABLE IF NOT EXISTS booking_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by UUID REFERENCES profiles(id),
    change_reason VARCHAR(100),
    change_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_booking_history_booking_id (booking_id),
    INDEX idx_booking_history_changed_by (changed_by),
    INDEX idx_booking_history_created_at (created_at)
);

-- Create booking_reminders table
CREATE TABLE IF NOT EXISTS booking_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL CHECK (reminder_type IN (
        '24_hours', '2_hours', '30_minutes', 'custom'
    )),
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    delivery_method VARCHAR(20) DEFAULT 'email' CHECK (delivery_method IN (
        'email', 'sms', 'push', 'in_app'
    )),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'sent', 'failed', 'cancelled'
    )),
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_booking_reminders_booking_id (booking_id),
    INDEX idx_booking_reminders_scheduled_at (scheduled_at),
    INDEX idx_booking_reminders_status (status)
);

-- Create booking_payments table for detailed payment tracking
CREATE TABLE IF NOT EXISTS booking_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN (
        'booking', 'cancellation_fee', 'refund', 'partial_refund'
    )),
    amount INTEGER NOT NULL CHECK (amount != 0), -- Can be negative for refunds
    currency VARCHAR(3) DEFAULT 'USD',
    credits_amount INTEGER DEFAULT 0 CHECK (credits_amount >= 0),
    payment_method VARCHAR(20) NOT NULL,
    stripe_payment_intent_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'
    )),
    failure_reason TEXT,
    processed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_booking_payments_booking_id (booking_id),
    INDEX idx_booking_payments_status (payment_status),
    INDEX idx_booking_payments_stripe_intent (stripe_payment_intent_id),
    INDEX idx_booking_payments_created_at (created_at)
);

-- Enhance payments table to link with bookings properly
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20) DEFAULT 'booking' CHECK (payment_type IN (
    'booking', 'subscription', 'plan_purchase', 'cancellation_fee', 'refund'
  )),
  ADD COLUMN IF NOT EXISTS credits_amount INTEGER DEFAULT 0 CHECK (credits_amount >= 0),
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add indexes to enhanced bookings table
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_confirmation_code ON bookings(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_bookings_booked_by ON bookings(booked_by);
CREATE INDEX IF NOT EXISTS idx_bookings_checked_in ON bookings(checked_in);

-- Add unique constraint on confirmation codes
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_unique_confirmation_code 
ON bookings(confirmation_code) WHERE confirmation_code IS NOT NULL;

-- Create updated_at triggers
CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON bookings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to log booking status changes
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.booking_status IS DISTINCT FROM NEW.booking_status 
       OR OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
        
        INSERT INTO booking_history (
            booking_id,
            previous_status,
            new_status,
            change_details
        ) VALUES (
            NEW.id,
            OLD.booking_status,
            NEW.booking_status,
            json_build_object(
                'old_payment_status', OLD.payment_status,
                'new_payment_status', NEW.payment_status,
                'old_credits_used', OLD.credits_used,
                'new_credits_used', NEW.credits_used
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to log booking changes
DROP TRIGGER IF EXISTS log_booking_status_changes ON bookings;
CREATE TRIGGER log_booking_status_changes
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_changes();

-- Function to handle credit transactions when booking changes
CREATE OR REPLACE FUNCTION handle_booking_credit_transaction()
RETURNS TRIGGER AS $$
DECLARE
    credit_change INTEGER;
    transaction_desc TEXT;
    class_info RECORD;
BEGIN
    -- Get class information for description
    SELECT title, starts_at INTO class_info
    FROM classes 
    WHERE id = NEW.class_id;
    
    IF TG_OP = 'INSERT' THEN
        -- New booking with credits
        IF NEW.credits_used > 0 AND NEW.payment_status IN ('completed', 'confirmed') THEN
            -- Deduct credits
            UPDATE user_credits 
            SET 
                current_balance = current_balance - NEW.credits_used,
                lifetime_spent = lifetime_spent + NEW.credits_used,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
            
            -- Log credit transaction
            INSERT INTO credit_transactions (
                user_id,
                transaction_type,
                amount,
                balance_before,
                balance_after,
                description,
                reference_type,
                reference_id
            )
            SELECT 
                NEW.user_id,
                'spent',
                -NEW.credits_used,
                uc.current_balance + NEW.credits_used,
                uc.current_balance,
                'Booked class: ' || COALESCE(class_info.title, 'Unknown') || ' on ' || COALESCE(class_info.starts_at::TEXT, 'Unknown date'),
                'booking',
                NEW.id
            FROM user_credits uc
            WHERE uc.user_id = NEW.user_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        -- Handle status changes that affect credits
        credit_change := NEW.credits_used - OLD.credits_used;
        
        -- Booking confirmed - deduct additional credits if needed
        IF OLD.payment_status != 'completed' AND NEW.payment_status = 'completed' AND credit_change > 0 THEN
            UPDATE user_credits 
            SET 
                current_balance = current_balance - credit_change,
                lifetime_spent = lifetime_spent + credit_change,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
            
            transaction_desc := 'Additional credits for ' || COALESCE(class_info.title, 'class booking');
        
        -- Booking cancelled - refund credits
        ELSIF OLD.booking_status NOT IN ('cancelled') AND NEW.booking_status = 'cancelled' AND OLD.credits_used > 0 THEN
            -- Determine refund amount (may be less than original if late cancellation)
            credit_change := CASE 
                WHEN NEW.late_cancellation THEN OLD.credits_used / 2 -- 50% refund for late cancellation
                ELSE OLD.credits_used -- Full refund
            END;
            
            UPDATE user_credits 
            SET 
                current_balance = current_balance + credit_change,
                lifetime_earned = lifetime_earned + credit_change,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
            
            -- Update booking refund amount
            NEW.refund_credits := credit_change;
            
            transaction_desc := CASE 
                WHEN NEW.late_cancellation THEN 'Partial refund (late cancellation) for ' || COALESCE(class_info.title, 'class booking')
                ELSE 'Full refund for cancelled class: ' || COALESCE(class_info.title, 'class booking')
            END;
        
        ELSE
            RETURN NEW; -- No credit transaction needed
        END IF;
        
        -- Log the credit transaction
        INSERT INTO credit_transactions (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            description,
            reference_type,
            reference_id
        )
        SELECT 
            NEW.user_id,
            CASE WHEN credit_change > 0 THEN 'earned' ELSE 'spent' END,
            credit_change,
            uc.current_balance - credit_change,
            uc.current_balance,
            transaction_desc,
            'booking',
            NEW.id
        FROM user_credits uc
        WHERE uc.user_id = NEW.user_id;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for credit transactions
DROP TRIGGER IF EXISTS handle_booking_credits_insert ON bookings;
CREATE TRIGGER handle_booking_credits_insert
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION handle_booking_credit_transaction();

DROP TRIGGER IF EXISTS handle_booking_credits_update ON bookings;
CREATE TRIGGER handle_booking_credits_update
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION handle_booking_credit_transaction();

-- Function to automatically create booking reminders
CREATE OR REPLACE FUNCTION create_booking_reminders()
RETURNS TRIGGER AS $$
DECLARE
    class_start TIMESTAMPTZ;
BEGIN
    -- Get class start time
    SELECT starts_at INTO class_start
    FROM classes 
    WHERE id = NEW.class_id;
    
    -- Only create reminders for confirmed bookings with future classes
    IF NEW.booking_status = 'confirmed' AND class_start > NOW() THEN
        -- 24-hour reminder
        IF class_start > NOW() + INTERVAL '24 hours' THEN
            INSERT INTO booking_reminders (booking_id, reminder_type, scheduled_at)
            VALUES (NEW.id, '24_hours', class_start - INTERVAL '24 hours');
        END IF;
        
        -- 2-hour reminder
        IF class_start > NOW() + INTERVAL '2 hours' THEN
            INSERT INTO booking_reminders (booking_id, reminder_type, scheduled_at)
            VALUES (NEW.id, '2_hours', class_start - INTERVAL '2 hours');
        END IF;
        
        -- 30-minute reminder
        IF class_start > NOW() + INTERVAL '30 minutes' THEN
            INSERT INTO booking_reminders (booking_id, reminder_type, scheduled_at)
            VALUES (NEW.id, '30_minutes', class_start - INTERVAL '30 minutes');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create reminders for new confirmed bookings
DROP TRIGGER IF EXISTS create_reminders_for_bookings ON bookings;
CREATE TRIGGER create_reminders_for_bookings
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW
    WHEN (NEW.booking_status = 'confirmed')
    EXECUTE FUNCTION create_booking_reminders();

-- Update existing bookings with enhanced data
UPDATE bookings 
SET 
    booking_status = CASE 
        WHEN payment_status = 'completed' THEN 'confirmed'
        WHEN payment_status = 'pending' THEN 'pending'
        ELSE 'pending'
    END,
    credits_used = 1, -- Default to 1 credit per booking
    confirmation_code = UPPER(LEFT(gen_random_uuid()::TEXT, 8))
WHERE booking_status IS NULL;

-- Sync payment_status with booking_status for consistency
UPDATE bookings 
SET payment_status = 'completed'
WHERE booking_status = 'confirmed' AND payment_status != 'completed';

-- Add comments for documentation
COMMENT ON TABLE bookings IS 'Enhanced booking system with comprehensive status tracking and payment integration';
COMMENT ON TABLE booking_history IS 'Audit trail of all booking status changes';
COMMENT ON TABLE booking_reminders IS 'Automated reminder system for upcoming classes';
COMMENT ON TABLE booking_payments IS 'Detailed payment transaction tracking for bookings';

COMMENT ON COLUMN bookings.credits_used IS 'Number of credits consumed for this booking';
COMMENT ON COLUMN bookings.booking_status IS 'Current status of the booking reservation';
COMMENT ON COLUMN bookings.confirmation_code IS 'Unique code for booking verification';
COMMENT ON COLUMN bookings.late_cancellation IS 'Whether cancellation occurred within the penalty window';
COMMENT ON COLUMN bookings.refund_credits IS 'Number of credits refunded for cancellation';
COMMENT ON COLUMN booking_reminders.reminder_type IS 'Type of automated reminder';
COMMENT ON COLUMN booking_payments.amount IS 'Payment amount in cents (negative for refunds)';

-- Create RPC function to get user booking history
CREATE OR REPLACE FUNCTION get_user_booking_history(user_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    booking_id UUID,
    class_title VARCHAR,
    gym_name VARCHAR,
    class_start TIMESTAMPTZ,
    booking_status VARCHAR,
    credits_used INTEGER,
    amount_paid INTEGER,
    confirmation_code VARCHAR,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        c.title,
        g.name,
        c.starts_at,
        b.booking_status,
        b.credits_used,
        b.amount_paid,
        b.confirmation_code,
        b.created_at
    FROM bookings b
    JOIN classes c ON b.class_id = c.id
    JOIN gyms g ON c.gym_id = g.id
    WHERE b.user_id = user_uuid
    ORDER BY b.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;