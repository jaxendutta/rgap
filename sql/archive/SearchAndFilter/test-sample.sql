-- search for Waterloo, year in 2019, agreement value between 10000 and 50000, agency NSERC, location in ON, CA
SELECT 
    rg.grant_id,
    rg.ref_number,
    r.legal_name AS recipient,
    r.research_organization_name AS institute,
    rg.agreement_title_en AS `grant`,
    rg.agreement_value AS `value`,
    YEAR(rg.agreement_start_date) AS startDate,
    YEAR(rg.agreement_end_date) AS endDate,
    r.city,
    r.province,
    o.abbreviation AS agency
FROM ResearchGrant rg
JOIN Recipient r ON rg.recipient_id = r.recipient_id
NATURAL JOIN Organization o
WHERE 1=1
AND r.research_organization_name LIKE '%waterloo%'

-- Year Filter
AND YEAR(rg.agreement_start_date) = 2019

-- Agency Filter
AND o.abbreviation = 'NSERC'

-- Value Filter
AND rg.agreement_value BETWEEN 10000 AND 50000

-- Location Filters
AND r.country = 'CA'
AND r.province = 'ON'
-- Sorting
ORDER BY `value` DESC;





-- search for Waterloo, year in 2019, agreement value between 0 and 500000, agency NSERC, location in ON, CA
SELECT 
    rg.grant_id,
    rg.ref_number,
    r.legal_name AS recipient,
    r.research_organization_name AS institute,
    rg.agreement_title_en AS `grant`,
    rg.agreement_value AS `value`,
    YEAR(rg.agreement_start_date) AS startDate,
    YEAR(rg.agreement_end_date) AS endDate,
    r.city,
    r.province,
    o.abbreviation AS agency
FROM ResearchGrant rg
JOIN Recipient r ON rg.recipient_id = r.recipient_id
NATURAL JOIN Organization o
WHERE 1=1
AND r.research_organization_name LIKE '%waterloo%'

-- Year Filter
AND YEAR(rg.agreement_start_date) = 2019

-- Agency Filter
AND o.abbreviation = 'NSERC'

-- Value Filter
AND rg.agreement_value BETWEEN 0 AND 500000

-- Location Filters
AND r.country = 'CA'
AND r.province = 'ON'
-- Sorting
ORDER BY `value` DESC;



-- search for iris, year in 2019, agreement value between 0 and 500000, agency NSERC, location in ON, CA
SELECT 
    rg.grant_id,
    rg.ref_number,
    r.legal_name AS recipient,
    r.research_organization_name AS institute,
    rg.agreement_title_en AS `grant`,
    rg.agreement_value AS `value`,
    YEAR(rg.agreement_start_date) AS startDate,
    YEAR(rg.agreement_end_date) AS endDate,
    r.city,
    r.province,
    o.abbreviation AS agency
FROM ResearchGrant rg
JOIN Recipient r ON rg.recipient_id = r.recipient_id
NATURAL JOIN Organization o
WHERE 1=1
AND r.research_organization_name LIKE '%iris%'

-- Year Filter
AND YEAR(rg.agreement_start_date) = 2019

-- Agency Filter
AND o.abbreviation = 'NSERC'

-- Value Filter
AND rg.agreement_value BETWEEN 0 AND 500000

-- Location Filters
AND r.country = 'CA'
AND r.province = 'ON'
-- Sorting
ORDER BY `value` DESC;



