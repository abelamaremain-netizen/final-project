-- Fix loan_defaults table to match the LoanDefault entity
-- The original V2 schema used different column names than the redesigned entity

ALTER TABLE loan_defaults
    ADD COLUMN IF NOT EXISTS default_date TIMESTAMP,
    ADD COLUMN IF NOT EXISTS declared_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS days_overdue_at_default INTEGER,
    ADD COLUMN IF NOT EXISTS outstanding_at_default_amount DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS outstanding_at_default_currency VARCHAR(3) DEFAULT 'ETB',
    ADD COLUMN IF NOT EXISTS default_reason TEXT,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- Drop NOT NULL on legacy columns the entity doesn't populate
ALTER TABLE loan_defaults ALTER COLUMN declaration_date DROP NOT NULL;
ALTER TABLE loan_defaults ALTER COLUMN processed_by DROP NOT NULL;
