-- Align role names to match application security configuration
-- Rename existing roles and add MANAGER

UPDATE roles SET name = 'ACCOUNTANT' WHERE name = 'FINANCE_STAFF';
UPDATE roles SET name = 'MEMBER_OFFICER' WHERE name = 'MEMBER_SERVICES';

-- Add missing roles if they don't exist
INSERT INTO roles (id, name, description, created_at)
VALUES (gen_random_uuid(), 'LOAN_OFFICER', 'Handles loan applications, collateral, review and disbursement', NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (id, name, description, created_at)
VALUES (gen_random_uuid(), 'MANAGER', 'Cooperative manager - handles all operations except user management and system configuration', NOW())
ON CONFLICT (name) DO NOTHING;
