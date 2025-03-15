-- File: sql/data/import_data.sql
SET FOREIGN_KEY_CHECKS = 0;
SET SESSION MAX_EXECUTION_TIME = 300000; -- 5 minutes timeout

-- Insert Organizations first, rename owner_org_title to org_title
INSERT IGNORE INTO Organization (org, org_title)
SELECT DISTINCT 
    org,
    owner_org_title
FROM temp_grants
WHERE org IS NOT NULL;

-- Insert Programs with a simpler ID format for safety
INSERT IGNORE INTO Program (name_en, purpose_en, naics_identifier)
SELECT DISTINCT
    prog_name_en,
    prog_purpose_en,
    naics_identifier
FROM temp_grants
WHERE prog_name_en IS NOT NULL;

-- Insert Institutes with all location data
INSERT IGNORE INTO Institute (
    name,
    type,
    country,
    province,
    city,
    postal_code,
    riding_name_en,
    riding_name_fr,
    riding_number
)
SELECT DISTINCT
    COALESCE(NULLIF(TRIM(research_organization_name), ''), 'Unknown Institution'),
    CASE 
        WHEN research_organization_name LIKE '%University%' OR research_organization_name LIKE '%Université%' THEN 'University'
        WHEN research_organization_name LIKE '%College%' THEN 'College'
        WHEN research_organization_name LIKE '%Hospital%' OR research_organization_name LIKE '%Health%' THEN 'Hospital/Healthcare'
        WHEN research_organization_name LIKE '%Institute%' THEN 'Research Institute'
        WHEN research_organization_name LIKE '%Center%' OR research_organization_name LIKE '%Centre%' THEN 'Research Center'
        ELSE 'Academic Institution'
    END,
    recipient_country,
    recipient_province,
    recipient_city,
    recipient_postal_code,
    federal_riding_name_en,
    federal_riding_name_fr,
    federal_riding_number
FROM temp_grants
WHERE research_organization_name IS NOT NULL;

-- Insert Recipients with institute references but without location duplicates
INSERT IGNORE INTO Recipient (
    legal_name,
    institute_id,
    type,
    recipient_type
)
SELECT DISTINCT
    COALESCE(NULLIF(TRIM(recipient_legal_name), ''), 'Unknown'),
    i.institute_id,
    CASE
        WHEN recipient_type = 'P' THEN 'Individual'
        WHEN recipient_type = 'G' THEN 'Government'
        WHEN recipient_type = 'A' THEN 'Academia'
        ELSE 'Other'
    END, 
    CASE recipient_type
        WHEN 'P' THEN 'Individual or sole proprietorships'
        WHEN 'G' THEN 'Government'
        WHEN 'A' THEN 'Academia'
        ELSE 'Other'
    END
FROM temp_grants tg
LEFT JOIN Institute i ON 
    i.name = COALESCE(NULLIF(TRIM(tg.research_organization_name), ''), 'Unknown Institution')
WHERE recipient_legal_name IS NOT NULL;

-- Create a temporary table to handle duplicates correctly
CREATE TEMPORARY TABLE IF NOT EXISTS temp_grants_deduped AS
SELECT 
    tg.ref_number,
    tg.amendment_number,
    tg.amendment_date,
    tg.agreement_type,
    tg.agreement_number,
    tg.agreement_value,
    tg.foreign_currency_type,
    tg.foreign_currency_value,
    tg.agreement_start_date,
    tg.agreement_end_date,
    tg.agreement_title_en,
    tg.agreement_title_fr,
    tg.description_en,
    tg.description_fr,
    tg.expected_results_en,
    tg.expected_results_fr,
    tg.org,
    r.recipient_id,
    p.prog_id,
    ROW_NUMBER() OVER (PARTITION BY tg.ref_number, COALESCE(tg.amendment_number, '0') ORDER BY tg.agreement_value DESC) as rn
FROM temp_grants tg
LEFT JOIN Recipient r ON 
    r.legal_name = COALESCE(NULLIF(TRIM(tg.recipient_legal_name), ''), 'Unknown')
LEFT JOIN Program p ON 
    p.name_en = tg.prog_name_en
WHERE tg.ref_number IS NOT NULL;

-- Insert Grants with proper relationships using the deduplicated data
INSERT IGNORE INTO ResearchGrant (
    ref_number,
    amendment_number,
    amendment_date,
    agreement_type,
    agreement_number,
    agreement_value,
    foreign_currency_type,
    foreign_currency_value,
    agreement_start_date,
    agreement_end_date,
    agreement_title_en,
    agreement_title_fr,
    description_en,
    description_fr,
    expected_results_en,
    expected_results_fr,
    org,
    recipient_id,
    prog_id
)
SELECT 
    ref_number,
    COALESCE(amendment_number, '0'),  -- Use '0' for NULL amendment numbers
    CASE 
        WHEN amendment_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(amendment_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    agreement_type,
    agreement_number,
    CAST(NULLIF(REGEXP_REPLACE(COALESCE(agreement_value, '0'), '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    foreign_currency_type,
    CAST(NULLIF(REGEXP_REPLACE(COALESCE(foreign_currency_value, '0'), '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    CASE 
        WHEN agreement_start_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(agreement_start_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    CASE 
        WHEN agreement_end_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(agreement_end_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    agreement_title_en,
    agreement_title_fr,
    description_en,
    description_fr,
    expected_results_en,
    expected_results_fr,
    org,
    recipient_id,
    prog_id
FROM temp_grants_deduped
WHERE rn = 1;  -- Only take the first row for each ref_number and amendment_number combination

-- Drop the temporary table
DROP TEMPORARY TABLE IF EXISTS temp_grants_deduped;

-- Debug info - print count of grants loaded
SELECT COUNT(*) AS 'Grants Loaded' FROM ResearchGrant;

-- Clean up
DROP TABLE temp_grants;