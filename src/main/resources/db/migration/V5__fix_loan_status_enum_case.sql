-- Fix enum-typed columns that are still bound to PostgreSQL enum types.
-- accounts, members, transactions are already varchar and work fine.
-- Only loans.status and loan_applications.status need fixing.

ALTER TABLE loans ALTER COLUMN status TYPE text USING UPPER(status::text);
ALTER TABLE loan_applications ALTER COLUMN status TYPE text USING UPPER(status::text);
