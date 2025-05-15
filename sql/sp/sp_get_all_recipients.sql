-- File: sp_get_all_recipients.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_all_recipients$$
CREATE PROCEDURE sp_get_all_recipients(
    IN p_page INT,
    IN p_page_size INT,
    IN p_user_id INT UNSIGNED
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count
    SELECT COUNT(*) as total_count FROM Recipient;
    
    -- Get paginated recipients with stats and bookmark status
    SELECT 
        r.recipient_id,
        r.legal_name,
        r.type,
        r.institute_id,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id) AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MAX(rg.agreement_start_date) AS latest_grant_date,
        -- Add bookmarked status
        IF(p_user_id IS NOT NULL, 
           EXISTS(SELECT 1 FROM BookmarkedRecipients br WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id), 
           FALSE) AS is_bookmarked
    FROM 
        Recipient r
    LEFT JOIN 
        Institute i ON r.institute_id = i.institute_id
    LEFT JOIN 
        ResearchGrant rg ON r.recipient_id = rg.recipient_id
    GROUP BY 
        r.recipient_id
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_all_recipients.sql
CREATE OR REPLACE FUNCTION get_all_recipients(
    p_page INTEGER,
    p_page_size INTEGER,
    p_user_id INTEGER
)
RETURNS TABLE(
    total_count BIGINT,
    recipient_id INTEGER,
    legal_name VARCHAR(255),
    type VARCHAR(1),
    institute_id INTEGER,
    research_organization_name VARCHAR(255),
    city VARCHAR(100),
    province VARCHAR(50),
    country VARCHAR(50),
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
    SELECT COUNT(*) INTO v_total_count FROM "Recipient";
    
    -- Return the total count and paginated results
    RETURN QUERY 
    SELECT 
        v_total_count,
        r.recipient_id,
        r.legal_name,
        r.type,
        r.institute_id,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id)::BIGINT AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MAX(rg.agreement_start_date) AS latest_grant_date,
        -- Add bookmarked status
        EXISTS(
            SELECT 1 FROM "BookmarkedRecipients" br 
            WHERE br.user_id = p_user_id AND br.recipient_id = r.recipient_id
        ) AS is_bookmarked
    FROM 
        "Recipient" r
    LEFT JOIN 
        "Institute" i ON r.institute_id = i.institute_id
    LEFT JOIN 
        "ResearchGrant" rg ON r.recipient_id = rg.recipient_id
    GROUP BY 
        r.recipient_id,
        i.name,
        i.city,
        i.province,
        i.country
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END;
$$;