-- database/seeds/01-load-data.sql
-- RGAP v2 Data Loader
-- Optimized ELT Strategy: Load Raw -> Clean -> Normalize

-- ============================================================================
-- STEP 1: Create Staging Table (All TEXT to prevent load errors)
-- ============================================================================
DROP TABLE IF EXISTS temp_grants;
CREATE TEMP TABLE temp_grants (
    id TEXT,
    ref_number TEXT,
    latest_amendment_number INTEGER,
    amendment_date TEXT,
    agreement_type TEXT,
    recipient_type TEXT,
    recipient_business_number TEXT,
    recipient_legal_name TEXT,
    recipient_operating_name TEXT,
    research_organization_name TEXT,
    recipient_country TEXT,
    recipient_province TEXT,
    recipient_city TEXT,
    recipient_postal_code TEXT,
    federal_riding_name_en TEXT,
    federal_riding_name_fr TEXT,
    federal_riding_number TEXT,
    prog_name_en TEXT,
    prog_name_fr TEXT,
    prog_purpose_en TEXT,
    prog_purpose_fr TEXT,
    agreement_title_en TEXT,
    agreement_title_fr TEXT,
    agreement_number TEXT,
    agreement_value TEXT,
    foreign_currency_type TEXT,
    foreign_currency_value TEXT,
    agreement_start_date TEXT,
    agreement_end_date TEXT,
    coverage TEXT,
    description_en TEXT,
    description_fr TEXT,
    naics_identifier TEXT,
    expected_results_en TEXT,
    expected_results_fr TEXT,
    additional_information_en TEXT,
    additional_information_fr TEXT,
    org TEXT,
    org_title TEXT,
    year TEXT,
    amendments_history TEXT
);

-- ============================================================================
-- STEP 2: Load Raw CSV Data
-- ============================================================================
DO $$ BEGIN RAISE NOTICE 'Loading CSV data...'; END $$;
\copy temp_grants FROM '/data/grants.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '');

-- ============================================================================
-- STEP 3: Standardization (Best Effort)
-- ============================================================================
DO $$ BEGIN RAISE NOTICE 'Standardizing Locations...'; END $$;

-- Fix Countries (Canada/US/UK)
UPDATE temp_grants
SET recipient_country = CASE 
    WHEN recipient_country ILIKE 'Canada' THEN 'CA'
    WHEN recipient_country ILIKE 'United States%' OR recipient_country ILIKE 'USA' THEN 'US'
    WHEN recipient_country ILIKE 'United Kingdom' OR recipient_country ILIKE 'UK' THEN 'GB'
    WHEN recipient_country ILIKE 'France' THEN 'FR'
    WHEN recipient_country ILIKE 'Germany' THEN 'DE'
    -- If it's already 2 chars, uppercase it. Otherwise, Title Case it.
    WHEN LENGTH(recipient_country) = 2 THEN UPPER(recipient_country)
    ELSE INITCAP(TRIM(recipient_country))
END
WHERE recipient_country IS NOT NULL;

-- Fix Provinces (Common Canadian/US ones)
UPDATE temp_grants
SET recipient_province = CASE 
    -- Canada
    WHEN recipient_province ILIKE 'British Columbia' OR recipient_province ILIKE 'Colombie-Britannique' THEN 'BC'
    WHEN recipient_province ILIKE 'Ontario' THEN 'ON'
    WHEN recipient_province ILIKE 'Quebec' OR recipient_province ILIKE 'Québec' THEN 'QC'
    WHEN recipient_province ILIKE 'Alberta' THEN 'AB'
    WHEN recipient_province ILIKE 'Manitoba' THEN 'MB'
    WHEN recipient_province ILIKE 'Nova Scotia' THEN 'NS'
    WHEN recipient_province ILIKE 'New Brunswick' THEN 'NB'
    WHEN recipient_province ILIKE 'Saskatchewan' THEN 'SK'
    WHEN recipient_province ILIKE 'Newfoundland%' THEN 'NL'
    WHEN recipient_province ILIKE 'Prince Edward Island' THEN 'PE'
    -- US
    WHEN recipient_province ILIKE 'California' THEN 'CA'
    WHEN recipient_province ILIKE 'New York' THEN 'NY'
    WHEN recipient_province ILIKE 'Massachusetts' THEN 'MA'
    -- Default
    WHEN LENGTH(recipient_province) = 2 THEN UPPER(recipient_province)
    ELSE INITCAP(TRIM(recipient_province))
