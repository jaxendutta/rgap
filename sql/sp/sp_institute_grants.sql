-- File: sql/sp/sp_institute_grants.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_institute_grants$$
CREATE PROCEDURE sp_institute_grants(
    IN p_institute_id INT,
    IN p_page INT,
    IN p_page_size INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Get total count of grants for this institute
    SELECT COUNT(*) as total_count 
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    WHERE r.institute_id = p_institute_id;
    
    -- Get paginated grants
    SELECT
        rg.*,
        r.legal_name,
        o.abbreviation as org,
        o.org_title,
        p.name_en as program_name
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Organization o ON rg.owner_org = o.owner_org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE r.institute_id = p_institute_id
    ORDER BY rg.agreement_start_date DESC
    LIMIT p_page_size OFFSET v_offset;
END $$
DELIMITER ;