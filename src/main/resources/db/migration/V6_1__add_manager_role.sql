-- Add MANAGER role
INSERT INTO roles (id, name, description, created_at)
VALUES (
    gen_random_uuid(),
    'MANAGER',
    'Cooperative manager - handles all operations except user management and system configuration',
    NOW()
)
ON CONFLICT (name) DO NOTHING;
