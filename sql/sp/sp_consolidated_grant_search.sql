-- File: sql/sp/sp_consolidated_grant_search.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_consolidated_grant_search$$
CREATE PROCEDURE sp_consolidated_grant_search(
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
    IN p_sort_direction VARCHAR(4)
)
BEGIN
    -- Set up dynamic SQL variables
    SET @where_clause = CONCAT(
        " WHERE 1=1",
        IF(p_recipient_term IS NOT NULL, CONCAT(" AND r.legal_name LIKE '%", p_recipient_term, "%'"), ""),
        IF(p_institute_term IS NOT NULL, CONCAT(" AND i.name LIKE '%", p_institute_term, "%'"), ""),
        IF(p_grant_term IS NOT NULL, CONCAT(" AND rg.agreement_title_en LIKE '%", p_grant_term, "%'"), ""),
        " AND YEAR(rg.agreement_start_date) BETWEEN ", p_year_start, " AND ", p_year_end,
        " AND rg.agreement_value BETWEEN ", p_value_min, " AND ", p_value_max
    );
    
    -- Handle agency filter
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
        SET @where_clause = CONCAT(@where_clause, " AND o.abbreviation IN (", @agency_list, ")");
    END IF;
    
    -- Handle country filter
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
        SET @where_clause = CONCAT(@where_clause, " AND i.country IN (", @country_list, ")");
    END IF;
    
    -- Handle province filter
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
        SET @where_clause = CONCAT(@where_clause, " AND i.province IN (", @province_list, ")");
    END IF;
    
    -- Handle city filter
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
        SET @where_clause = CONCAT(@where_clause, " AND i.city IN (", @city_list, ")");
    END IF;
    
    -- Create a temporary table with unique ref_numbers and their latest amendment
    CREATE TEMPORARY TABLE temp_latest_amendments AS
    SELECT 
        rg.ref_number,
        MAX(CAST(rg.amendment_number AS UNSIGNED)) AS latest_amendment
    FROM ResearchGrant rg
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Institute i ON r.institute_id = i.institute_id
    JOIN Organization o ON rg.owner_org = o.owner_org
    WHERE 1=1
        AND (p_recipient_term IS NULL OR r.legal_name LIKE CONCAT('%', p_recipient_term, '%'))
        AND (p_institute_term IS NULL OR i.name LIKE CONCAT('%', p_institute_term, '%'))
        AND (p_grant_term IS NULL OR rg.agreement_title_en LIKE CONCAT('%', p_grant_term, '%'))
        AND YEAR(rg.agreement_start_date) BETWEEN p_year_start AND p_year_end
        AND rg.agreement_value BETWEEN p_value_min AND p_value_max
    GROUP BY rg.ref_number;
    
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
    
    -- Create the base query to get all fields
    SET @query = CONCAT("
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
            rg.recipient_id,
            i.city,
            i.province,
            i.country,
            o.abbreviation AS org,
            rg.owner_org,
            o.org_title AS owner_org_title,
            rg.prog_id,
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
        JOIN Organization o ON rg.owner_org = o.owner_org
        JOIN temp_latest_amendments tla ON rg.ref_number = tla.ref_number AND rg.amendment_number = tla.latest_amendment
        ", @order_clause);
    
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    
    DROP TEMPORARY TABLE temp_latest_amendments;
END $$
DELIMITER ;