-- File: sp_recipient_details.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_recipient_details$
CREATE PROCEDURE sp_recipient_details(
    IN p_recipient_id INT,
    IN p_user_id INT UNSIGNED
)
BEGIN
    -- Get recipient basic info with aggregated stats
    SELECT 
        r.*,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        i.postal_code,
        COUNT(DISTINCT rg.grant_id) as total_grants,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.org) as funding_agencies_count,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedRecipients br WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id), 
           FALSE) AS is_bookmarked
    FROM Recipient r
    LEFT JOIN Institute i ON r.institute_id = i.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN Organization o ON rg.org = o.org
    WHERE r.recipient_id = p_recipient_id
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country, i.postal_code;

    -- Get recipient's grants with bookmark status
    SELECT
        rg.*,
        o.org as org,
        o.org_title,
        p.name_en as prog_title_en,
        p.purpose_en as prog_purpose_en,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedGrants bg WHERE bg.user_id = p_user_id AND bg.grant_id = rg.grant_id), 
           FALSE) AS is_bookmarked
    FROM ResearchGrant rg
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
*/

-- PostgreSQL version of sp_recipient_details.sql
CREATE OR REPLACE FUNCTION recipient_details(
    p_recipient_id INTEGER,
    p_user_id INTEGER
)
RETURNS SETOF RECORD 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Get recipient basic info with aggregated stats
    RETURN QUERY
    SELECT 
        r.*,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        i.postal_code,
        COUNT(DISTINCT rg.grant_id)::BIGINT as total_grants,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.org)::BIGINT as funding_agencies_count,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedRecipients" br 
            WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id
        ) AS is_bookmarked
    FROM "Recipient" r
    LEFT JOIN "Institute" i ON r.institute_id = i.institute_id
    LEFT JOIN "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN "Organization" o ON rg.org = o.org
    WHERE r.recipient_id = p_recipient_id
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country, i.postal_code;

    -- Get recipient's grants with bookmark status
    RETURN QUERY
    SELECT
        rg.*,
        o.org as org,
        o.org_title,
        p.name_en as prog_title_en,
        p.purpose_en as prog_purpose_en,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedGrants" bg 
            WHERE bg.user_id = p_user_id AND bg.grant_id = rg.grant_id
        ) AS is_bookmarked
    FROM "ResearchGrant" rg
    JOIN "Organization" o ON rg.org = o.org
    LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
    WHERE rg.recipient_id = p_recipient_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency with more details
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM rg.agreement_start_date)::INTEGER as year,
        o.org as agency,
        COUNT(rg.grant_id)::BIGINT as grant_count,
        SUM(rg.agreement_value) as total_value,
        AVG(rg.agreement_value) as avg_value,
        COUNT(DISTINCT p.prog_id)::BIGINT as program_count
    FROM "ResearchGrant" rg
    JOIN "Organization" o ON rg.org = o.org
    LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
    WHERE rg.recipient_id = p_recipient_id
    GROUP BY EXTRACT(YEAR FROM rg.agreement_start_date), o.org
    ORDER BY year, agency;
END;
$$;