-- Migration V2: Add remaining tables for Phases 6-17
-- Adds: Share Capital, Loans, Collateral, Payroll, Documents, Audit Logs, and supporting tables

-- Share Records Table
CREATE TABLE share_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    share_count INTEGER NOT NULL,
    price_per_share_amount DECIMAL(15, 2) NOT NULL,
    total_value_amount DECIMAL(15, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_share_records_member ON share_records(member_id);

-- Share Transfers Table
CREATE TABLE share_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_member_id UUID NOT NULL REFERENCES members(id),
    to_member_id UUID NOT NULL REFERENCES members(id),
    share_count INTEGER NOT NULL,
    price_per_share_amount DECIMAL(15, 2) NOT NULL,
    total_value_amount DECIMAL(15, 2) NOT NULL,
    transfer_fee_amount DECIMAL(15, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    request_date DATE NOT NULL,
    approval_date DATE,
    approved_by VARCHAR(255),
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_share_transfers_from ON share_transfers(from_member_id);
CREATE INDEX idx_share_transfers_to ON share_transfers(to_member_id);
CREATE INDEX idx_share_transfers_status ON share_transfers(status);

-- Loan Applications Table
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    requested_amount_amount DECIMAL(15, 2) NOT NULL,
    duration INTEGER NOT NULL,
    sector_type sector_type NOT NULL,
    purpose TEXT NOT NULL,
    collateral_type collateral_type NOT NULL,
    submission_date DATE NOT NULL,
    queue_position INTEGER,
    status loan_application_status NOT NULL DEFAULT 'pending',
    review_started_date DATE,
    reviewed_by VARCHAR(255),
    denial_reason TEXT,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loan_apps_member ON loan_applications(member_id);
CREATE INDEX idx_loan_apps_status ON loan_applications(status);
CREATE INDEX idx_loan_apps_queue ON loan_applications(queue_position);

-- Collateral Table
CREATE TABLE collateral (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type collateral_type NOT NULL,
    value_amount DECIMAL(15, 2) NOT NULL,
    status collateral_status NOT NULL DEFAULT 'available',
    
    -- Own Savings
    own_savings_member_id UUID REFERENCES members(id),
    own_savings_account_id UUID REFERENCES accounts(id),
    own_savings_pledged_amount DECIMAL(15, 2),
    
    -- Guarantor Savings
    guarantor_member_id UUID REFERENCES members(id),
    guarantor_account_id UUID REFERENCES accounts(id),
    guarantor_pledged_amount DECIMAL(15, 2),
    guarantor_consent_document_id UUID,
    
    -- External Cooperative
    external_coop_name VARCHAR(255),
    external_coop_member_id VARCHAR(100),
    external_coop_savings_balance DECIMAL(15, 2),
    external_coop_verification_doc_id UUID,
    
    -- Fixed Asset
    asset_type VARCHAR(50),
    appraised_value_amount DECIMAL(15, 2),
    appraisal_date DATE,
    ltv_ratio DECIMAL(5, 4),
    max_loan_amount DECIMAL(15, 2),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_plate_number VARCHAR(50),
    property_address TEXT,
    property_title_deed VARCHAR(100),
    
    pledged_for_loan_id UUID,
    pledged_date DATE,
    pledged_by VARCHAR(255),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_collateral_type ON collateral(type);
CREATE INDEX idx_collateral_status ON collateral(status);
CREATE INDEX idx_collateral_loan ON collateral(pledged_for_loan_id);

-- Loans Table
CREATE TABLE loans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES loan_applications(id),
    member_id UUID NOT NULL REFERENCES members(id),
    principal_amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 4) NOT NULL,
    duration INTEGER NOT NULL,
    monthly_payment_amount DECIMAL(15, 2) NOT NULL,
    total_interest_amount DECIMAL(15, 2) NOT NULL,
    total_repayable_amount DECIMAL(15, 2) NOT NULL,
    approval_date DATE NOT NULL,
    disbursement_date DATE,
    maturity_date DATE,
    outstanding_balance_amount DECIMAL(15, 2) NOT NULL,
    status loan_status NOT NULL DEFAULT 'approved',
    collateral_id UUID NOT NULL REFERENCES collateral(id),
    config_version INTEGER NOT NULL REFERENCES system_configurations(version),
    contract_signed_date DATE,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_loans_member ON loans(member_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_application ON loans(application_id);

-- Loan Repayments Table
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    amount_amount DECIMAL(15, 2) NOT NULL,
    principal_portion_amount DECIMAL(15, 2) NOT NULL,
    interest_portion_amount DECIMAL(15, 2) NOT NULL,
    outstanding_balance_after_amount DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_date ON loan_repayments(payment_date);

-- Loan Penalties Table
CREATE TABLE loan_penalties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    penalty_amount_amount DECIMAL(15, 2) NOT NULL,
    penalty_rate DECIMAL(5, 4) NOT NULL,
    days_overdue INTEGER NOT NULL,
    assessment_date DATE NOT NULL,
    reason TEXT,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loan_penalties_loan ON loan_penalties(loan_id);

-- Loan Defaults Table
CREATE TABLE loan_defaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    declaration_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'DECLARED',
    reason TEXT NOT NULL,
    legal_action_initiated BOOLEAN DEFAULT FALSE,
    legal_action_date DATE,
    court_filing_date DATE,
    court_case_number VARCHAR(100),
    resolution_date DATE,
    resolution_notes TEXT,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loan_defaults_loan ON loan_defaults(loan_id);
CREATE INDEX idx_loan_defaults_status ON loan_defaults(status);

-- Loan Appeals Table
CREATE TABLE loan_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES loan_applications(id),
    member_id UUID NOT NULL REFERENCES members(id),
    appeal_reason TEXT NOT NULL,
    submitted_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    decision VARCHAR(20),
    decision_reason TEXT,
    decided_by VARCHAR(255),
    decision_date DATE,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loan_appeals_application ON loan_appeals(application_id);
CREATE INDEX idx_loan_appeals_status ON loan_appeals(status);

-- Loan Restructuring Table
CREATE TABLE loan_restructurings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    loan_id UUID NOT NULL REFERENCES loans(id),
    original_principal_amount DECIMAL(15, 2) NOT NULL,
    original_interest_rate DECIMAL(5, 4) NOT NULL,
    original_duration INTEGER NOT NULL,
    new_principal_amount DECIMAL(15, 2) NOT NULL,
    new_interest_rate DECIMAL(5, 4) NOT NULL,
    new_duration INTEGER NOT NULL,
    new_monthly_payment_amount DECIMAL(15, 2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    request_date DATE NOT NULL,
    approval_date DATE,
    approved_by VARCHAR(255),
    new_loan_id UUID REFERENCES loans(id),
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_loan_restructurings_loan ON loan_restructurings(loan_id);
CREATE INDEX idx_loan_restructurings_status ON loan_restructurings(status);

-- Payroll Deductions Table
CREATE TABLE payroll_deductions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id),
    deduction_month DATE NOT NULL,
    deduction_amount_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    generated_date DATE NOT NULL,
    confirmed_date DATE,
    confirmed_amount_amount DECIMAL(15, 2),
    employer_reference VARCHAR(255),
    failure_reason TEXT,
    processed_by VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_payroll_deductions_member ON payroll_deductions(member_id);
CREATE INDEX idx_payroll_deductions_month ON payroll_deductions(deduction_month);
CREATE INDEX idx_payroll_deductions_status ON payroll_deductions(status);

-- Documents Table
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id UUID,
    upload_date TIMESTAMP NOT NULL,
    uploaded_by VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(255),
    description VARCHAR(1000),
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    error_message VARCHAR(1000)
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
