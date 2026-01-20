-- database/schema.sql

-- ============================================================================
-- Organizations Table (Static Reference Data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
    org VARCHAR(5) PRIMARY KEY,
    org_fr VARCHAR(5) NOT NULL UNIQUE,
    org_title_en VARCHAR(100) NOT NULL UNIQUE,
    org_title_fr VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO organizations (org, org_fr, org_title_en, org_title_fr) VALUES
    ('NSERC', 'CRSNG', 'Natural Sciences and Engineering Research Council', 'Conseil de recherches en sciences naturelles et en génie du Canada'),
    ('CIHR', 'IRSC', 'Canadian Institutes of Health Research', 'Instituts de recherche en santé du Canada'),
    ('SSHRC', 'CRSH', 'Social Sciences and Humanities Research Council', 'Conseil de recherches en sciences humaines du Canada');

-- ============================================================================
-- Programs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS programs (
    prog_id SERIAL PRIMARY KEY,
    prog_title_en VARCHAR(255) UNIQUE NOT NULL,
    prog_purpose_en TEXT,
    org VARCHAR(5),
    FOREIGN KEY (org) REFERENCES organizations(org) ON DELETE SET NULL
);

CREATE INDEX idx_programs_org ON programs(org);
CREATE INDEX idx_programs_title ON programs(prog_title_en);

-- ============================================================================
-- Institutes Table (RELAXED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS institutes (
    institute_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(50) DEFAULT 'CA',  -- Changed from VARCHAR(2) to 50
    province VARCHAR(50),              -- Changed from VARCHAR(2) to 50
    city VARCHAR(100),
    postal_code VARCHAR(10),
    CONSTRAINT uq_institute_location UNIQUE (name, city, country)
);

CREATE INDEX idx_institutes_name ON institutes(name);
CREATE INDEX idx_institutes_location ON institutes(province, city);

-- ============================================================================
-- Recipients Table (RELAXED)
-- ============================================================================
CREATE TABLE IF NOT EXISTS recipients (
    recipient_id SERIAL PRIMARY KEY,
    type VARCHAR(1),
    business_number VARCHAR(50),
    legal_name VARCHAR(255) NOT NULL,
    operating_name VARCHAR(255),
    institute_id INTEGER NOT NULL,
    
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE RESTRICT,
    CONSTRAINT uq_recipient_institute UNIQUE (legal_name, institute_id)
);

CREATE INDEX idx_recipients_legal_name ON recipients(legal_name);
CREATE INDEX idx_recipients_type ON recipients(type);
CREATE INDEX idx_recipients_institute ON recipients(institute_id);

-- ============================================================================
-- Grants Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS grants (
    grant_id SERIAL PRIMARY KEY,
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15, 2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15, 2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    
    -- Foreign keys
    recipient_id INTEGER NOT NULL,
    prog_id INTEGER,
    org VARCHAR(5),
    
    -- Amendments history as JSONB
    amendments_history JSONB,
    
    FOREIGN KEY (recipient_id) REFERENCES recipients(recipient_id) ON DELETE RESTRICT,
    FOREIGN KEY (prog_id) REFERENCES programs(prog_id) ON DELETE SET NULL,
    FOREIGN KEY (org) REFERENCES organizations(org) ON DELETE SET NULL
);

CREATE INDEX idx_grants_recipient ON grants(recipient_id);
CREATE INDEX idx_grants_program ON grants(prog_id);
CREATE INDEX idx_grants_org ON grants(org);
CREATE INDEX idx_grants_date ON grants(agreement_start_date DESC);
CREATE INDEX idx_grants_value ON grants(agreement_value DESC);
CREATE INDEX idx_grants_ref ON grants(ref_number);

-- Full text search
CREATE INDEX idx_grants_title_search ON grants USING GIN (to_tsvector('english', COALESCE(agreement_title_en, '')));
CREATE INDEX idx_grants_amendments ON grants USING GIN (amendments_history);

-- ============================================================================
-- Users & Authentication
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    pending_email VARCHAR(100),
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- Session & Security
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_agent TEXT,
    ip_address VARCHAR(45),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'NAME_CHANGE', 'EMAIL_CHANGE', 'PASSWORD_CHANGE', 'LOGIN'
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL,
    expires TIMESTAMP NOT NULL
);

-- ============================================================================
-- Bookmarks & History (Standard)
-- ============================================================================
CREATE TABLE IF NOT EXISTS bookmarked_grants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    grant_id INTEGER NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (grant_id) REFERENCES grants(grant_id) ON DELETE CASCADE,
    UNIQUE(user_id, grant_id)
);

CREATE TABLE IF NOT EXISTS bookmarked_recipients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES recipients(recipient_id) ON DELETE CASCADE,
    UNIQUE(user_id, recipient_id)
);

CREATE TABLE IF NOT EXISTS bookmarked_institutes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    institute_id INTEGER NOT NULL,
    bookmarked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (institute_id) REFERENCES institutes(institute_id) ON DELETE CASCADE,
    UNIQUE(user_id, institute_id)
);

CREATE TABLE IF NOT EXISTS search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    search_query TEXT NOT NULL,
    filters JSONB,
    result_count INTEGER,
    searched_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_date ON search_history(searched_at DESC);