-- File: rgap/sql/data/import_data.sql
SET FOREIGN_KEY_CHECKS = 0;

-- First, import the simpler tables as before
-- Insert Organizations
INSERT IGNORE INTO Organization (org, org_title)
SELECT DISTINCT 
    org,
    owner_org_title
FROM temp_grants
WHERE org IS NOT NULL;

-- Insert Programs
INSERT IGNORE INTO Program (name_en, purpose_en, naics_identifier)
SELECT DISTINCT
    prog_name_en,
    prog_purpose_en,
    naics_identifier
FROM temp_grants
WHERE prog_name_en IS NOT NULL;

-- Insert Institutes
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

-- Insert Recipients
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

-- Now, let's simplify the grants import by using a minimal insert with just essential fields
-- This focuses on getting the basic data loaded without complex transformations
INSERT IGNORE INTO ResearchGrant (
    ref_number,
    amendment_number,
    agreement_type,
    agreement_number,
    agreement_value,
    agreement_start_date,
    agreement_end_date,
    agreement_title_en,
    org,
    recipient_id
)
SELECT DISTINCT
    tg.ref_number,
    COALESCE(tg.amendment_number, '0'),
    tg.agreement_type,
    tg.agreement_number,
    CAST(NULLIF(REGEXP_REPLACE(COALESCE(tg.agreement_value, '0'), '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    CASE 
        WHEN tg.agreement_start_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(tg.agreement_start_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    CASE 
        WHEN tg.agreement_end_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(tg.agreement_end_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    tg.agreement_title_en,
    tg.org,
    r.recipient_id
FROM temp_grants tg
LEFT JOIN Recipient r ON 
    r.legal_name = COALESCE(NULLIF(TRIM(tg.recipient_legal_name), ''), 'Unknown')
WHERE tg.ref_number IS NOT NULL;

-- Debug info - print count of grants loaded
SELECT COUNT(*) AS 'Grants Loaded' FROM ResearchGrant;

-- Clean up
DROP TABLE temp_grants;
SET FOREIGN_KEY_CHECKS = 1;