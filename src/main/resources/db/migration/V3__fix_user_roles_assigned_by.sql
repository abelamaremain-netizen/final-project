-- Make assigned_by nullable since Hibernate @ManyToMany cannot populate it.
-- Role assignment auditing is handled by the role_assignment_audit table instead.
ALTER TABLE user_roles ALTER COLUMN assigned_by DROP NOT NULL;
