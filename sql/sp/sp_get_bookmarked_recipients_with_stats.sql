-- File: sql/sp/sp_get_bookmarked_recipients_with_stats.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_recipients_with_stats$
CREATE PROCEDURE sp_get_bookmarked_recipients_with_stats(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT 
        r.*,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id) AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MIN(rg.agreement_start_date) AS first_grant_date,
        MAX(rg.agreement_start_date) AS latest_grant_date
    FROM BookmarkedRecipients br
    JOIN Recipient r ON br.recipient_id = r.recipient_id
    JOIN Institute i ON r.institute_id = i.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE br.user_id = p_user_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_recipients_with_stats
CREATE OR REPLACE FUNCTION get_bookmarked_recipients_with_stats(
    p_user_id INTEGER
)
RETURNS TABLE(
    recipient_id INTEGER,
    legal_name VARCHAR(255),
    institute_id INTEGER,
    type VARCHAR(1),
    research_organization_name VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(50),
    country VARCHAR(50),
    grant_count BIGINT,
    total_funding DECIMAL(15,2),
    first_grant_date DATE,
    latest_grant_date DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        r.recipient_id,
        r.legal_name,
        r.institute_id,
        r.type,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id)::BIGINT AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MIN(rg.agreement_start_date) AS first_grant_date,
        MAX(rg.agreement_start_date) AS latest_grant_date
    FROM "BookmarkedRecipients" br
    JOIN "Recipient" r ON br.recipient_id = r.recipient_id
    JOIN "Institute" i ON r.institute_id = i.institute_id
    LEFT JOIN "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    WHERE br.user_id = p_user_id
    GROUP BY r.recipient_id, i.name, i.city, i.province, i.country
    ORDER BY total_funding DESC;
END;
$$;