-- Modified sp_get_all_recipients to include bookmark status
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