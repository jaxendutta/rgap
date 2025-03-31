-- File: sql/indexes/create_indexes.sql
USE rgap;

-- Indexes for ResearchGrant
CREATE INDEX idx_grant_latest_amendment ON ResearchGrant(latest_amendment_number);
CREATE INDEX idx_grant_dates ON ResearchGrant(agreement_start_date, agreement_end_date);
CREATE INDEX idx_grant_value ON ResearchGrant(agreement_value);
CREATE INDEX idx_grant_owner ON ResearchGrant(org);
CREATE INDEX idx_grant_recipient ON ResearchGrant(recipient_id);
CREATE INDEX idx_grant_program ON ResearchGrant(prog_id);

-- Indexes for Recipient

-- Indexes for Institute
CREATE INDEX idx_institute_name ON Institute(name);
CREATE INDEX idx_institute_location ON Institute(country, province, city);

-- Indexes for SearchHistory
CREATE INDEX idx_search_time ON SearchHistory(search_time);
CREATE INDEX idx_search_user ON SearchHistory(user_id);

-- Indexes for PopularSearch
CREATE INDEX idx_time_grant ON SearchHistory(search_time, search_grant);
CREATE INDEX idx_time_recipient ON SearchHistory(search_time, search_recipient);
CREATE INDEX idx_time_institution ON SearchHistory(search_time, search_institution);
