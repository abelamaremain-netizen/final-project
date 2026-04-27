-- Initial database schema for Cooperative Management System
-- Version 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE member_type AS ENUM ('REGULAR', 'EXTERNAL_COOPERATIVE');
CREATE TYPE member_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'WITHDRAWN', 'DECEASED');
CREATE TYPE account_type AS ENUM ('REGULAR_SAVING', 'NON_REGULAR_SAVING');
CREATE TYPE account_status AS ENUM ('ACTIVE', 'CLOSED');
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'INTEREST_CREDIT', 'PLEDGE', 'RELEASE', 'PENALTY', 'FEE');
CREATE TYPE loan_application_status AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'DENIED', 'CANCELLED', 'APPEALED');
CREATE TYPE loan_status AS ENUM ('APPROVED', 'CONTRACT_PENDING', 'DISBURSED', 'ACTIVE', 'COMPLETED', 'DEFAULTED', 'RESTRUCTURED');
CREATE TYPE collateral_type AS ENUM ('OWN_SAVINGS', 'GUARANTOR_SAVINGS', 'EXTERNAL_COOPERATIVE', 'FIXED_ASSET');
CREATE TYPE collateral_status AS ENUM ('AVAILABLE', 'PLEDGED', 'RELEASED', 'LIQUIDATION_PENDING', 'LIQUIDATED');
CREATE TYPE sector_type AS ENUM ('PRODUCTION', 'BUSINESS', 'CONSTRUCTION');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- System Configuration Table (versioned)
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version INTEGER NOT NULL UNIQUE,
    effective_date TIMESTAMP NOT NULL,
    
    -- Financial parameters
    registration_fee_amount DECIMAL(15, 2) NOT NULL,
    share_price_per_share_amount DECIMAL(15, 2) NOT NULL,
    minimum_shares_required INTEGER NOT NULL,
    maximum_shares_allowed INTEGER,
    minimum_monthly_deduction_amount DECIMAL(15, 2) NOT NULL,
    savings_interest_rate DECIMAL(5, 4) NOT NULL,
    loan_interest_rate_min DECIMAL(5, 4) NOT NULL,
    loan_interest_rate_max DECIMAL(5, 4) NOT NULL,
    maximum_loan_cap_per_member_amount DECIMAL(15, 2) NOT NULL,
    lending_limit_percentage DECIMAL(5, 4) NOT NULL,
    fixed_asset_ltv_ratio DECIMAL(5, 4) NOT NULL,
    
    -- Operational parameters
    membership_duration_threshold_months INTEGER NOT NULL,
    loan_multiplier_below_threshold DECIMAL(5, 2) NOT NULL,
    loan_multiplier_above_threshold DECIMAL(5, 2) NOT NULL,
    contract_signing_deadline_days INTEGER NOT NULL,
    loan_disbursement_deadline_days INTEGER NOT NULL,
    loan_processing_sla_days INTEGER NOT NULL,
    delinquency_grace_period_days INTEGER NOT NULL,
    member_withdrawal_processing_days INTEGER NOT NULL,
    collateral_appraisal_validity_months INTEGER NOT NULL,
    vehicle_age_limit_years INTEGER NOT NULL,
    deduction_decrease_waiting_months INTEGER NOT NULL,
    non_regular_savings_withdrawal_days INTEGER NOT NULL,
    
    -- Penalties & Fees
    late_payment_penalty_rate DECIMAL(5, 4) NOT NULL,
    late_payment_penalty_grace_days INTEGER NOT NULL,
    early_loan_repayment_penalty DECIMAL(5, 4),
    member_withdrawal_processing_fee_amount DECIMAL(15, 2),
    share_transfer_fee_amount DECIMAL(15, 2),
    
    -- Limits & Constraints
    maximum_active_loans_per_member INTEGER NOT NULL,
    minimum_loan_amount_amount DECIMAL(15, 2) NOT NULL,
    max_consecutive_missed_deductions_before_suspension INTEGER NOT NULL,
    minimum_membership_duration_before_withdrawal_months INTEGER NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

-- Configuration Locks (tracks which transactions use which config version)
CREATE TABLE configuration_locks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_type VARCHAR(100) NOT NULL,
    transaction_id UUID NOT NULL,
    configuration_version INTEGER NOT NULL REFERENCES system_configurations(version),
    locked_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    locked_by VARCHAR(255) NOT NULL,
    
    UNIQUE(transaction_type, transaction_id)
);

CREATE INDEX idx_config_locks_transaction ON configuration_locks(transaction_type, transaction_id);
CREATE INDEX idx_config_locks_version ON configuration_locks(configuration_version);

-- Users Table (for RBAC)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status user_status NOT NULL DEFAULT 'active',
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

-- User-Role Assignments (many-to-many)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by VARCHAR(255) NOT NULL,
    
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

