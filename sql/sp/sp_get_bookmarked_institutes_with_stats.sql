-- File: sql/sp/sp_get_bookmarked_institutes_with_stats.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_institutes_with_stats$
CREATE PROCEDURE sp_get_bookmarked_institutes_with_stats(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as recipient_count,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM BookmarkedInstitutes bi
    JOIN Institute i ON bi.institute_id = i.institute_id
    LEFT JOIN Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE bi.user_id = p_user_id
    GROUP BY i.institute_id
    ORDER BY total_funding DESC;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_institutes_with_stats
CREATE OR REPLACE FUNCTION get_bookmarked_institutes_with_stats(
    p_user_id INTEGER
)
RETURNS TABLE(
    institute_id INTEGER,
    name VARCHAR(255),
    country VARCHAR(50),
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    riding_name_en VARCHAR(100),
    riding_number VARCHAR(10),
    recipient_count BIGINT,
    grant_count BIGINT,
    total_funding DECIMAL(15,2),
    latest_grant_date DATE
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        i.institute_id,
        i.name,
        i.country,
        i.province,
        i.city,
        i.postal_code,
        i.riding_name_en,
        i.riding_number,
        COUNT(DISTINCT r.recipient_id)::BIGINT as recipient_count,
        COUNT(DISTINCT rg.grant_id)::BIGINT as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM "BookmarkedInstitutes" bi
    JOIN "Institute" i ON bi.institute_id = i.institute_id
    LEFT JOIN "Recipient" r ON i.institute_id = r.institute_id
    LEFT JOIN "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    WHERE bi.user_id = p_user_id
    GROUP BY i.institute_id
    ORDER BY total_funding DESC;
END;
$$;