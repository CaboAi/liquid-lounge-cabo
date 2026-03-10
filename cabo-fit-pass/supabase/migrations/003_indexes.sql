-- Migration 003: Performance indexes for query-critical columns
-- Satisfies DB-07 and adds extras for anticipated query patterns in Phases 2-3

CREATE INDEX IF NOT EXISTS idx_bookings_user_id     ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id    ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_scheduled_at ON classes(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_classes_studio_id    ON classes(studio_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_user_id    ON credit_transactions(user_id);
