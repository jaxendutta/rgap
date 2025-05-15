-- File: sql/indexes/create_indexes.sql
/*
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
*/

-- PostgreSQL version of create_indexes.sql
-- Performance indexes for RGAP database

-- Extensions required for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Indexes for ResearchGrant
CREATE INDEX IF NOT EXISTS idx_grant_latest_amendment ON "ResearchGrant" (latest_amendment_number);
CREATE INDEX IF NOT EXISTS idx_grant_dates ON "ResearchGrant" (agreement_start_date, agreement_end_date);
CREATE INDEX IF NOT EXISTS idx_grant_value ON "ResearchGrant" (agreement_value);
CREATE INDEX IF NOT EXISTS idx_grant_owner ON "ResearchGrant" (org);
CREATE INDEX IF NOT EXISTS idx_grant_recipient ON "ResearchGrant" (recipient_id);
CREATE INDEX IF NOT EXISTS idx_grant_program ON "ResearchGrant" (prog_id);
CREATE INDEX IF NOT EXISTS idx_grant_title_trgm ON "ResearchGrant" USING gin (agreement_title_en gin_trgm_ops);

-- Indexes for Recipient
CREATE INDEX IF NOT EXISTS idx_recipient_legal_name_trgm ON "Recipient" USING gin (legal_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_recipient_institute ON "Recipient" (institute_id);

-- Indexes for Institute
CREATE INDEX IF NOT EXISTS idx_institute_name_trgm ON "Institute" USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_institute_location ON "Institute" (country, province, city);

-- Indexes for SearchHistory
CREATE INDEX IF NOT EXISTS idx_search_time ON "SearchHistory" (search_time);
CREATE INDEX IF NOT EXISTS idx_search_user ON "SearchHistory" (user_id);
CREATE INDEX IF NOT EXISTS idx_search_bookmarked ON "SearchHistory" (user_id, bookmarked);

-- Indexes for search terms
CREATE INDEX IF NOT EXISTS idx_time_grant ON "SearchHistory" (search_time, normalized_grant);
CREATE INDEX IF NOT EXISTS idx_time_recipient ON "SearchHistory" (search_time, normalized_recipient);
CREATE INDEX IF NOT EXISTS idx_time_institution ON "SearchHistory" (search_time, normalized_institution);