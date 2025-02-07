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

-- Search Filters
AND r.legal_name LIKE '%search_recipient%'
AND r.research_organization_name LIKE '%search_institute%'
AND rg.agreement_title_en LIKE '%search_grant%'

-- Year Filter
AND YEAR(rg.agreement_start_date) = 'year'

-- Agency Filter
AND o.abbreviation = 'organization'

-- Value Filter
AND rg.agreement_value BETWEEN 10000 AND 50000

-- Location Filters
AND r.country = 'country'
AND r.province = 'province'
AND r.city = 'city'

-- Sorting
ORDER BY `value` DESC;
-- OR ORDER BY startDate DESC / ASC
