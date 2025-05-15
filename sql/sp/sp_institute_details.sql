-- File: sp_institute_details.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_institute_details$$
CREATE PROCEDURE sp_institute_details(
    IN p_institute_id INT,
    IN p_user_id INT UNSIGNED
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
        COUNT(DISTINCT o.org) as funding_agencies_count,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedInstitutes bi WHERE bi.user_id = p_user_id AND bi.institute_id = i.institute_id), 
           FALSE) AS is_bookmarked
    FROM Institute i
    LEFT JOIN Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN Organization o ON rg.org = o.org
    WHERE i.institute_id = p_institute_id
    GROUP BY i.institute_id;

    -- Get institute's recipients with funding info and bookmark status
    SELECT
        r.*,
        COUNT(DISTINCT rg.grant_id) as grants_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedRecipients br WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id), 
           FALSE) AS is_bookmarked
    FROM Recipient r
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE r.institute_id = p_institute_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC;

    -- Get institute's grants with bookmark status
    SELECT
        rg.*,
        r.legal_name as recipient_name,
        o.org as org,
        o.org_title,
        p.name_en as prog_title_en,
        p.purpose_en as prog_purpose_en,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedGrants bg WHERE bg.user_id = p_user_id AND bg.grant_id = rg.grant_id), 
           FALSE) AS is_bookmarked
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE r.institute_id = p_institute_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency
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
*/

-- PostgreSQL version of sp_institute_details.sql
CREATE OR REPLACE FUNCTION institute_details(
    p_institute_id INTEGER,
    p_user_id INTEGER
)
RETURNS SETOF RECORD 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Get institute basic info with aggregated stats
    RETURN QUERY
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id)::BIGINT as total_recipients,
        COUNT(DISTINCT rg.grant_id)::BIGINT as total_grants,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        COALESCE(AVG(rg.agreement_value), 0) as avg_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        COUNT(DISTINCT o.org)::BIGINT as funding_agencies_count,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedInstitutes" bi 
            WHERE bi.user_id = p_user_id AND bi.institute_id = i.institute_id
        ) AS is_bookmarked
    FROM "Institute" i
    LEFT JOIN "Recipient" r ON i.institute_id = r.institute_id
    LEFT JOIN "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    LEFT JOIN "Organization" o ON rg.org = o.org
    WHERE i.institute_id = p_institute_id
    GROUP BY i.institute_id;

    -- Get institute's recipients with funding info and bookmark status
    RETURN QUERY
    SELECT
        r.*,
        COUNT(DISTINCT rg.grant_id)::BIGINT as grants_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedRecipients" br 
            WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id
        ) AS is_bookmarked
    FROM "Recipient" r
    LEFT JOIN "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    WHERE r.institute_id = p_institute_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC;

    -- Get institute's grants with bookmark status
    RETURN QUERY
    SELECT
        rg.*,
        r.legal_name as recipient_name,
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
    JOIN "Recipient" r ON rg.recipient_id = r.recipient_id
    JOIN "Organization" o ON rg.org = o.org
    LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
    WHERE r.institute_id = p_institute_id
    ORDER BY rg.agreement_start_date DESC;

    -- Get funding history by year and agency
    RETURN QUERY
    SELECT 
        EXTRACT(YEAR FROM rg.agreement_start_date)::INTEGER as year,
        o.org as agency,
        COUNT(rg.grant_id)::BIGINT as grant_count,
        SUM(rg.agreement_value) as total_value,
        AVG(rg.agreement_value) as avg_value,
        COUNT(DISTINCT p.prog_id)::BIGINT as program_count,
        COUNT(DISTINCT r.recipient_id)::BIGINT as recipient_count
    FROM "ResearchGrant" rg
    JOIN "Recipient" r ON rg.recipient_id = r.recipient_id
    JOIN "Organization" o ON rg.org = o.org
    LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
    WHERE r.institute_id = p_institute_id
    GROUP BY EXTRACT(YEAR FROM rg.agreement_start_date), o.org
    ORDER BY year, agency;
END;
$$;