END
WHERE recipient_province IS NOT NULL;

-- ============================================================================
-- STEP 4: Performance Indexes (Speed up the Inserts)
-- ============================================================================
DO $$ BEGIN RAISE NOTICE 'Indexing staging table...'; END $$;
CREATE INDEX idx_temp_prog ON temp_grants(prog_name_en);
CREATE INDEX idx_temp_loc ON temp_grants(research_organization_name, recipient_city, recipient_country);
CREATE INDEX idx_temp_recip ON temp_grants(recipient_legal_name);

-- ============================================================================
-- STEP 5: Insert Normalized Data
-- ============================================================================
DO $$ BEGIN RAISE NOTICE 'Inserting normalized data...'; END $$;

-- Organizations
-- Already there from schema.sql

-- Programs
INSERT INTO programs (prog_title_en, prog_purpose_en, org)
SELECT DISTINCT tg.prog_name_en, tg.prog_purpose_en, o.org
FROM temp_grants tg, organizations o
WHERE tg.prog_name_en IS NOT NULL AND tg.prog_name_en != ''
ON CONFLICT (prog_title_en) DO NOTHING;

-- Institutes
INSERT INTO institutes (name, city, province, country, postal_code)
SELECT DISTINCT research_organization_name, recipient_city, recipient_province, COALESCE(recipient_country, 'CA'), recipient_postal_code
FROM temp_grants WHERE research_organization_name IS NOT NULL AND research_organization_name != ''
ON CONFLICT (name, city, country) DO NOTHING;

-- Recipients (Now handles NULL type)
INSERT INTO recipients (legal_name, operating_name, type, business_number, institute_id)
SELECT DISTINCT tg.recipient_legal_name, tg.recipient_operating_name, tg.recipient_type, tg.recipient_business_number, i.institute_id
FROM temp_grants tg
JOIN institutes i ON tg.research_organization_name = i.name AND tg.recipient_city = i.city AND COALESCE(tg.recipient_country, 'CA') = i.country
WHERE tg.recipient_legal_name IS NOT NULL AND tg.recipient_legal_name != ''
ON CONFLICT (legal_name, institute_id) DO NOTHING;

-- Grants
INSERT INTO grants (
    ref_number, latest_amendment_number, amendment_date, agreement_number,
    agreement_value, foreign_currency_type, foreign_currency_value,
    agreement_start_date, agreement_end_date, agreement_title_en,
    description_en, expected_results_en, additional_information_en,
    recipient_id, prog_id, org
)
SELECT DISTINCT
    tg.ref_number, tg.latest_amendment_number, NULLIF(tg.amendment_date, '')::DATE, tg.agreement_number,
    NULLIF(tg.agreement_value, '')::DECIMAL(15,2), tg.foreign_currency_type, NULLIF(tg.foreign_currency_value, '')::DECIMAL(15,2),
    NULLIF(tg.agreement_start_date, '')::DATE, NULLIF(tg.agreement_end_date, '')::DATE,
    tg.agreement_title_en, tg.description_en, tg.expected_results_en, tg.additional_information_en,
    r.recipient_id, p.prog_id, o.org
FROM temp_grants tg
JOIN organizations o ON tg.org = o.org
JOIN institutes i ON tg.research_organization_name = i.name AND tg.recipient_city = i.city AND COALESCE(tg.recipient_country, 'CA') = i.country
JOIN recipients r ON tg.recipient_legal_name = r.legal_name AND r.institute_id = i.institute_id
LEFT JOIN programs p ON tg.prog_name_en = p.prog_title_en
WHERE tg.ref_number IS NOT NULL AND r.recipient_id IS NOT NULL;

-- Cleanup
DROP TABLE temp_grants;

-- Needs to be wrapped in DO block
DO $$ BEGIN RAISE NOTICE 'Database Load Complete!'; END $$;