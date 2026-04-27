-- Fix legacy NOT NULL constraints on columns not mapped by the Java entity
-- These columns exist from the original schema design but the entity uses different column names

-- Collateral table legacy columns
ALTER TABLE collateral ALTER COLUMN type DROP NOT NULL;
ALTER TABLE collateral ALTER COLUMN value_amount DROP NOT NULL;

-- Loans table legacy columns
ALTER TABLE loans ALTER COLUMN duration DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN monthly_payment_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN total_interest_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN total_repayable_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN outstanding_balance_amount DROP NOT NULL;
ALTER TABLE loans ALTER COLUMN collateral_id DROP NOT NULL;
