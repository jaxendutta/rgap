-- File: sql/sp/sp_get_filter_options.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_filter_options$$
CREATE PROCEDURE sp_get_filter_options()
BEGIN
    -- Get distinct agencies (from Organization table)
    SELECT DISTINCT org
    FROM Organization
    WHERE org IS NOT NULL AND org != ''
    ORDER BY org;

    -- Get distinct countries (from Institute table)
    SELECT DISTINCT country
    FROM Institute
    WHERE country IS NOT NULL AND country != ''
    ORDER BY country;

    -- Get distinct provinces (from Institute table)
    SELECT DISTINCT province
    FROM Institute
    WHERE province IS NOT NULL AND province != ''
    ORDER BY province;

    -- Get distinct cities (from Institute table)
    SELECT DISTINCT city
    FROM Institute
    WHERE city IS NOT NULL AND city != ''
    ORDER BY city;
    
    -- Get distinct institutes (from Institute table)
    SELECT DISTINCT name
    FROM Institute
    WHERE name IS NOT NULL AND name != ''
    ORDER BY name;
END $$
DELIMITER ;