-- File: sql/sp/sp_sort_grant.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_sort_grant$$
CREATE PROCEDURE sp_sort_grant(
    IN p_sort_field VARCHAR(20),
    IN p_sort_direction VARCHAR(4),
    IN p_page_size INT,
    IN p_page INT
)
BEGIN 
    DECLARE v_offset INT;

    SET v_offset = (p_page - 1) * p_page_size;

    SET p_page_size = IFNULL(p_page_size, 20);
    SET p_page = IFNULL(p_page, 1);

    SET @order_clause = IF(
        p_sort_field = 'value',
        IF(p_sort_direction = 'asc', " ORDER BY latest_value ASC", " ORDER BY latest_value DESC"),
        IF(p_sort_direction = 'asc', " ORDER BY agreement_start_date ASC", " ORDER BY agreement_start_date DESC")
    );

    
        CREATE TEMPORARY TABLE IF NOT EXISTS temp_grant_search_results (
        ref_number VARCHAR(20),
        latest_amendment_number VARCHAR(10),
        latest_amendment_date DATE,
        agreement_number VARCHAR(50),
        latest_value DECIMAL(15,2),
        foreign_currency_type VARCHAR(3),
        foreign_currency_value DECIMAL(15,2),
        agreement_start_date DATE,
        agreement_end_date DATE,
        agreement_title_en TEXT,
        description_en TEXT,
        expected_results_en TEXT,
        legal_name TEXT,
        research_organization_name TEXT,
        institute_id INT,
        recipient_id INT,
        city TEXT,
        province TEXT,
        country TEXT,
        org VARCHAR(20),
        org_title TEXT,
        prog_id VARCHAR(50),
        name_en TEXT,
        amendments_history JSON);

    SET @main_query = CONCAT("
        SELECT * FROM temp_grant_search_results
        ", @order_clause, "
        LIMIT ", p_page_size, " OFFSET ", v_offset);
    
    PREPARE stmt FROM @main_query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;
*/

-- PostgreSQL version of sp_sort_grant.sql
CREATE OR REPLACE FUNCTION sort_grant(
    p_sort_field VARCHAR(20),
    p_sort_direction VARCHAR(4),
    p_page_size INTEGER,
    p_page INTEGER
)
RETURNS TABLE(
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    latest_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    legal_name VARCHAR(255),
    research_organization_name VARCHAR(255),
    institute_id INTEGER,
    recipient_id INTEGER,
    city VARCHAR(100),
    province VARCHAR(50),
    country VARCHAR(50),
    org VARCHAR(5),
    org_title VARCHAR(100),
    prog_id INTEGER,
    name_en VARCHAR(255),
    amendments_history JSONB
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset INTEGER;
    v_order_clause TEXT;
BEGIN
    -- Calculate offset
    v_offset := (p_page - 1) * p_page_size;
    
    -- Set defaults
    p_page_size := COALESCE(p_page_size, 20);
    p_page := COALESCE(p_page, 1);
    
    -- Determine sort order
    IF p_sort_field = 'value' THEN
        IF p_sort_direction = 'asc' THEN
            v_order_clause := 'ORDER BY latest_value ASC';
        ELSE
            v_order_clause := 'ORDER BY latest_value DESC';
        END IF;
    ELSE
        IF p_sort_direction = 'asc' THEN
            v_order_clause := 'ORDER BY agreement_start_date ASC';
        ELSE
            v_order_clause := 'ORDER BY agreement_start_date DESC';
        END IF;
    END IF;
    
    -- Use temporary table approach for flexibility
    CREATE TEMP TABLE IF NOT EXISTS temp_grant_search_results (
        ref_number VARCHAR(50),
        latest_amendment_number INTEGER,
        latest_amendment_date DATE,
        agreement_number VARCHAR(50),
        latest_value DECIMAL(15,2),
        foreign_currency_type VARCHAR(3),
        foreign_currency_value DECIMAL(15,2),
        agreement_start_date DATE,
        agreement_end_date DATE,
        agreement_title_en TEXT,
        description_en TEXT,
        expected_results_en TEXT,
        legal_name VARCHAR(255),
        research_organization_name VARCHAR(255),
        institute_id INTEGER,
        recipient_id INTEGER,
        city VARCHAR(100),
        province VARCHAR(50),
        country VARCHAR(50),
        org VARCHAR(5),
        org_title VARCHAR(100),
        prog_id INTEGER,
        name_en VARCHAR(255),
        amendments_history JSONB
    );
    
    -- Return results
    RETURN QUERY EXECUTE 'SELECT * FROM temp_grant_search_results ' || v_order_clause || ' LIMIT $1 OFFSET $2'
    USING p_page_size, v_offset;
END;
$$;
