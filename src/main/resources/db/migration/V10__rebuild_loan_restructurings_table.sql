-- Rebuild loan_restructurings table to match the LoanRestructuring entity
-- The original V2 schema used different column names (loan_id, reason, etc.)
-- The entity was redesigned to use original_loan_id, restructuring_reason, etc.

DROP TABLE IF EXISTS loan_restructurings CASCADE;

CREATE TABLE loan_restructurings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    original_loan_id UUID NOT NULL REFERENCES loans(id),
    new_loan_id UUID REFERENCES loans(id),
    member_id UUID NOT NULL REFERENCES members(id),

    restructuring_reason TEXT NOT NULL,

    outstanding_at_restructure_amount DECIMAL(15, 2),
    outstanding_at_restructure_currency VARCHAR(3) DEFAULT 'ETB',

    new_duration_months INTEGER,
    new_interest_rate DECIMAL(5, 4),

    new_monthly_payment_amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'ETB',

    request_date TIMESTAMP NOT NULL,
    requested_by VARCHAR(255) NOT NULL,

    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    approval_date TIMESTAMP,
    approved_by VARCHAR(255),
    denial_reason TEXT,

    config_version INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_loan_restructurings_original_loan ON loan_restructurings(original_loan_id);
CREATE INDEX idx_loan_restructurings_member ON loan_restructurings(member_id);
CREATE INDEX idx_loan_restructurings_status ON loan_restructurings(status);
