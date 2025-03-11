-- File: sql/sp/sp_grant_search.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_grant_search$$
CREATE PROCEDURE sp_grant_search(
    IN p_recipient_term VARCHAR(255),
    IN p_institute_term VARCHAR(255),
    IN p_grant_term VARCHAR(255),
    IN p_year_start INT,
    IN p_year_end INT,
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
    DECLARE v_total_count INT;
    
    -- Calculate offset
    SET v_offset = (p_page - 1) * p_page_size;
    
    -- Set default page size if not provided
    SET p_page_size = IFNULL(p_page_size, 20);
    SET p_page = IFNULL(p_page, 1);
    
    -- Conditions to apply to the main query
    SET @main_conditions = CONCAT(
        "WHERE 1=1",
        IF(p_recipient_term IS NOT NULL, CONCAT(" AND r.legal_name LIKE '%", p_recipient_term, "%'"), ""),
        IF(p_institute_term IS NOT NULL, CONCAT(" AND i.name LIKE '%", p_institute_term, "%'"), ""),
        IF(p_grant_term IS NOT NULL, CONCAT(" AND rg.agreement_title_en LIKE '%", p_grant_term, "%'"), ""),
        " AND YEAR(rg.agreement_start_date) BETWEEN ", p_year_start, " AND ", p_year_end,
        " AND rg.agreement_value BETWEEN ", p_value_min, " AND ", p_value_max
    );
    
    -- Conditions to apply to the subquery - using table alias 't' instead of 'rg'
    SET @sub_conditions = CONCAT(
        "WHERE 1=1",
        IF(p_recipient_term IS NOT NULL, CONCAT(" AND tr.legal_name LIKE '%", p_recipient_term, "%'"), ""),
        IF(p_institute_term IS NOT NULL, CONCAT(" AND ti.name LIKE '%", p_institute_term, "%'"), ""),
        IF(p_grant_term IS NOT NULL, CONCAT(" AND t.agreement_title_en LIKE '%", p_grant_term, "%'"), ""),
        " AND YEAR(t.agreement_start_date) BETWEEN ", p_year_start, " AND ", p_year_end,
        " AND t.agreement_value BETWEEN ", p_value_min, " AND ", p_value_max
    );
    
    -- Handle agency filter for main query
    IF JSON_LENGTH(p_agencies) > 0 THEN
        SET @agency_list = "";
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_agencies) DO
            SET @agency = JSON_UNQUOTE(JSON_EXTRACT(p_agencies, CONCAT('$[', @i, ']')));
            IF @i > 0 THEN
                SET @agency_list = CONCAT(@agency_list, ",");
            END IF;
            SET @agency_list = CONCAT(@agency_list, "'", @agency, "'");
            SET @i = @i + 1;
        END WHILE;
        SET @main_conditions = CONCAT(@main_conditions, " AND o.org IN (", @agency_list, ")");
        SET @sub_conditions = CONCAT(@sub_conditions, " AND ot.org IN (", @agency_list, ")");
    END IF;
    
    -- Handle country filter for main query
    IF JSON_LENGTH(p_countries) > 0 THEN
        SET @country_list = "";
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_countries) DO
            SET @country = JSON_UNQUOTE(JSON_EXTRACT(p_countries, CONCAT('$[', @i, ']')));
            IF @i > 0 THEN
                SET @country_list = CONCAT(@country_list, ",");
            END IF;
            SET @country_list = CONCAT(@country_list, "'", @country, "'");
            SET @i = @i + 1;
        END WHILE;
        SET @main_conditions = CONCAT(@main_conditions, " AND i.country IN (", @country_list, ")");
        SET @sub_conditions = CONCAT(@sub_conditions, " AND ti.country IN (", @country_list, ")");
    END IF;
    
    -- Handle province filter for main query
    IF JSON_LENGTH(p_provinces) > 0 THEN
        SET @province_list = "";
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_provinces) DO
            SET @province = JSON_UNQUOTE(JSON_EXTRACT(p_provinces, CONCAT('$[', @i, ']')));
            IF @i > 0 THEN
                SET @province_list = CONCAT(@province_list, ",");
            END IF;
            SET @province_list = CONCAT(@province_list, "'", @province, "'");
            SET @i = @i + 1;
        END WHILE;
        SET @main_conditions = CONCAT(@main_conditions, " AND i.province IN (", @province_list, ")");
        SET @sub_conditions = CONCAT(@sub_conditions, " AND ti.province IN (", @province_list, ")");
    END IF;
    
    -- Handle city filter for main query
    IF JSON_LENGTH(p_cities) > 0 THEN
        SET @city_list = "";
        SET @i = 0;
        WHILE @i < JSON_LENGTH(p_cities) DO
            SET @city = JSON_UNQUOTE(JSON_EXTRACT(p_cities, CONCAT('$[', @i, ']')));
            IF @i > 0 THEN
                SET @city_list = CONCAT(@city_list, ",");
            END IF;
            SET @city_list = CONCAT(@city_list, "'", @city, "'");
            SET @i = @i + 1;
        END WHILE;
        SET @main_conditions = CONCAT(@main_conditions, " AND i.city IN (", @city_list, ")");
        SET @sub_conditions = CONCAT(@sub_conditions, " AND ti.city IN (", @city_list, ")");
    END IF;
    
    -- Define the list of reference numbers with latest amendments using a subquery
    SET @latest_amendments_subquery = CONCAT("
        JOIN (
            SELECT 
                t.ref_number,
                MAX(CAST(t.amendment_number AS UNSIGNED)) AS latest_amendment
            FROM ResearchGrant t
            JOIN Recipient tr ON t.recipient_id = tr.recipient_id
            JOIN Institute ti ON tr.institute_id = ti.institute_id
            JOIN Organization ot ON t.org = ot.org
            ", @sub_conditions, "
            GROUP BY t.ref_number
        ) AS tla ON rg.ref_number = tla.ref_number AND CAST(rg.amendment_number AS UNSIGNED) = tla.latest_amendment
    ");
    
    -- Define the count query using a subquery
    SET @count_query = CONCAT("
        SELECT COUNT(*) INTO @v_total_count
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.org = o.org
        ", @latest_amendments_subquery, "
        ", @main_conditions);
    
    -- Execute the count query
    PREPARE stmt FROM @count_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    -- Define the sorting clause
    SET @order_clause = IF(
        p_sort_field = 'value',
        IF(
            p_sort_direction = 'asc',
            " ORDER BY rg.agreement_value ASC",
            " ORDER BY rg.agreement_value DESC"
        ),
        IF(
            p_sort_direction = 'asc',
            " ORDER BY rg.agreement_start_date ASC",
            " ORDER BY rg.agreement_start_date DESC"
        )
    );
    
    -- Create the main query with pagination
    SET @main_query = CONCAT("
        SELECT 
            rg.ref_number,
            rg.amendment_number AS latest_amendment_number,
            rg.amendment_date AS latest_amendment_date,
            rg.agreement_type,
            rg.agreement_number,
            rg.agreement_value AS latest_value,
            rg.foreign_currency_type,
            rg.foreign_currency_value,
            rg.agreement_start_date,
            rg.agreement_end_date,
            rg.agreement_title_en,
            rg.description_en,
            rg.expected_results_en,
            r.legal_name,
            i.name AS research_organization_name,
            i.institute_id,
            rg.recipient_id,
            i.city,
            i.province,
            i.country,
            o.org,
            rg.org,
            o.org_title,
            rg.prog_id,
            p.name_en,
            (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'amendment_number', a.amendment_number,
                        'amendment_date', a.amendment_date,
                        'agreement_value', a.agreement_value,
                        'agreement_start_date', a.agreement_start_date,
                        'agreement_end_date', a.agreement_end_date
                    )
                )
                FROM ResearchGrant a
                WHERE a.ref_number = rg.ref_number
            ) AS amendments_history
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Institute i ON r.institute_id = i.institute_id
        JOIN Organization o ON rg.org = o.org
        LEFT JOIN Program p ON rg.prog_id = p.prog_id
        ", @latest_amendments_subquery, "
        ", @main_conditions, "
        ", @order_clause, "
        LIMIT ", p_page_size, " 
        OFFSET ", v_offset);
    
    -- Return the total count first
    SELECT IFNULL(@v_total_count, 0) AS total_count;
    
    -- Execute the main query
    PREPARE stmt FROM @main_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END $$
DELIMITER ;