-- File: sql/data/import_data.sql
-- Purpose: Transform data from temp_grants table into normalized schema
-- Heavily optimized for MySQL 8.0.41 and large datasets

-- Even more aggressive performance settings
SET SESSION sql_mode = '';
SET SESSION unique_checks = 0;
SET SESSION foreign_key_checks = 0;

-- Start transaction for consistency
START TRANSACTION;

-- ========================================================================
-- STEP 1: Insert Organizations (Funding Agencies)
-- ========================================================================
INSERT IGNORE INTO Organization (org, org_title)
SELECT DISTINCT 
    org,
    org_title
FROM temp_grants
WHERE org IS NOT NULL AND org != '';

-- Print out success message
SELECT 'Organizations inserted: ', ROW_COUNT() AS 'Rows inserted';

-- ========================================================================
-- STEP 2: Insert Programs
-- ========================================================================
INSERT IGNORE INTO Program (name_en, purpose_en, naics_identifier)
SELECT DISTINCT
    prog_name_en,
    prog_purpose_en,
    naics_identifier
FROM temp_grants
WHERE prog_name_en IS NOT NULL AND prog_name_en != '';

-- Print out success message
SELECT 'Programs inserted: ', ROW_COUNT() AS 'Rows inserted';

-- ========================================================================
-- STEP 3: Insert Institutes
-- ========================================================================
-- Create memory table for batch processing
CREATE TEMPORARY TABLE IF NOT EXISTS distinct_institutes (
    name VARCHAR(255) NOT NULL,
    country VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    riding_name_en VARCHAR(100),
    riding_number VARCHAR(10),
    PRIMARY KEY (name, country, province)
) ENGINE=MEMORY;

-- Get only distinct institutes with a single scan
INSERT IGNORE INTO distinct_institutes
SELECT DISTINCT
    research_organization_name,
    recipient_country,
    recipient_province,
    recipient_city,
    recipient_postal_code,
    federal_riding_name_en,
    federal_riding_number
FROM temp_grants
WHERE research_organization_name IS NOT NULL 
AND research_organization_name != ''
LIMIT 1000000; -- Safety limit

-- Insert from memory table in a single operation
INSERT IGNORE INTO Institute (name, country, province, city, postal_code, riding_name_en, riding_number)
SELECT * FROM distinct_institutes;

-- Create a memory lookup table for faster institute references
CREATE TEMPORARY TABLE IF NOT EXISTS institute_lookup (
    name VARCHAR(255) NOT NULL,
    country VARCHAR(50),
    province VARCHAR(50),
    institute_id INT UNSIGNED,
    PRIMARY KEY (name, country, province)
) ENGINE=MEMORY;

INSERT INTO institute_lookup
SELECT name, country, province, institute_id FROM Institute;

-- Print out success message
SELECT 'Institutes inserted: ', ROW_COUNT() AS 'Rows inserted';

-- ========================================================================
-- STEP 4: Insert Recipients - Heavily optimized
-- ========================================================================
-- Create a memory table for unique recipient-institute combinations
DROP TEMPORARY TABLE IF EXISTS temp_recipients;
CREATE TEMPORARY TABLE temp_recipients (
    legal_name VARCHAR(255) NOT NULL,
    institute_id INT UNSIGNED,
    type VARCHAR(50),
    PRIMARY KEY (legal_name, institute_id)
) ENGINE=MEMORY;

-- Simple mapping approach with reduced joins
INSERT IGNORE INTO temp_recipients
SELECT 
    tg.recipient_legal_name AS legal_name,
    i.institute_id,
    tg.recipient_type AS type
FROM temp_grants tg
JOIN institute_lookup i ON tg.research_organization_name = i.name 
  AND (tg.recipient_country = i.country OR (tg.recipient_country IS NULL AND i.country IS NULL))
  AND (tg.recipient_province = i.province OR (tg.recipient_province IS NULL AND i.province IS NULL))
WHERE tg.recipient_legal_name IS NOT NULL 
  AND tg.recipient_legal_name != ''
  AND tg.research_organization_name IS NOT NULL
  AND tg.research_organization_name != ''
GROUP BY tg.recipient_legal_name, i.institute_id
LIMIT 1000000; -- Safety limit

