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
            search_grant AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE search_grant IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY search_grant
        ORDER BY frequency DESC
        LIMIT 5;

    ELSEIF p_type = 1 THEN
        -- Recipient
        SELECT 
            search_recipient AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE search_recipient IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY search_recipient
        ORDER BY frequency DESC
        LIMIT 5;

    ELSE
        -- Institute
        SELECT 
            search_institution AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE search_institution IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY search_institution
        ORDER BY frequency DESC
        LIMIT 5;
    END IF;
END $$

DELIMITER ;
