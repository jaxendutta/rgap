DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_popular_search$$
CREATE PROCEDURE sp_get_popular_search(
    IN p_start TIMESTAMP,
    IN p_end TIMESTAMP,
    IN p_type INT
)
BEGIN
    IF p_type = 0 THEN
        -- Grant
        SELECT 
            normalized_grant AS search_term,
            COUNT(normalized_grant) AS frequency
        FROM SearchHistory
        WHERE normalized_grant IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_grant
        ORDER BY frequency DESC
        LIMIT 5;

    ELSEIF p_type = 1 THEN
        -- Recipient
        SELECT 
            normalized_recipient AS search_term,
            COUNT(normalized_recipient) AS frequency
        FROM SearchHistory
        WHERE normalized_recipient IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_recipient
        ORDER BY frequency DESC
        LIMIT 5;

    ELSE
        -- Institute
        SELECT 
            normalized_institution AS search_term,
            COUNT(normalized_institution) AS frequency
        FROM SearchHistory
        WHERE normalized_institution IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_institution
        ORDER BY frequency DESC
        LIMIT 5;
    END IF;
END $$

DELIMITER ;