-- Faster insert without unnecessary checks
INSERT IGNORE INTO Recipient (legal_name, institute_id, type)
SELECT tr.legal_name, tr.institute_id, tr.type
FROM temp_recipients tr;

-- Create a lookup table for recipients
DROP TEMPORARY TABLE IF EXISTS recipient_lookup;
CREATE TEMPORARY TABLE recipient_lookup (
    legal_name VARCHAR(255) NOT NULL,
    institute_id INT UNSIGNED,
    recipient_id INT UNSIGNED,
    PRIMARY KEY (legal_name, institute_id)
) ENGINE=MEMORY;

INSERT INTO recipient_lookup
SELECT r.legal_name, r.institute_id, r.recipient_id
FROM Recipient r;

-- Print out success message
SELECT 'Recipients inserted: ', ROW_COUNT() AS 'Rows inserted';

-- ========================================================================
-- STEP 5: Insert Grants - Batch processing for speed
-- ========================================================================
-- Pre-process grants in batches
DROP TEMPORARY TABLE IF EXISTS grants_to_insert;
CREATE TEMPORARY TABLE grants_to_insert (
    ref_number VARCHAR(50),
    latest_amendment_number INT UNSIGNED,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    org VARCHAR(5),
    recipient_id INT UNSIGNED,
    prog_id INT UNSIGNED,
    amendments_history JSON,
    KEY (recipient_id),
    KEY (prog_id)
) ENGINE=InnoDB; -- Use InnoDB for this one as it might be large

-- Simplified data conversion with fewer joins
INSERT INTO grants_to_insert
SELECT 
    tg.ref_number,
    NULLIF(CAST(NULLIF(tg.latest_amendment_number, '') AS UNSIGNED), 0),
    STR_TO_DATE(NULLIF(tg.amendment_date, ''), '%Y-%m-%d'),
    tg.agreement_number,
    CAST(NULLIF(REPLACE(REPLACE(tg.agreement_value, ',', ''), '$', ''), '') AS DECIMAL(15,2)),
    tg.foreign_currency_type,
    CAST(NULLIF(REPLACE(REPLACE(tg.foreign_currency_value, ',', ''), '$', ''), '') AS DECIMAL(15,2)),
    STR_TO_DATE(NULLIF(tg.agreement_start_date, ''), '%Y-%m-%d'),
    STR_TO_DATE(NULLIF(tg.agreement_end_date, ''), '%Y-%m-%d'),
    tg.agreement_title_en,
    tg.description_en,
    tg.expected_results_en,
    tg.org,
    r.recipient_id,
    p.prog_id,
    NULL -- Skip JSON processing for now
FROM temp_grants tg
LEFT JOIN institute_lookup i ON tg.research_organization_name = i.name
LEFT JOIN recipient_lookup r ON tg.recipient_legal_name = r.legal_name AND i.institute_id = r.institute_id
LEFT JOIN Program p ON tg.prog_name_en = p.name_en
WHERE tg.ref_number IS NOT NULL
LIMIT 1000000; -- Safety limit to prevent runaway processes

-- Final insert in batches
INSERT INTO ResearchGrant (
    ref_number, latest_amendment_number, amendment_date, agreement_number,
    agreement_value, foreign_currency_type, foreign_currency_value,
    agreement_start_date, agreement_end_date, agreement_title_en,
    description_en, expected_results_en, org, recipient_id, prog_id
)
SELECT 
    ref_number, latest_amendment_number, amendment_date, agreement_number,
    agreement_value, foreign_currency_type, foreign_currency_value,
    agreement_start_date, agreement_end_date, agreement_title_en,
    description_en, expected_results_en, org, recipient_id, prog_id
FROM grants_to_insert;



-- ========================================================================
-- STEP 6: Clean up all temporary tables
-- ========================================================================
DROP TEMPORARY TABLE IF EXISTS distinct_institutes;
DROP TEMPORARY TABLE IF EXISTS institute_lookup;
DROP TEMPORARY TABLE IF EXISTS temp_recipients;
DROP TEMPORARY TABLE IF EXISTS recipient_lookup;
DROP TEMPORARY TABLE IF EXISTS grants_to_insert;

-- Restore normal MySQL settings
SET SESSION unique_checks = 1;
SET SESSION foreign_key_checks = 1;

-- Commit the transaction
COMMIT;