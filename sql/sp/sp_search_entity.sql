-- File: sql/sp/sp_search_institutes.sql
-- Modified sp_search_institutes to include bookmark status
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_institutes$$
CREATE PROCEDURE sp_search_institutes(
    IN p_term VARCHAR(255),
    IN p_page INT,
    IN p_page_size INT,
    IN p_user_id INT UNSIGNED
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count of matching institutes
    SELECT COUNT(*) as total_count 
    FROM Institute
    WHERE name LIKE CONCAT('%', p_term, '%') 
       OR type LIKE CONCAT('%', p_term, '%')
       OR city LIKE CONCAT('%', p_term, '%')
       OR province LIKE CONCAT('%', p_term, '%')
       OR country LIKE CONCAT('%', p_term, '%');
    
    -- Get paginated matching institutes with stats and bookmark status
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as recipients_count,
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
    WHERE 
        i.name LIKE CONCAT('%', p_term, '%')
        OR i.city LIKE CONCAT('%', p_term, '%')
        OR i.province LIKE CONCAT('%', p_term, '%')
        OR i.country LIKE CONCAT('%', p_term, '%')
    GROUP BY 
        i.institute_id
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;

-- File: sql/sp/sp_search_recipients.sql
-- Updated sp_search_recipients to include bookmark status
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_recipients$$
CREATE PROCEDURE sp_search_recipients(
    IN p_term VARCHAR(255),
    IN p_page INT,
    IN p_page_size INT,
    IN p_user_id INT UNSIGNED
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count of matching recipients
    SELECT COUNT(*) as total_count 
    FROM Recipient r
    JOIN Institute i ON r.institute_id = i.institute_id
    WHERE r.legal_name LIKE CONCAT('%', p_term, '%') 
       OR i.name LIKE CONCAT('%', p_term, '%');
    
    -- Get paginated matching recipients with stats and bookmark status
    SELECT 
        r.*,
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
    WHERE 
        r.legal_name LIKE CONCAT('%', p_term, '%') 
        OR i.name LIKE CONCAT('%', p_term, '%')
    GROUP BY 
        r.recipient_id
    ORDER BY 
        total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;