-- File: sql/sp/sp_search_institutes.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_search_institutes$$
CREATE PROCEDURE sp_search_institutes(
    IN p_term VARCHAR(255),
    IN p_page INT,
    IN p_page_size INT
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
    
    -- Get paginated matching institutes with stats
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as recipients_count,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM 
        Institute i
    LEFT JOIN 
        Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN 
        ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE 
        i.name LIKE CONCAT('%', p_term, '%') 
        OR i.type LIKE CONCAT('%', p_term, '%')
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