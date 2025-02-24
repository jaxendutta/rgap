-- File: sql/sp/sp_grant_search.sql

-- Drop existing procedure if it exists
DROP PROCEDURE IF EXISTS sp_grant_search;

DELIMITER $$

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
    IN p_sort_direction VARCHAR(4)
)
BEGIN
    -- Force consistent collation for string comparisons
    SET @query = CONCAT('
        SELECT DISTINCT
            rg.grant_id,
            rg.ref_number,
            r.legal_name COLLATE utf8mb4_unicode_ci as legal_name,
            r.research_organization_name COLLATE utf8mb4_unicode_ci as research_organization_name,
            rg.agreement_title_en COLLATE utf8mb4_unicode_ci as agreement_title_en,
            rg.agreement_value,
            rg.agreement_start_date,
            rg.agreement_end_date,
            r.recipient_id,
            r.city COLLATE utf8mb4_unicode_ci as city,
            r.province COLLATE utf8mb4_unicode_ci as province,
            r.country COLLATE utf8mb4_unicode_ci as country,
            o.abbreviation COLLATE utf8mb4_unicode_ci as org
        FROM ResearchGrant rg
        JOIN Recipient r ON rg.recipient_id = r.recipient_id
        JOIN Organization o ON rg.owner_org = o.owner_org
        WHERE 1=1 ',
        IF(p_recipient_term IS NOT NULL, 
           CONCAT(' AND r.legal_name COLLATE utf8mb4_unicode_ci LIKE ''%', p_recipient_term, '%'''), ''),
        IF(p_institute_term IS NOT NULL,
           CONCAT(' AND r.research_organization_name COLLATE utf8mb4_unicode_ci LIKE ''%', p_institute_term, '%'''), ''),
        IF(p_grant_term IS NOT NULL,
           CONCAT(' AND rg.agreement_title_en COLLATE utf8mb4_unicode_ci LIKE ''%', p_grant_term, '%'''), ''),
        ' AND YEAR(rg.agreement_start_date) BETWEEN ', p_year_start, ' AND ', p_year_end,
        ' AND rg.agreement_value BETWEEN ', p_value_min, ' AND ', p_value_max,
        IF(JSON_LENGTH(p_agencies) > 0,
           CONCAT(' AND o.abbreviation COLLATE utf8mb4_unicode_ci IN (SELECT value FROM JSON_TABLE(''', 
                 p_agencies, 
                 ''', ''$[*]'' COLUMNS(value VARCHAR(50) PATH ''$'')) as jt)'),
           ''),
        IF(JSON_LENGTH(p_countries) > 0,
           CONCAT(' AND r.country COLLATE utf8mb4_unicode_ci IN (SELECT value FROM JSON_TABLE(''', 
                 p_countries, 
                 ''', ''$[*]'' COLUMNS(value VARCHAR(50) PATH ''$'')) as jt)'),
           ''),
        IF(JSON_LENGTH(p_provinces) > 0,
           CONCAT(' AND r.province COLLATE utf8mb4_unicode_ci IN (SELECT value FROM JSON_TABLE(''', 
                 p_provinces, 
                 ''', ''$[*]'' COLUMNS(value VARCHAR(50) PATH ''$'')) as jt)'),
           ''),
        IF(JSON_LENGTH(p_cities) > 0,
           CONCAT(' AND r.city COLLATE utf8mb4_unicode_ci IN (SELECT value FROM JSON_TABLE(''', 
                 p_cities, 
                 ''', ''$[*]'' COLUMNS(value VARCHAR(50) PATH ''$'')) as jt)'),
           ''),
        ' ORDER BY ',
        CASE p_sort_field
            WHEN 'date' THEN 'rg.agreement_start_date'
            WHEN 'value' THEN 'rg.agreement_value'
            ELSE 'rg.agreement_start_date'
        END,
        ' ',
        IF(p_sort_direction = 'asc', 'ASC', 'DESC')
    );

    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END $$

DELIMITER ;