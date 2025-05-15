-- File: sql/sp/sp_entity_grants.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_entity_grants$$
CREATE PROCEDURE sp_entity_grants(
    IN p_recipient_id INT,
    IN p_institute_id INT,
    IN p_sort_field VARCHAR(20),
    IN p_sort_direction VARCHAR(4),
    IN p_page_size INT,
    IN p_page INT,
    IN p_user_id INT UNSIGNED
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
        JOIN Organization o ON rg.org = o.org
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
    
    -- Main query to get the grants
    SET @main_query = '
        SELECT 
            rg.*,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            i.city,
            i.province,
            i.country,
            o.org,
            o.org_title,
            p.name_en AS prog_title_en,
            p.purpose_en AS prog_purpose_en,
            -- Add bookmarked status
            IF(';
    
    -- Add user_id check
    IF p_user_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, p_user_id, ' IS NOT NULL');
    ELSE
        SET @main_query = CONCAT(@main_query, 'FALSE');
    END IF;
    
    SET @main_query = CONCAT(@main_query, ',
            EXISTS(SELECT 1 FROM BookmarkedGrants bg WHERE bg.user_id = ');
    
    -- Add user_id parameter
    IF p_user_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, p_user_id);
    ELSE
        SET @main_query = CONCAT(@main_query, 'NULL');
    END IF;
    
    SET @main_query = CONCAT(@main_query, ' AND bg.grant_id = rg.grant_id),
            FALSE) AS is_bookmarked
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.org = o.org
        LEFT JOIN Program p ON rg.prog_id = p.prog_id
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
*/

-- PostgreSQL version of sp_entity_grants.sql
CREATE OR REPLACE FUNCTION entity_grants(
    p_recipient_id INTEGER,
    p_institute_id INTEGER,
    p_sort_field VARCHAR(20),
    p_sort_direction VARCHAR(4),
    p_page_size INTEGER,
    p_page INTEGER,
    p_user_id INTEGER
)
RETURNS TABLE(
    total_count BIGINT,
    grant_id INTEGER,
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    legal_name VARCHAR(255),
    research_organization_name VARCHAR(255),
    institute_id INTEGER,
    city VARCHAR(100),
    province VARCHAR(50),
    country VARCHAR(50),
    org VARCHAR(5),
    org_title VARCHAR(100),
    prog_title_en VARCHAR(255),
    prog_purpose_en TEXT,
    is_bookmarked BOOLEAN
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset INTEGER;
    v_total_count BIGINT;
    v_query TEXT;
    v_count_query TEXT;
BEGIN
    -- Calculate offset for pagination
    v_offset := (p_page - 1) * p_page_size;
    
    -- Set default sorting if not provided
    p_sort_field := COALESCE(p_sort_field, 'date');
    p_sort_direction := COALESCE(p_sort_direction, 'desc');
    
    -- Build count query
    v_count_query := '
        SELECT COUNT(DISTINCT rg.grant_id) as total_count
        FROM "ResearchGrant" rg
        JOIN "Recipient" r ON rg.recipient_id = r.recipient_id
        JOIN "Institute" i ON r.institute_id = i.institute_id
        JOIN "Organization" o ON rg.org = o.org
        WHERE 1=1';
    
    -- Add filters
    IF p_recipient_id IS NOT NULL THEN
        v_count_query := v_count_query || ' AND rg.recipient_id = $1';
    END IF;
    
    IF p_institute_id IS NOT NULL THEN
        v_count_query := v_count_query || ' AND r.institute_id = $2';
    END IF;
    
    -- Execute count query
    IF p_recipient_id IS NOT NULL AND p_institute_id IS NOT NULL THEN
        EXECUTE v_count_query INTO v_total_count USING p_recipient_id, p_institute_id;
    ELSIF p_recipient_id IS NOT NULL THEN
        EXECUTE v_count_query INTO v_total_count USING p_recipient_id;
    ELSIF p_institute_id IS NOT NULL THEN
        EXECUTE v_count_query INTO v_total_count USING p_institute_id;
    ELSE
        EXECUTE v_count_query INTO v_total_count;
    END IF;
    
    -- Build main query
    v_query := '
        SELECT 
            rg.*,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            i.city,
            i.province,
            i.country,
            o.org,
            o.org_title,
            p.name_en AS prog_title_en,
            p.purpose_en AS prog_purpose_en,
            EXISTS(
                SELECT 1 FROM "BookmarkedGrants" bg 
                WHERE bg.user_id = $3 AND bg.grant_id = rg.grant_id
            ) AS is_bookmarked
        FROM "ResearchGrant" rg
        JOIN "Recipient" r ON rg.recipient_id = r.recipient_id
        JOIN "Institute" i ON r.institute_id = i.institute_id
        JOIN "Organization" o ON rg.org = o.org
        LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
        WHERE 1=1';
    
    -- Add filters for the main query
    IF p_recipient_id IS NOT NULL THEN
        v_query := v_query || ' AND rg.recipient_id = $1';
    END IF;
    
    IF p_institute_id IS NOT NULL THEN
        v_query := v_query || ' AND r.institute_id = $2';
    END IF;
    
    -- Add ORDER BY clause based on sort field
    v_query := v_query || ' 
        ORDER BY ' ||
        CASE p_sort_field
            WHEN 'date' THEN 'rg.agreement_start_date'
            WHEN 'value' THEN 'rg.agreement_value'
            ELSE 'rg.agreement_start_date'
        END ||
        ' ' ||
        CASE WHEN p_sort_direction = 'asc' THEN 'ASC' ELSE 'DESC' END ||
        ' LIMIT $4 OFFSET $5';
    
    -- Return the total count and results
    RETURN QUERY EXECUTE 'SELECT $6::BIGINT AS total_count, q.* FROM (' || v_query || ') q'
    USING 
        p_recipient_id,
        p_institute_id,
        p_user_id,
        p_page_size,
        v_offset,
        v_total_count;
END;
$$;