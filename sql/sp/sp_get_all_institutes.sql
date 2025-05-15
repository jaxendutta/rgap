-- File: sp_get_all_institutes.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_all_institutes$$
CREATE PROCEDURE sp_get_all_institutes(
    IN p_page INT,
    IN p_page_size INT,
    IN p_user_id INT UNSIGNED
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count
    SELECT COUNT(*) as total_count FROM Institute;
    
    -- Get paginated institutes with stats and bookmark status
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as recipient_count,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MAX(rg.agreement_start_date) as latest_grant_date,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedInstitutes bi WHERE bi.user_id = p_user_id AND bi.institute_id = i.institute_id), 
           FALSE) AS is_bookmarked
    FROM 
        Institute i
    LEFT JOIN 
        Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN 
        ResearchGrant rg ON r.recipient_id = rg.recipient_id
    GROUP BY 
        i.institute_id
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_all_institutes.sql
CREATE OR REPLACE FUNCTION get_all_institutes(
    p_page INTEGER,
    p_page_size INTEGER,
    p_user_id INTEGER
)
RETURNS TABLE(
    total_count BIGINT,
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
    latest_grant_date DATE,
    is_bookmarked BOOLEAN
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset INTEGER;
    v_total_count BIGINT;
BEGIN
    -- Calculate offset
    v_offset := (p_page - 1) * p_page_size;
    
    -- Get total count
    SELECT COUNT(*) INTO v_total_count FROM "Institute";
    
    -- Return the total count and paginated results
    RETURN QUERY 
    SELECT 
        v_total_count,
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
        MAX(rg.agreement_start_date) as latest_grant_date,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedInstitutes" bi 
            WHERE bi.user_id = p_user_id AND bi.institute_id = i.institute_id
        ) AS is_bookmarked
    FROM 
        "Institute" i
    LEFT JOIN 
        "Recipient" r ON i.institute_id = r.institute_id
    LEFT JOIN 
        "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    GROUP BY 
        i.institute_id
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END;
$$;