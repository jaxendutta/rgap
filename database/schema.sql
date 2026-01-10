-- RGAP PostgreSQL Database Schema
-- Version: 2.0

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================================
-- Organizations Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    org VARCHAR(5) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    
    CONSTRAINT org_code_check CHECK (org IN ('NSERC', 'CIHR', 'SSHRC'))
);

-- Insert default organizations
INSERT INTO organizations (org, title) VALUES
    ('NSERC', 'Natural Sciences and Engineering Research Council'),
    ('CIHR', 'Canadian Institutes of Health Research'),
    ('SSHRC', 'Social Sciences and Humanities Research Council')
ON CONFLICT (org) DO NOTHING;

-- ============================================================================
-- Programs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS programs (
    prog_id SERIAL PRIMARY KEY,
    prog_name_en VARCHAR(255) UNIQUE NOT NULL,
    prog_purpose_en TEXT,
    org VARCHAR(5),
    
    FOREIGN KEY (org) REFERENCES organizations(org) ON DELETE SET NULL
);

CREATE INDEX idx_programs_org ON programs(org);
CREATE INDEX idx_programs_name ON programs(prog_name_en);

-- ============================================================================
-- Institutes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutes (
    institute_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country CHAR(2) DEFAULT 'CA',
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    federal_riding_name_en VARCHAR(100),
    federal_riding_number VARCHAR(10),
    
    -- Composite Unique: The "Original Intent" definition of a unique institute
    CONSTRAINT uq_institute_location UNIQUE (name, city, country)
);

-- ============================================================================
-- Recipients Table (Linked & Locked)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipients (
    recipient_id SERIAL PRIMARY KEY,
    type CHAR(1) NOT NULL CHECK (type IN ('I', 'P')),
    business_number VARCHAR(50),
    legal_name VARCHAR(255) NOT NULL,
    operating_name VARCHAR(255),
    institute_id INTEGER NOT NULL, -- MUST have an institute
    
    -- SAFETY LOCK: PREVENT DELETION
    -- If you try to delete an Institute that has recipients, this will FAIL.
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE RESTRICT,
    
    -- Composite Unique: A recipient is unique per institute
    CONSTRAINT uq_recipient_institute UNIQUE (legal_name, institute_id)
);

CREATE INDEX idx_recipients_legal_name ON recipients(legal_name);
CREATE INDEX idx_recipients_operating_name ON recipients(operating_name);
CREATE INDEX idx_recipients_type ON recipients(type);
CREATE INDEX idx_recipients_institute ON recipients(institute_id);
CREATE INDEX idx_recipients_business_number ON recipients(business_number);

-- ============================================================================
-- Research Grants Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS research_grants (
    grant_id SERIAL PRIMARY KEY,
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value NUMERIC(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value NUMERIC(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    org VARCHAR(5),
    recipient_id INTEGER,
    prog_id INTEGER,
    amendments_history JSONB,
    
    FOREIGN KEY (recipient_id) REFERENCES recipients(recipient_id) ON DELETE CASCADE,
    FOREIGN KEY (org) REFERENCES organizations(org) ON DELETE SET NULL,
    FOREIGN KEY (prog_id) REFERENCES programs(prog_id) ON DELETE SET NULL
);

CREATE INDEX idx_grants_dates ON research_grants(agreement_start_date, agreement_end_date);
CREATE INDEX idx_grants_value ON research_grants(agreement_value);
CREATE INDEX idx_grants_org ON research_grants(org);
CREATE INDEX idx_grants_recipient ON research_grants(recipient_id);
CREATE INDEX idx_grants_ref_number ON research_grants(ref_number);
CREATE INDEX idx_grants_program ON research_grants(prog_id);
CREATE INDEX idx_grants_title ON research_grants USING gin(to_tsvector('english', agreement_title_en));

-- ============================================================================
-- User Activity Tables
-- ============================================================================

-- Bookmarked Grants
CREATE TABLE IF NOT EXISTS bookmarked_grants (
    bookmark_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    grant_id INTEGER NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (grant_id) REFERENCES research_grants(grant_id) ON DELETE CASCADE,
    UNIQUE(user_id, grant_id)
);

CREATE INDEX idx_bookmarked_grants_user ON bookmarked_grants(user_id);
CREATE INDEX idx_bookmarked_grants_grant ON bookmarked_grants(grant_id);

-- Bookmarked Recipients
CREATE TABLE IF NOT EXISTS bookmarked_recipients (
    bookmark_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES recipients(recipient_id) ON DELETE CASCADE,
    UNIQUE(user_id, recipient_id)
);

CREATE INDEX idx_bookmarked_recipients_user ON bookmarked_recipients(user_id);
CREATE INDEX idx_bookmarked_recipients_recipient ON bookmarked_recipients(recipient_id);

-- Search History
CREATE TABLE IF NOT EXISTS search_history (
    search_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    search_query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER,
    searched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(searched_at DESC);

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- Grant details with related information
CREATE OR REPLACE VIEW grant_details AS
SELECT 
    rg.grant_id,
    rg.ref_number,
    rg.latest_amendment_number,
    rg.amendment_date,
    rg.agreement_number,
    rg.agreement_value,
    rg.agreement_start_date,
    rg.agreement_end_date,
    rg.agreement_title_en,
    rg.description_en,
    r.recipient_id,
    r.legal_name AS recipient_name,
    r.type AS recipient_type,
    i.institute_id,
    i.name AS institute_name,
    i.city,
    i.province,
    i.country,
    p.prog_id,
    p.prog_name_en AS program_name,
    o.org,
    o.title AS organization_name
FROM research_grants rg
LEFT JOIN recipients r ON rg.recipient_id = r.recipient_id
LEFT JOIN institutes i ON r.institute_id = i.institute_id
LEFT JOIN programs p ON rg.prog_id = p.prog_id
LEFT JOIN organizations o ON rg.org = o.org;

-- ============================================================================
-- Functions
-- ============================================================================

-- Function to get total grants for an institute
CREATE OR REPLACE FUNCTION get_institute_grant_count(inst_id INTEGER)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM research_grants rg
    JOIN recipients r ON rg.recipient_id = r.recipient_id
    WHERE r.institute_id = inst_id;
$$ LANGUAGE SQL STABLE;

-- Function to get total funding for an institute
CREATE OR REPLACE FUNCTION get_institute_total_funding(inst_id INTEGER)
RETURNS NUMERIC AS $$
    SELECT COALESCE(SUM(rg.agreement_value), 0)
    FROM research_grants rg
    JOIN recipients r ON rg.recipient_id = r.recipient_id
    WHERE r.institute_id = inst_id;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update last_login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_login = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: The actual trigger would be created when implementing login logic
-- CREATE TRIGGER user_login_trigger
-- AFTER UPDATE ON users
-- FOR EACH ROW
-- WHEN (OLD.last_login IS DISTINCT FROM NEW.last_login)
-- EXECUTE FUNCTION update_last_login();

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE users IS 'Application users and authentication';
COMMENT ON TABLE organizations IS 'Tri-agency funding organizations';
COMMENT ON TABLE programs IS 'Research funding programs';
COMMENT ON TABLE institutes IS 'Research institutions';
COMMENT ON TABLE recipients IS 'Grant recipients (individuals or institutions)';
COMMENT ON TABLE research_grants IS 'Research grant awards';
COMMENT ON TABLE bookmarked_grants IS 'User-bookmarked grants';
COMMENT ON TABLE bookmarked_recipients IS 'User-bookmarked recipients';
COMMENT ON TABLE search_history IS 'User search history';