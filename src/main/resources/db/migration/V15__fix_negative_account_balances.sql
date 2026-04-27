-- Fix accounts that have negative balances caused by the registration fee
-- being incorrectly deposited as a negative amount during member registration.
-- The registration fee deduction has been removed from the code; this cleans up existing data.
UPDATE accounts SET balance_amount = 0 WHERE balance_amount < 0;