-- Role Assignment Audit
CREATE TABLE role_assignment_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('grant', 'revoke')),
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT
);

CREATE INDEX idx_role_audit_user ON role_assignment_audit(user_id);
CREATE INDEX idx_role_audit_performed_by ON role_assignment_audit(performed_by, performed_at);

-- Members Table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_type member_type NOT NULL,
    
    -- Personal Info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    national_id VARCHAR(50) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_region VARCHAR(100),
    address_country VARCHAR(100) DEFAULT 'Ethiopia',
    
    -- Employment Info
    employer_type VARCHAR(50) NOT NULL,
    employer_id VARCHAR(100),
    employment_status VARCHAR(20) NOT NULL,
    monthly_salary_amount DECIMAL(15, 2),
    committed_deduction_amount DECIMAL(15, 2) NOT NULL,
    last_deduction_change_date DATE,
    
    -- External Cooperative Info (for external_cooperative members)
    external_cooperative_name VARCHAR(255),
    external_cooperative_member_id VARCHAR(100),
    
    -- Beneficiary Info
    beneficiary_name VARCHAR(255),
    beneficiary_relationship VARCHAR(100),
    beneficiary_phone_number VARCHAR(20),
    beneficiary_national_id VARCHAR(50),
    
    -- Registration Info
    registration_date DATE NOT NULL,
    registration_fee_amount DECIMAL(15, 2) NOT NULL,
    registration_config_version INTEGER NOT NULL REFERENCES system_configurations(version),
    share_count INTEGER NOT NULL DEFAULT 0,
    status member_status NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_by VARCHAR(255)
);

CREATE INDEX idx_members_national_id ON members(national_id);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_member_type ON members(member_type);

-- Member Suspension History
CREATE TABLE member_suspensions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    suspended_date TIMESTAMP NOT NULL,
    reason TEXT NOT NULL,
    suspended_by VARCHAR(255) NOT NULL,
    reactivated_date TIMESTAMP,
    reactivated_by VARCHAR(255)
);

CREATE INDEX idx_suspensions_member ON member_suspensions(member_id);

-- Accounts Table
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    account_type account_type NOT NULL,
    balance_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    pledged_amount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    interest_rate DECIMAL(5, 4) NOT NULL,
    created_date DATE NOT NULL,
    last_interest_date DATE,
    status account_status NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255) NOT NULL
);

CREATE INDEX idx_accounts_member ON accounts(member_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_status ON accounts(status);

-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    amount_amount DECIMAL(15, 2) NOT NULL,
    balance_before_amount DECIMAL(15, 2) NOT NULL,
    balance_after_amount DECIMAL(15, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(255) NOT NULL,
    reference VARCHAR(255),
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_account ON transactions(account_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_processed_by ON transactions(processed_by);

-- Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_performed_by ON audit_log(performed_by, performed_at);
CREATE INDEX idx_audit_action ON audit_log(action);

-- Insert default system configuration
INSERT INTO system_configurations (
    version, effective_date,
    registration_fee_amount, share_price_per_share_amount,
    minimum_shares_required, maximum_shares_allowed,
    minimum_monthly_deduction_amount, savings_interest_rate,
    loan_interest_rate_min, loan_interest_rate_max,
    maximum_loan_cap_per_member_amount, lending_limit_percentage,
    fixed_asset_ltv_ratio, membership_duration_threshold_months,
    loan_multiplier_below_threshold, loan_multiplier_above_threshold,
    contract_signing_deadline_days, loan_disbursement_deadline_days,
    loan_processing_sla_days, delinquency_grace_period_days,
    member_withdrawal_processing_days, collateral_appraisal_validity_months,
    vehicle_age_limit_years, deduction_decrease_waiting_months,
    non_regular_savings_withdrawal_days, late_payment_penalty_rate,
    late_payment_penalty_grace_days, maximum_active_loans_per_member,
    minimum_loan_amount_amount, max_consecutive_missed_deductions_before_suspension,
    minimum_membership_duration_before_withdrawal_months, created_by
) VALUES (
    1, CURRENT_TIMESTAMP,
    500.00, 150.00, 3, NULL, 500.00, 0.07,
    0.13, 0.19, 500000.00, 0.80, 0.67, 6,
    1.00, 5.00, 5, 5, 5, 7, 30, 12, 5, 6, 2,
    0.05, 7, 3, 1000.00, 3, 6, 'SYSTEM'
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('ADMINISTRATOR', 'Full system access including configuration and user management'),
    ('LOAN_OFFICER', 'Review and approve loan applications, manage collateral'),
    ('FINANCE_STAFF', 'Manage payroll deductions, generate financial reports'),
    ('MEMBER_SERVICES', 'Register members, process deposits and withdrawals'),
    ('AUDITOR', 'Read-only access to all transactions and audit logs');
