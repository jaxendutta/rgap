-- File: sql/sp/sp_recipient_details.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_recipient_details$
CREATE PROCEDURE sp_recipient_details(
    IN p_recipient_id INT
)
BEGIN
    -- Get recipient basic info with aggregated stats
    SELECT 
        r.*,
        i.name AS research_organization_name,
        i.type AS institute_type,
        i.city,
        i.province,
        i.country,
        i.postal_code,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.org) as funding_agencies_count
    FROM Recipient r
    LEFT JOIN Institute i ON r.institute_id = i.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN Organization o ON rg.org = o.org
    WHERE r.recipient_id = p_recipient_id
    GROUP BY r.recipient_id, i.name, i.type, i.city, i.province, i.country, i.postal_code;

    -- Get recipient's grants with enhanced program information
    SELECT
        rg.*,
        o.org as org,
        o.org_title,
        p.name_en as prog_title_en,
        p.purpose_en as prog_purpose_en,
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
    JOIN (
        SELECT 
            t.ref_number,
            MAX(CAST(t.amendment_number AS UNSIGNED)) AS latest_amendment
        FROM ResearchGrant t
        WHERE t.recipient_id = p_recipient_id
        GROUP BY t.ref_number
    ) AS tla ON rg.ref_number = tla.ref_number AND rg.amendment_number = tla.latest_amendment
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE rg.recipient_id = p_recipient_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency with more details
    SELECT 
        YEAR(rg.agreement_start_date) as year,
        o.org as agency,
        COUNT(rg.grant_id) as grant_count,
        SUM(rg.agreement_value) as total_value,
        AVG(rg.agreement_value) as avg_value,
        COUNT(DISTINCT p.prog_id) as program_count
    FROM ResearchGrant rg
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE rg.recipient_id = p_recipient_id
    GROUP BY YEAR(rg.agreement_start_date), o.org
    ORDER BY year, agency;
END$
DELIMITER ;