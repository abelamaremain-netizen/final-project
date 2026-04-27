-- Configurable member type categories
-- Allows administrators to define custom member types (e.g. REGULAR, EXTERNAL, etc.)
CREATE TABLE IF NOT EXISTS member_type_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

-- Seed default categories
INSERT INTO member_type_categories (name, description, active)
VALUES
    ('REGULAR', 'Regular employee member subject to payroll deduction', TRUE),
    ('EXTERNAL', 'External cooperative member not subject to payroll deduction', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Ensure members.member_type is VARCHAR to support configurable categories
ALTER TABLE members ALTER COLUMN member_type TYPE VARCHAR(100);
