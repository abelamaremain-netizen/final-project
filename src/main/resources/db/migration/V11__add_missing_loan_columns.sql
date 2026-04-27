-- Add missing columns to loans table that the Loan entity expects
-- The original V2 schema used different column names than the redesigned entity

ALTER TABLE loans
    ADD COLUMN IF NOT EXISTS duration_months INTEGER,
    ADD COLUMN IF NOT EXISTS outstanding_principal_amount DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS outstanding_principal_currency VARCHAR(3) DEFAULT 'ETB',
    ADD COLUMN IF NOT EXISTS outstanding_interest_amount DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS outstanding_interest_currency VARCHAR(3) DEFAULT 'ETB',
    ADD COLUMN IF NOT EXISTS total_paid_amount DECIMAL(15, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_paid_currency VARCHAR(3) DEFAULT 'ETB',
    ADD COLUMN IF NOT EXISTS principal_currency VARCHAR(3) DEFAULT 'ETB',
    ADD COLUMN IF NOT EXISTS first_payment_date DATE,
    ADD COLUMN IF NOT EXISTS last_payment_date DATE;

-- Drop NOT NULL on legacy columns the entity doesn't populate
ALTER TABLE loans ALTER COLUMN collateral_id DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN duration DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN monthly_payment_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN total_interest_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN total_repayable_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN outstanding_balance_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN config_version DROP NOT NULL;
