-- File: sql/data/import_data.sql
-- Purpose: Transform data from temp_grants table into normalized schema
-- Heavily optimized for MySQL 8.0.41 and large datasets

-- Performance settings
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
AND research_organization_name != '';

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
  AND tg.research_organization_name != '';

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
-- STEP 5: Insert Grants - Using the existing amendments_history JSON
-- ========================================================================

-- Insert directly into ResearchGrant preserving the original amendments_history
INSERT INTO ResearchGrant (
    ref_number, latest_amendment_number, amendment_date, agreement_number,
    agreement_value, foreign_currency_type, foreign_currency_value,
    agreement_start_date, agreement_end_date, agreement_title_en,
    description_en, expected_results_en, additional_information_en, 
    org, recipient_id, prog_id, amendments_history
)
SELECT 
    tg.ref_number,
    CASE 
        WHEN tg.latest_amendment_number = '' THEN NULL
        ELSE CAST(tg.latest_amendment_number AS SIGNED)
    END,
    CASE 
        WHEN tg.amendment_date = '' THEN NULL
        ELSE STR_TO_DATE(tg.amendment_date, '%Y-%m-%d')
    END,
    tg.agreement_number,
    CASE 
        WHEN tg.agreement_value = '' THEN NULL
        ELSE CAST(REPLACE(REPLACE(tg.agreement_value, ',', ''), '$', '') AS DECIMAL(15,2))
    END,
    tg.foreign_currency_type,
    CASE 
        WHEN tg.foreign_currency_value = '' THEN NULL
        ELSE CAST(REPLACE(REPLACE(tg.foreign_currency_value, ',', ''), '$', '') AS DECIMAL(15,2))
    END,
    CASE 
        WHEN tg.agreement_start_date = '' THEN NULL
        ELSE STR_TO_DATE(tg.agreement_start_date, '%Y-%m-%d')
    END,
    CASE 
        WHEN tg.agreement_end_date = '' THEN NULL
        ELSE STR_TO_DATE(tg.agreement_end_date, '%Y-%m-%d')
    END,
    tg.agreement_title_en,
    tg.description_en,
    tg.expected_results_en,
    tg.additional_information_en,
    tg.org,
    r.recipient_id,
    p.prog_id,
    -- Handle the amendments_history JSON
    CASE 
        -- If amendments_history already exists as JSON, use it
        WHEN tg.amendments_history IS NOT NULL 
            AND tg.amendments_history != ''
            AND tg.amendments_history != 'NULL'
            AND LEFT(tg.amendments_history, 1) = '['
        THEN 
            -- Try to validate it as JSON before using
            CASE 
                WHEN JSON_VALID(tg.amendments_history) THEN tg.amendments_history
                ELSE NULL
            END
        -- Otherwise, create a basic amendment entry if we at least have start date
        WHEN tg.agreement_start_date IS NOT NULL AND tg.agreement_start_date != ''
        THEN 
            JSON_ARRAY(
                JSON_OBJECT(
                    'amendment_number', IFNULL(tg.latest_amendment_number, '0'),
                    'amendment_date', IFNULL(tg.amendment_date, tg.agreement_start_date),
                    'agreement_value', CAST(REPLACE(REPLACE(IFNULL(tg.agreement_value, '0'), ',', ''), '$', '') AS DECIMAL(15,2)),
                    'agreement_start_date', tg.agreement_start_date,
                    'agreement_end_date', IFNULL(tg.agreement_end_date, tg.agreement_start_date)
                )
            )
        ELSE NULL
    END
FROM temp_grants tg
LEFT JOIN institute_lookup i ON tg.research_organization_name = i.name
  AND (tg.recipient_country = i.country OR (tg.recipient_country IS NULL AND i.country IS NULL))
  AND (tg.recipient_province = i.province OR (tg.recipient_province IS NULL AND i.province IS NULL))
LEFT JOIN recipient_lookup r ON tg.recipient_legal_name = r.legal_name AND i.institute_id = r.institute_id
LEFT JOIN Program p ON tg.prog_name_en = p.name_en
WHERE tg.ref_number IS NOT NULL AND tg.id IS NOT NULL
  AND r.recipient_id IS NOT NULL -- Add this to ensure we only insert grants with a valid recipient
GROUP BY tg.id;  -- Use the unique ID column to avoid incorrect deduplication

-- Print out success message
SELECT 'Grants inserted: ', ROW_COUNT() AS 'Rows inserted';

-- ========================================================================
-- STEP 6: Clean up all temporary tables
-- ========================================================================
DROP TEMPORARY TABLE IF EXISTS distinct_institutes;
DROP TEMPORARY TABLE IF EXISTS institute_lookup;
DROP TEMPORARY TABLE IF EXISTS temp_recipients;
DROP TEMPORARY TABLE IF EXISTS recipient_lookup;

-- Restore normal MySQL settings
SET SESSION unique_checks = 1;
SET SESSION foreign_key_checks = 1;

-- Commit the transaction
COMMIT;