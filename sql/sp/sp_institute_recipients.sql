-- File: sql/sp/sp_institute_recipients.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_institute_recipients$$
CREATE PROCEDURE sp_institute_recipients(
    IN p_institute_id INT,
    IN p_page INT,
    IN p_page_size INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count of recipients for this institute
    SELECT COUNT(*) as total_count 
    FROM Recipient
    WHERE institute_id = p_institute_id;
    
    -- Get paginated recipients with their grant stats
    SELECT
        r.*,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MIN(rg.agreement_start_date) as first_grant_date,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM Recipient r
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE r.institute_id = p_institute_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;