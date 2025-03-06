-- File: sql/sp/sp_entity_grants.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_entity_grants$$
CREATE PROCEDURE sp_entity_grants(
    IN p_recipient_id INT,
    IN p_institute_id INT,
    IN p_sort_field VARCHAR(20),
    IN p_sort_direction VARCHAR(4),
    IN p_page_size INT,
    IN p_page INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset for pagination
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Set default sorting if not provided
    SET p_sort_field = IFNULL(p_sort_field, 'date');
    SET p_sort_direction = IFNULL(p_sort_direction, 'desc');
    
    -- First, get total count
    SET @count_query = '
        SELECT COUNT(DISTINCT rg.grant_id) as total_count
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization org ON rg.owner_org = org.owner_org
        WHERE 1=1';
    
    -- Add filters based on provided parameters
    IF p_recipient_id IS NOT NULL THEN
        SET @count_query = CONCAT(@count_query, ' AND rg.recipient_id = ', p_recipient_id);
    END IF;
    
    IF p_institute_id IS NOT NULL THEN
        SET @count_query = CONCAT(@count_query, ' AND r.institute_id = ', p_institute_id);
    END IF;
    
    -- Execute count query
    PREPARE stmt FROM @count_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Now build main query to get the grants with latest amendments
    SET @main_query = '
        SELECT 
            rg.*,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            i.city,
            i.province,
            i.country,
            org.abbreviation AS org,
            org.org_title AS owner_org_title,
            p.name_en AS prog_title_en,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        "amendment_number", a.amendment_number,
                        "amendment_date", a.amendment_date,
                        "agreement_value", a.agreement_value,
                        "agreement_start_date", a.agreement_start_date,
                        "agreement_end_date", a.agreement_end_date
                    )
                )
                FROM ResearchGrant a
                WHERE a.ref_number = rg.ref_number
            ) AS amendments_history
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization org ON rg.owner_org = org.owner_org
        LEFT JOIN Program p ON rg.prog_id = p.prog_id
        JOIN (
            SELECT 
                t.ref_number,
                MAX(CAST(t.amendment_number AS UNSIGNED)) AS latest_amendment
            FROM ResearchGrant t
            JOIN Recipient tr ON t.recipient_id = tr.recipient_id
            JOIN Organization org2 ON t.owner_org = org2.owner_org
            WHERE 1=1
    ';
    
    -- Add filters for the subquery
    IF p_recipient_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, ' AND t.recipient_id = ', p_recipient_id);
    END IF;
    
    IF p_institute_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, ' AND tr.institute_id = ', p_institute_id);
    END IF;
    
    -- Complete the subquery and add join condition
    SET @main_query = CONCAT(@main_query, '
            GROUP BY t.ref_number
        ) AS tla ON rg.ref_number = tla.ref_number AND rg.amendment_number = tla.latest_amendment
        WHERE 1=1
    ');
    
    -- Add filters for the main query
    IF p_recipient_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, ' AND rg.recipient_id = ', p_recipient_id);
    END IF;
    
    IF p_institute_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, ' AND r.institute_id = ', p_institute_id);
    END IF;
    
    -- Add ORDER BY clause based on sort field
    SET @main_query = CONCAT(@main_query, ' 
        ORDER BY ',
        CASE p_sort_field
            WHEN 'date' THEN 'rg.agreement_start_date'
            WHEN 'value' THEN 'rg.agreement_value'
            ELSE 'rg.agreement_start_date'
        END,
        ' ',
        IF(p_sort_direction = 'asc', 'ASC', 'DESC'),
        ' LIMIT ', p_page_size, ' OFFSET ', v_offset
    );
    
    -- Execute the query
    PREPARE stmt FROM @main_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;