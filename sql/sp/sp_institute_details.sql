-- File: sql/sp/sp_institute_details.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_institute_details$$
CREATE PROCEDURE sp_institute_details(
    IN p_institute_id INT
)
BEGIN
    -- Get institute basic info with aggregated stats
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as total_recipients,
        COUNT(DISTINCT rg.grant_id) as total_grants,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.org) as funding_agencies_count
    FROM Institute i
    LEFT JOIN Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN Organization o ON rg.org = o.org
    WHERE i.institute_id = p_institute_id
    GROUP BY i.institute_id;

    -- Get institute's recipients with funding info
    SELECT
        r.*,
        COUNT(DISTINCT rg.grant_id) as grants_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM Recipient r
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE r.institute_id = p_institute_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC;

    -- Get institute's grants with consolidated amendments and improved program information
    SELECT
        rg.*,
        r.legal_name as recipient_name,
        o.org as org,
        o.org_title,
        p.name_en as prog_title_en,  -- Standardized field name
        p.name_en as program_name,   -- Also include as program_name for backward compatibility
        p.purpose_en as program_purpose,
        (
            SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'amendment_number', a.amendment_number,
                    'amendment_date', a.amendment_date,
                    'agreement_value', a.agreement_value,
                    'agreement_start_date', a.agreement_start_date,
                    'agreement_end_date', a.agreement_end_date
                )
            )
            FROM ResearchGrant a
            WHERE a.ref_number = rg.ref_number
        ) AS amendments_history
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    JOIN (
        SELECT 
            t.ref_number,
            MAX(CAST(t.amendment_number AS UNSIGNED)) AS latest_amendment
        FROM ResearchGrant t
        JOIN Recipient tr ON t.recipient_id = tr.recipient_id
        WHERE tr.institute_id = p_institute_id
        GROUP BY t.ref_number
    ) AS tla ON rg.ref_number = tla.ref_number AND rg.amendment_number = tla.latest_amendment
    WHERE r.institute_id = p_institute_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency with improved details
    SELECT 
        YEAR(rg.agreement_start_date) as year,
        o.org as agency,
        COUNT(rg.grant_id) as grant_count,
        SUM(rg.agreement_value) as total_value,
        AVG(rg.agreement_value) as avg_value,
        COUNT(DISTINCT p.prog_id) as program_count,
        COUNT(DISTINCT r.recipient_id) as recipient_count
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE r.institute_id = p_institute_id
    GROUP BY YEAR(rg.agreement_start_date), o.org
    ORDER BY year, agency;
END$$
DELIMITER ;