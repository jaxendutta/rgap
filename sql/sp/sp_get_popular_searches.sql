DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_popular_searches$$
CREATE PROCEDURE sp_get_popular_searches(
    IN p_start TIMESTAMP,
    IN p_end TIMESTAMP,
    IN p_category VARCHAR(20),
    IN p_page INT,
    IN p_limit INT
)
BEGIN
    DECLARE v_offset INT;
    
    -- Calculate offset for pagination
    SET v_offset = (p_page - 1) * p_limit;
    
    -- Check if a specific category is requested
    IF p_category IS NOT NULL AND p_category IN ('recipient', 'institute', 'grant') THEN
        -- First query: Get total count for pagination metadata
        IF p_category = 'grant' THEN
            SELECT COUNT(DISTINCT normalized_grant) as total_count 
            FROM SearchHistory
            WHERE normalized_grant IS NOT NULL 
            AND search_time BETWEEN p_start AND p_end;
            
            -- Second query: Get the grant search terms with pagination
            SELECT normalized_grant AS search_term, COUNT(*) AS frequency
            FROM SearchHistory
            WHERE normalized_grant IS NOT NULL
            AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_grant
            ORDER BY frequency DESC
            LIMIT v_offset, p_limit;
            
        ELSEIF p_category = 'recipient' THEN
            SELECT COUNT(DISTINCT normalized_recipient) as total_count 
            FROM SearchHistory
            WHERE normalized_recipient IS NOT NULL 
            AND search_time BETWEEN p_start AND p_end;
            
            -- Second query: Get the recipient search terms with pagination
            SELECT normalized_recipient AS search_term, COUNT(*) AS frequency
            FROM SearchHistory
            WHERE normalized_recipient IS NOT NULL
            AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_recipient
            ORDER BY frequency DESC
            LIMIT v_offset, p_limit;
            
        ELSE -- institute
            SELECT COUNT(DISTINCT normalized_institution) as total_count 
            FROM SearchHistory
            WHERE normalized_institution IS NOT NULL 
            AND search_time BETWEEN p_start AND p_end;
            
            -- Second query: Get the institute search terms with pagination
            SELECT normalized_institution AS search_term, COUNT(*) AS frequency
            FROM SearchHistory
            WHERE normalized_institution IS NOT NULL
            AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_institution
            ORDER BY frequency DESC
            LIMIT v_offset, p_limit;
        END IF;
    ELSE
        -- If no specific category, get all categories with counts
        -- First, get total counts
        SELECT 
            (SELECT COUNT(DISTINCT normalized_grant) FROM SearchHistory 
             WHERE normalized_grant IS NOT NULL AND search_time BETWEEN p_start AND p_end) +
            (SELECT COUNT(DISTINCT normalized_recipient) FROM SearchHistory 
             WHERE normalized_recipient IS NOT NULL AND search_time BETWEEN p_start AND p_end) +
            (SELECT COUNT(DISTINCT normalized_institution) FROM SearchHistory 
             WHERE normalized_institution IS NOT NULL AND search_time BETWEEN p_start AND p_end)
        AS total_count;
        
        -- Get grant terms
        SELECT 
            'grant' AS category,
            normalized_grant AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE normalized_grant IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_grant
        ORDER BY frequency DESC
        LIMIT p_limit;
        
        -- Get recipient terms
        SELECT 
            'recipient' AS category,
            normalized_recipient AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE normalized_recipient IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_recipient
        ORDER BY frequency DESC
        LIMIT p_limit;
        
        -- Get institute terms
        SELECT 
            'institute' AS category,
            normalized_institution AS search_term,
            COUNT(*) AS frequency
        FROM SearchHistory
        WHERE normalized_institution IS NOT NULL
          AND search_time BETWEEN p_start AND p_end
        GROUP BY normalized_institution
        ORDER BY frequency DESC
        LIMIT p_limit;
    END IF;
END$$

DELIMITER ;