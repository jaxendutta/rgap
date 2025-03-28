-- Modified sp_get_all_institutes to include bookmark status
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