-- Fix NOT NULL constraint on currency columns across all tables
-- Since currency is always ETB, set DEFAULT 'ETB' so existing rows and
-- any rows inserted without explicit currency values are handled correctly.

-- Transactions table
ALTER TABLE transactions
    ALTER COLUMN amount_currency SET DEFAULT 'ETB',
    ALTER COLUMN balance_before_currency SET DEFAULT 'ETB',
    ALTER COLUMN balance_after_currency SET DEFAULT 'ETB';

-- Update any existing NULL currency values
UPDATE transactions SET amount_currency = 'ETB' WHERE amount_currency IS NULL;
UPDATE transactions SET balance_before_currency = 'ETB' WHERE balance_before_currency IS NULL;
UPDATE transactions SET balance_after_currency = 'ETB' WHERE balance_after_currency IS NULL;
