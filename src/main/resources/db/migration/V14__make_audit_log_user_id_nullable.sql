-- Make audit_logs.user_id nullable to support system-generated audit events
-- where no authenticated user is available (e.g. scheduled jobs, system actions)
ALTER TABLE audit_logs ALTER COLUMN user_id DROP NOT NULL;
