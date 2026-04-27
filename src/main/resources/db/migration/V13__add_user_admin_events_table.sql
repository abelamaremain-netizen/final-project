-- User administration event audit trail
-- Tracks account creation, activation, deactivation, password changes, and profile updates
-- Accessible to ADMINISTRATOR only — not visible in the general audit log

CREATE TABLE IF NOT EXISTS user_admin_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    username VARCHAR(100) NOT NULL,
    event_type VARCHAR(30) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_admin_user_id ON user_admin_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_admin_performed_at ON user_admin_events(performed_at);
