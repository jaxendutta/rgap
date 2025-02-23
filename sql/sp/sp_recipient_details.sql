-- File: sql/sp/sp_recipient_details.sql
DELIMITER $$
CREATE PROCEDURE sp_recipient_details(
    IN p_recipient_id INT
)
BEGIN
    -- Get recipient basic info with aggregated stats
    SELECT 
        r.*,
        COUNT(DISTINCT rg.grant_id) as total_grants,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.abbreviation) as funding_agencies_count
    FROM Recipient r
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN Organization o ON rg.owner_org = o.owner_org
    WHERE r.recipient_id = p_recipient_id
    GROUP BY r.recipient_id;

    -- Get recipient's grants
    SELECT
        rg.*,
        o.abbreviation as org,
        o.org_title,
        p.name_en as program_name,
        p.purpose_en as program_purpose
    FROM ResearchGrant rg
    JOIN Organization o ON rg.owner_org = o.owner_org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE rg.recipient_id = p_recipient_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency
    SELECT 
        YEAR(rg.agreement_start_date) as year,
        o.abbreviation as agency,
        COUNT(rg.grant_id) as grant_count,
        SUM(rg.agreement_value) as total_value,
        AVG(rg.agreement_value) as avg_value
    FROM ResearchGrant rg
    JOIN Organization o ON rg.owner_org = o.owner_org
    WHERE rg.recipient_id = p_recipient_id
    GROUP BY YEAR(rg.agreement_start_date), o.abbreviation
    ORDER BY year, agency;
END $$
DELIMITER ;