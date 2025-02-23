-- File: sql/sp/sp_get_filter_options.sql
DELIMITER $$
CREATE PROCEDURE sp_get_filter_options()
BEGIN
    -- Get distinct agencies
    SELECT DISTINCT abbreviation
    FROM Organization
    WHERE abbreviation IS NOT NULL AND abbreviation != ''
    ORDER BY abbreviation;

    -- Get distinct countries
    SELECT DISTINCT country
    FROM Recipient
    WHERE country IS NOT NULL AND country != ''
    ORDER BY country;

    -- Get distinct provinces
    SELECT DISTINCT province
    FROM Recipient
    WHERE province IS NOT NULL AND province != ''
    ORDER BY province;

    -- Get distinct cities 
    SELECT DISTINCT city
    FROM Recipient
    WHERE city IS NOT NULL AND city != ''
    ORDER BY city;
END $$
DELIMITER ;