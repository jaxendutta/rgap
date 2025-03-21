-- File: sql/sp/sp_get_all_recipients.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_all_recipients$$
CREATE PROCEDURE sp_get_all_recipients(
    IN p_page INT,
    IN p_page_size INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count
    SELECT COUNT(*) as total_count FROM Recipient;
    
    -- Get paginated recipients with stats
    SELECT 
        r.recipient_id,
        r.legal_name,
        r.type,
        r.recipient_type,
        r.institute_id,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id) AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MAX(rg.agreement_start_date) AS latest_grant_date
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