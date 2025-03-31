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
        SELECT search_term, frequency
        FROM (
            SELECT 
                normalized_grant AS search_term,
                COUNT(normalized_grant) AS frequency,
                RANK() OVER (ORDER BY COUNT(normalized_grant) DESC) AS ranking
            FROM SearchHistory
            WHERE normalized_grant IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_grant
        ) AS ranked
        WHERE ranking <= 5;

    ELSEIF p_type = 1 THEN
        -- Recipient
        SELECT search_term, frequency
        FROM (
            SELECT 
                normalized_recipient AS search_term,
                COUNT(normalized_recipient) AS frequency,
                RANK() OVER (ORDER BY COUNT(normalized_recipient) DESC) AS ranking
            FROM SearchHistory
            WHERE normalized_recipient IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_recipient
        ) AS ranked
        WHERE ranking <= 5;

    ELSE
        -- Institution
        SELECT search_term, frequency
        FROM (
            SELECT 
                normalized_institution AS search_term,
                COUNT(normalized_institution) AS frequency,
                RANK() OVER (ORDER BY COUNT(normalized_institution) DESC) AS ranking
            FROM SearchHistory
            WHERE normalized_institution IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_institution
        ) AS ranked
        WHERE ranking <= 5;
    END IF;
END $$

DELIMITER ;
