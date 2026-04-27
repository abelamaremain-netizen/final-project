-- Fix collateral status column from PostgreSQL enum type to text
-- so Hibernate can store uppercase string values like 'PLEDGED', 'RELEASED', 'LIQUIDATED'

ALTER TABLE collateral ALTER COLUMN status TYPE text USING UPPER(status::text);
ALTER TABLE collateral ALTER COLUMN collateral_type TYPE text USING UPPER(collateral_type::text);
ALTER TABLE collateral ALTER COLUMN asset_type TYPE text USING UPPER(asset_type::text);
