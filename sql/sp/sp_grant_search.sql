-- File: sql/sp/sp_grant_search.sql
-- Purpose: Stored procedure for searching research grants with advanced filters
DELIMITER $
DROP PROCEDURE IF EXISTS sp_grant_search$
CREATE PROCEDURE sp_grant_search(
    IN p_user_id INT UNSIGNED,
    IN p_recipient_term VARCHAR(255),
    IN p_institute_term VARCHAR(255),
    IN p_grant_term VARCHAR(255),
    IN p_from_date DATE,
    IN p_to_date DATE,
    IN p_value_min DECIMAL(15,2),
    IN p_value_max DECIMAL(15,2),
    IN p_agencies JSON,
    IN p_countries JSON,
    IN p_provinces JSON,
    IN p_cities JSON,
    IN p_sort_field VARCHAR(20),
    IN p_sort_direction VARCHAR(4),
    IN p_page_size INT,
    IN p_page INT
)
BEGIN
    DECLARE v_offset INT;
    DECLARE v_total_count INT DEFAULT 0;
    
    -- Calculate offset for pagination
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Use default values if not provided
    SET p_page_size = IFNULL(p_page_size, 20);
    SET p_page = IFNULL(p_page, 1);
    
    -- Create a temporary table for filter conditions to avoid recomputing them
    DROP TEMPORARY TABLE IF EXISTS search_filters;
    CREATE TEMPORARY TABLE search_filters (
        filter_type VARCHAR(50),
        filter_value VARCHAR(255)
    );
    
    -- Add agency filters
    IF JSON_LENGTH(p_agencies) > 0 THEN
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_agencies) DO
            INSERT INTO search_filters 
            SELECT 'org', JSON_UNQUOTE(JSON_EXTRACT(p_agencies, CONCAT('$[', @i, ']')));
            SET @i = @i + 1;
        END WHILE;
    END IF;
    
    -- Add country filters
    IF JSON_LENGTH(p_countries) > 0 THEN
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_countries) DO
            INSERT INTO search_filters 
            SELECT 'country', JSON_UNQUOTE(JSON_EXTRACT(p_countries, CONCAT('$[', @i, ']')));
            SET @i = @i + 1;
        END WHILE;
    END IF;
    
    -- Add province filters
    IF JSON_LENGTH(p_provinces) > 0 THEN
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_provinces) DO
            INSERT INTO search_filters 
            SELECT 'province', JSON_UNQUOTE(JSON_EXTRACT(p_provinces, CONCAT('$[', @i, ']')));
            SET @i = @i + 1;
        END WHILE;
    END IF;
    
    -- Add city filters
    IF JSON_LENGTH(p_cities) > 0 THEN
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_cities) DO
            INSERT INTO search_filters 
            SELECT 'city', JSON_UNQUOTE(JSON_EXTRACT(p_cities, CONCAT('$[', @i, ']')));
            SET @i = @i + 1;
        END WHILE;
    END IF;
    
    -- Create a temporary table for prefiltered IDs to improve join performance
    DROP TEMPORARY TABLE IF EXISTS filtered_grants;
    CREATE TEMPORARY TABLE filtered_grants (
        grant_id INT UNSIGNED PRIMARY KEY
    );
    
    -- Use basic query to get filtered IDs first (more efficient than full joins)
    SET @filter_query = CONCAT("
        INSERT INTO filtered_grants
        SELECT rg.grant_id
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.org = o.org
        WHERE rg.agreement_value BETWEEN ", p_value_min, " AND ", p_value_max);
    
    -- Add date filter
    IF p_from_date IS NOT NULL AND p_to_date IS NOT NULL THEN
        SET @filter_query = CONCAT(@filter_query, 
            " AND rg.agreement_start_date BETWEEN '", p_from_date, "' AND '", p_to_date, "'");
    END IF;
    
    -- Add text search filters
    IF p_recipient_term IS NOT NULL AND p_recipient_term != '' THEN
        SET @filter_query = CONCAT(@filter_query, 
            " AND r.legal_name LIKE '%", p_recipient_term, "%'");
    END IF;
    
    IF p_institute_term IS NOT NULL AND p_institute_term != '' THEN
        SET @filter_query = CONCAT(@filter_query, 
            " AND i.name LIKE '%", p_institute_term, "%'");
    END IF;
    
    IF p_grant_term IS NOT NULL AND p_grant_term != '' THEN
        SET @filter_query = CONCAT(@filter_query, 
            " AND rg.agreement_title_en LIKE '%", p_grant_term, "%'");
    END IF;
    
    -- Execute the filter query
    PREPARE stmt FROM @filter_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Apply agency filter
    IF EXISTS (SELECT 1 FROM search_filters WHERE filter_type = 'org') THEN
        DELETE fg 
        FROM filtered_grants fg
        JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
        LEFT JOIN search_filters sf ON sf.filter_type = 'org' AND rg.org = sf.filter_value
        WHERE sf.filter_value IS NULL;
    END IF;
    
    -- Apply country filter
    IF EXISTS (SELECT 1 FROM search_filters WHERE filter_type = 'country') THEN
        DELETE fg 
        FROM filtered_grants fg
        JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        LEFT JOIN search_filters sf ON sf.filter_type = 'country' AND i.country = sf.filter_value
        WHERE sf.filter_value IS NULL;
    END IF;

    -- Apply province filter
    IF EXISTS (SELECT 1 FROM search_filters WHERE filter_type = 'province') THEN
        DELETE fg 
        FROM filtered_grants fg
        JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        LEFT JOIN search_filters sf ON sf.filter_type = 'province' AND i.province = sf.filter_value
        WHERE sf.filter_value IS NULL;
    END IF;

    -- Apply city filter
    IF EXISTS (SELECT 1 FROM search_filters WHERE filter_type = 'city') THEN
        DELETE fg 
        FROM filtered_grants fg
        JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        LEFT JOIN search_filters sf ON sf.filter_type = 'city' AND i.city = sf.filter_value
        WHERE sf.filter_value IS NULL;
    END IF;
    
    -- Get the total count of filtered grants
    SELECT COUNT(*) INTO v_total_count FROM filtered_grants;
    
    -- Return the total count
    SELECT v_total_count AS total_count;
    
    -- Define sorting logic
    SET @order_clause = IF(
        p_sort_field = 'value',
        IF(p_sort_direction = 'asc', "rg.agreement_value ASC", "rg.agreement_value DESC"),
        IF(p_sort_direction = 'asc', "rg.agreement_start_date ASC", "rg.agreement_start_date DESC")
    );
    
    -- Prepare and execute the main query using filtered IDs
    SET @main_query = "
        SELECT
            rg.grant_id,
            rg.ref_number,
            rg.latest_amendment_number,
            rg.amendment_date,
            rg.agreement_number,
            rg.agreement_value,
            rg.foreign_currency_type,
            rg.foreign_currency_value,
            rg.agreement_start_date,
            rg.agreement_end_date,
            rg.agreement_title_en,
            rg.description_en,
            rg.expected_results_en,
            rg.additional_information_en,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            rg.recipient_id,
            i.city,
            i.province,
            i.country,
            o.org,
            o.org_title,
            rg.prog_id,
            p.name_en AS prog_title_en,
            p.purpose_en AS prog_purpose_en,
            rg.amendments_history,";
    
    -- Add bookmark status
    IF p_user_id IS NOT NULL THEN
        SET @main_query = CONCAT(@main_query, "
            EXISTS(SELECT 1 FROM BookmarkedGrants bg WHERE bg.user_id = ", p_user_id, " AND bg.grant_id = rg.grant_id) AS is_bookmarked");
    ELSE
        SET @main_query = CONCAT(@main_query, "
            FALSE AS is_bookmarked");
    END IF;
    
    -- Complete the query
    SET @main_query = CONCAT(@main_query, "
        FROM filtered_grants fg
        JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.org = o.org
        LEFT JOIN Program p ON rg.prog_id = p.prog_id
        ORDER BY ", @order_clause, "
        LIMIT ", p_page_size, " OFFSET ", v_offset);
    
    -- Execute main query
    PREPARE stmt FROM @main_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Log search if criteria warrant it and we're on first page
    IF p_page = 1 AND (
        (p_recipient_term IS NOT NULL AND p_recipient_term != '') OR
        (p_institute_term IS NOT NULL AND p_institute_term != '') OR
        (p_grant_term IS NOT NULL AND p_grant_term != '') OR
        JSON_LENGTH(p_agencies) > 0 OR
        JSON_LENGTH(p_countries) > 0 OR
        JSON_LENGTH(p_provinces) > 0 OR
        JSON_LENGTH(p_cities) > 0 OR
        (p_from_date IS NOT NULL AND p_from_date != '1990-01-01') OR
        (p_to_date IS NOT NULL AND p_to_date != CURRENT_DATE()) OR
        (p_value_min IS NOT NULL AND p_value_min > 0) OR
        (p_value_max IS NOT NULL AND p_value_max < 200000000)
    ) THEN
        -- Create a JSON object with all the filter values
        SET @filter_json = JSON_OBJECT(
            'dateRange', JSON_OBJECT(
                'from', p_from_date,
                'to', p_to_date
            ),
            'valueRange', JSON_OBJECT(
                'min', p_value_min,
                'max', p_value_max
            ),
            'agencies', p_agencies,
            'countries', p_countries,
            'provinces', p_provinces,
            'cities', p_cities
        );
        
        -- Call the search history procedure to log this search
        CALL sp_create_search_history(
            p_user_id,
            p_recipient_term,
            p_grant_term,
            p_institute_term,
            @filter_json,
            v_total_count
        );
    END IF;
    
    -- Clean up temporary tables
    DROP TEMPORARY TABLE IF EXISTS search_filters;
    DROP TEMPORARY TABLE IF EXISTS filtered_grants;
END $
DELIMITER ;