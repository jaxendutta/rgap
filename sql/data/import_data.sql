-- File: sql/data/import_data.sql
-- Insert Organizations first
INSERT IGNORE INTO Organization (owner_org, org_title, abbreviation)
SELECT DISTINCT 
    owner_org,
    owner_org_title,
    org
FROM temp_grants
WHERE owner_org IS NOT NULL;

-- Insert Programs
INSERT IGNORE INTO Program (prog_id, name_en, name_fr, purpose_en, purpose_fr, naics_identifier)
SELECT DISTINCT
    prog_name_en,
    prog_name_en,
    prog_name_fr,
    prog_purpose_en,
    prog_purpose_fr,
    naics_identifier
FROM temp_grants
WHERE prog_name_en IS NOT NULL;

-- Insert Recipients with proper handling of type
INSERT IGNORE INTO Recipient (
    legal_name,
    research_organization_name,
    type,
    recipient_type,
    country,
    province,
    city,
    postal_code,
    riding_name_en,
    riding_name_fr,
    riding_number
)
SELECT DISTINCT
    COALESCE(NULLIF(TRIM(recipient_legal_name), ''), 'Unknown'),
    COALESCE(NULLIF(TRIM(research_organization_name), ''), 'Unknown Institution'),
    'Academia', -- Default type based on data 
    CASE recipient_type
        WHEN 'P' THEN 'Individual or sole proprietorships'
        WHEN 'G' THEN 'Government'
        WHEN 'A' THEN 'Academia'
        ELSE 'Other'
    END,
    recipient_country,
    recipient_province,
    recipient_city,
    recipient_postal_code,
    federal_riding_name_en,
    federal_riding_name_fr,
    federal_riding_number
FROM temp_grants
WHERE recipient_legal_name IS NOT NULL 
   OR research_organization_name IS NOT NULL;

-- Insert Grants with proper relationships
INSERT INTO ResearchGrant (
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
    owner_org,
    org,
    recipient_id,
    prog_id
)
SELECT 
    tg.ref_number,
    tg.amendment_number,
    CASE 
        WHEN tg.amendment_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(tg.amendment_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    tg.agreement_type,
    tg.agreement_number,
    CAST(NULLIF(REGEXP_REPLACE(tg.agreement_value, '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    tg.foreign_currency_type,
    CAST(NULLIF(REGEXP_REPLACE(tg.foreign_currency_value, '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    CASE 
        WHEN tg.agreement_start_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(tg.agreement_start_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    CASE 
        WHEN tg.agreement_end_date REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN STR_TO_DATE(tg.agreement_end_date, '%Y-%m-%d')
        ELSE NULL 
    END,
    tg.agreement_title_en,
    tg.agreement_title_fr,
    tg.description_en,
    tg.description_fr,
    tg.expected_results_en,
    tg.expected_results_fr,
    tg.owner_org,
    tg.org,
    r.recipient_id,
    tg.prog_name_en
FROM temp_grants tg
LEFT JOIN Recipient r ON 
    r.legal_name = COALESCE(NULLIF(TRIM(tg.recipient_legal_name), ''), 'Unknown')
    AND r.research_organization_name = COALESCE(NULLIF(TRIM(tg.research_organization_name), ''), 'Unknown Institution')
    AND r.country = tg.recipient_country
    AND r.city = tg.recipient_city
WHERE tg.ref_number IS NOT NULL;

-- Clean up
DROP TABLE temp_grants;