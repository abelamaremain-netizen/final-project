-- Fix NULL currency values in accounts table and set defaults
-- balance_currency and pledged_currency were never given defaults,
-- causing NULL to be read back by Hibernate and propagated into transactions.

UPDATE accounts SET balance_currency = 'ETB' WHERE balance_currency IS NULL;
UPDATE accounts SET pledged_currency = 'ETB' WHERE pledged_currency IS NULL;

ALTER TABLE accounts
    ALTER COLUMN balance_currency SET DEFAULT 'ETB',
    ALTER COLUMN balance_currency SET NOT NULL;

ALTER TABLE accounts
    ALTER COLUMN pledged_currency SET DEFAULT 'ETB',
    ALTER COLUMN pledged_currency SET NOT NULL;
