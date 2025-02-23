-- File: sql/indexes/create_indexes.sql
USE rgap;

-- Indexes for ResearchGrant
CREATE INDEX idx_grant_ref ON ResearchGrant(ref_number, amendment_number);
CREATE INDEX idx_grant_dates ON ResearchGrant(agreement_start_date, agreement_end_date);
CREATE INDEX idx_grant_value ON ResearchGrant(agreement_value);
CREATE INDEX idx_grant_owner ON ResearchGrant(owner_org);
CREATE INDEX idx_grant_recipient ON ResearchGrant(recipient_id);

-- Indexes for Recipient
CREATE INDEX idx_recipient_name ON Recipient(legal_name, research_organization_name);
CREATE INDEX idx_recipient_location ON Recipient(country, province, city);

-- Indexes for SearchHistory
CREATE INDEX idx_search_time ON SearchHistory(search_time);
CREATE INDEX idx_search_user ON SearchHistory(user_id);