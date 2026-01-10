-- database/seeds/01-load-data.sql
-- Loads government grant CSV data into normalized PostgreSQL schema
-- FINAL FIX - Increased column sizes for bilingual data

-- ============================================================================
-- STEP 1: Create temporary staging table matching CSV structure
-- ============================================================================
CREATE TEMP TABLE temp_grants (
    id VARCHAR(50),
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date VARCHAR(50),
    agreement_type VARCHAR(50),
    recipient_type VARCHAR(1),
    recipient_business_number VARCHAR(50),
    recipient_legal_name VARCHAR(255),
    recipient_operating_name VARCHAR(255),
    research_organization_name VARCHAR(255),
    recipient_country VARCHAR(2),
    recipient_province VARCHAR(50),
    recipient_city VARCHAR(100),
    recipient_postal_code VARCHAR(10),
    federal_riding_name_en VARCHAR(100),
    federal_riding_name_fr VARCHAR(100),
    federal_riding_number VARCHAR(10),
    prog_name_en TEXT,  -- Changed from VARCHAR(255) to TEXT
    prog_name_fr TEXT,
    prog_purpose_en TEXT,
    prog_purpose_fr TEXT,
    agreement_title_en TEXT,
    agreement_title_fr TEXT,
    agreement_number VARCHAR(50),
    agreement_value VARCHAR(20),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value VARCHAR(20),
    agreement_start_date VARCHAR(50),
    agreement_end_date VARCHAR(50),
    coverage TEXT,
    description_en TEXT,
    description_fr TEXT,
    naics_identifier VARCHAR(10),
    expected_results_en TEXT,
    expected_results_fr TEXT,
    additional_information_en TEXT,
    additional_information_fr TEXT,
    org VARCHAR(5),
    org_title TEXT,  -- Changed from VARCHAR(100) to TEXT (bilingual names are long!)
    year VARCHAR(4),
    amendments_history TEXT
);

-- ============================================================================
-- STEP 2: Load CSV data into temp table
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Loading CSV data from /data/grants.csv...';
END $$;

\copy temp_grants FROM '/data/grants.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '');

-- Check how many rows loaded
DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM temp_grants;
    RAISE NOTICE 'Loaded % rows from CSV', row_count;
END $$;

-- ============================================================================
-- STEP 3: Insert Organizations (extract English name only)
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Inserting organizations...';
END $$;

INSERT INTO organizations (org_name_en)
SELECT DISTINCT 
    -- Extract only the English part (before the " | " separator)
    CASE 
        WHEN POSITION(' | ' IN org_title) > 0 
        THEN SUBSTRING(org_title FROM 1 FOR POSITION(' | ' IN org_title) - 1)
        ELSE org_title
    END
FROM temp_grants
WHERE org_title IS NOT NULL 
  AND org_title != ''
ON CONFLICT (org_name_en) DO NOTHING;

DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM organizations;
    RAISE NOTICE 'Organizations inserted: %', row_count;
END $$;

-- ============================================================================
-- STEP 4: Insert Programs
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Inserting programs...';
END $$;

INSERT INTO programs (prog_title_en, prog_purpose_en, org_id)
SELECT DISTINCT 
    tg.prog_name_en,
    tg.prog_purpose_en,
    o.org_id
FROM temp_grants tg
LEFT JOIN organizations o ON 
    -- Match using the English part only
    o.org_name_en = CASE 
        WHEN POSITION(' | ' IN tg.org_title) > 0 
        THEN SUBSTRING(tg.org_title FROM 1 FOR POSITION(' | ' IN tg.org_title) - 1)
        ELSE tg.org_title
    END
WHERE tg.prog_name_en IS NOT NULL 
  AND tg.prog_name_en != ''
ON CONFLICT (prog_title_en) DO NOTHING;

DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM programs;
    RAISE NOTICE 'Programs inserted: %', row_count;
END $$;

-- ============================================================================
-- STEP 5: Insert Institutes
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Inserting institutes...';
END $$;

INSERT INTO institutes (name, city, province, country, postal_code)
SELECT DISTINCT
    research_organization_name,
    recipient_city,
    recipient_province,
    COALESCE(recipient_country, 'CA'),
    recipient_postal_code
FROM temp_grants
WHERE research_organization_name IS NOT NULL 
  AND research_organization_name != ''
ON CONFLICT (name, city, country) DO NOTHING;

DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM institutes;
    RAISE NOTICE 'Institutes inserted: %', row_count;
END $$;

-- ============================================================================
-- STEP 6: Insert Recipients
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Inserting recipients...';
END $$;

INSERT INTO recipients (legal_name, operating_name, type, business_number, institute_id)
SELECT DISTINCT
    tg.recipient_legal_name,
    tg.recipient_operating_name,
    tg.recipient_type,
    tg.recipient_business_number,
    i.institute_id
FROM temp_grants tg
JOIN institutes i ON tg.research_organization_name = i.name
  AND tg.recipient_city = i.city
  AND COALESCE(tg.recipient_country, 'CA') = i.country
WHERE tg.recipient_legal_name IS NOT NULL 
  AND tg.recipient_legal_name != ''
ON CONFLICT (legal_name, institute_id) DO NOTHING;

DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM recipients;
    RAISE NOTICE 'Recipients inserted: %', row_count;
END $$;

-- ============================================================================
-- STEP 7: Insert Grants
-- ============================================================================
DO $$ 
BEGIN
    RAISE NOTICE 'Inserting grants (this may take 5-10 minutes for 457MB)...';
END $$;

INSERT INTO grants (
    ref_number,
    latest_amendment_number,
    amendment_date,
    agreement_number,
    agreement_value,
    foreign_currency_type,
    foreign_currency_value,
    agreement_start_date,
    agreement_end_date,
    agreement_title_en,
    description_en,
    expected_results_en,
    additional_information_en,
    recipient_id,
    prog_id,
    org_id
)
SELECT DISTINCT
    tg.ref_number,
    tg.latest_amendment_number,
    CASE 
        WHEN tg.amendment_date = '' THEN NULL
        ELSE tg.amendment_date::DATE
    END,
    tg.agreement_number,
    CASE 
        WHEN tg.agreement_value = '' THEN NULL
        ELSE tg.agreement_value::DECIMAL(15,2)
    END,
    tg.foreign_currency_type,
    CASE 
        WHEN tg.foreign_currency_value = '' THEN NULL
        ELSE tg.foreign_currency_value::DECIMAL(15,2)
    END,
    CASE 
        WHEN tg.agreement_start_date = '' THEN NULL
        ELSE tg.agreement_start_date::DATE
    END,
    CASE 
        WHEN tg.agreement_end_date = '' THEN NULL
        ELSE tg.agreement_end_date::DATE
    END,
    tg.agreement_title_en,
    tg.description_en,
    tg.expected_results_en,
    tg.additional_information_en,
    r.recipient_id,
    p.prog_id,
    o.org_id
FROM temp_grants tg
JOIN institutes i ON tg.research_organization_name = i.name
  AND tg.recipient_city = i.city
  AND COALESCE(tg.recipient_country, 'CA') = i.country
JOIN recipients r ON tg.recipient_legal_name = r.legal_name 
  AND i.institute_id = r.institute_id
LEFT JOIN programs p ON tg.prog_name_en = p.prog_title_en
LEFT JOIN organizations o ON 
    -- Match using English part only
    o.org_name_en = CASE 
        WHEN POSITION(' | ' IN tg.org_title) > 0 
        THEN SUBSTRING(tg.org_title FROM 1 FOR POSITION(' | ' IN tg.org_title) - 1)
        ELSE tg.org_title
    END
WHERE tg.ref_number IS NOT NULL
  AND r.recipient_id IS NOT NULL;

DO $$ 
DECLARE 
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM grants;
    RAISE NOTICE 'Grants inserted: %', row_count;
END $$;

-- ============================================================================
-- STEP 8: Show statistics
-- ============================================================================
DO $$ 
DECLARE 
    org_count INTEGER;
    prog_count INTEGER;
    inst_count INTEGER;
    recip_count INTEGER;
    grant_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO prog_count FROM programs;
    SELECT COUNT(*) INTO inst_count FROM institutes;
    SELECT COUNT(*) INTO recip_count FROM recipients;
    SELECT COUNT(*) INTO grant_count FROM grants;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Load Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Organizations: %', org_count;
    RAISE NOTICE 'Programs:      %', prog_count;
    RAISE NOTICE 'Institutes:    %', inst_count;
    RAISE NOTICE 'Recipients:    %', recip_count;
    RAISE NOTICE 'Grants:        %', grant_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- STEP 9: Cleanup
-- ============================================================================
DROP TABLE temp_grants;