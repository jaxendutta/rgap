-- File: sp_get_popular_searches.sql
/*
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
*/

-- PostgreSQL version of sp_get_popular_searches.sql
CREATE OR REPLACE FUNCTION get_popular_searches(
    p_start TIMESTAMP,
    p_end TIMESTAMP,
    p_category VARCHAR(20),
    p_page INTEGER,
    p_limit INTEGER
)
RETURNS TABLE(
    total_count BIGINT,
    category TEXT,
    search_term VARCHAR(500),
    frequency BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_offset INTEGER;
BEGIN
    -- Calculate offset for pagination
    v_offset := (p_page - 1) * p_limit;
    
    -- Check if a specific category is requested
    IF p_category IS NOT NULL AND p_category IN ('recipient', 'institute', 'grant') THEN
        -- Return total count for pagination metadata
        RETURN QUERY
        WITH total AS (
            SELECT COUNT(DISTINCT 
                CASE 
                    WHEN p_category = 'grant' THEN normalized_grant
                    WHEN p_category = 'recipient' THEN normalized_recipient
                    ELSE normalized_institution
                END
            ) AS count
            FROM "SearchHistory"
            WHERE 
                CASE 
                    WHEN p_category = 'grant' THEN normalized_grant IS NOT NULL
                    WHEN p_category = 'recipient' THEN normalized_recipient IS NOT NULL
                    ELSE normalized_institution IS NOT NULL
                END
                AND search_time BETWEEN p_start AND p_end
        ),
        results AS (
            SELECT 
                CASE 
                    WHEN p_category = 'grant' THEN normalized_grant
                    WHEN p_category = 'recipient' THEN normalized_recipient
                    ELSE normalized_institution
                END AS term,
                COUNT(*) AS freq
            FROM "SearchHistory"
            WHERE 
                CASE 
                    WHEN p_category = 'grant' THEN normalized_grant IS NOT NULL
                    WHEN p_category = 'recipient' THEN normalized_recipient IS NOT NULL
                    ELSE normalized_institution IS NOT NULL
                END
                AND search_time BETWEEN p_start AND p_end
            GROUP BY term
            ORDER BY freq DESC
            LIMIT p_limit OFFSET v_offset
        )
        SELECT 
            t.count, 
            p_category::TEXT, 
            r.term, 
            r.freq
        FROM total t, results r;
    ELSE
        -- If no specific category, get all categories with counts
        RETURN QUERY
        WITH grant_terms AS (
            SELECT 
                'grant'::TEXT AS cat,
                normalized_grant AS term,
                COUNT(*) AS freq
            FROM "SearchHistory"
            WHERE normalized_grant IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_grant
            ORDER BY freq DESC
            LIMIT p_limit
        ),
        recipient_terms AS (
            SELECT 
                'recipient'::TEXT AS cat,
                normalized_recipient AS term,
                COUNT(*) AS freq
            FROM "SearchHistory"
            WHERE normalized_recipient IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_recipient
            ORDER BY freq DESC
            LIMIT p_limit
        ),
        institute_terms AS (
            SELECT 
                'institute'::TEXT AS cat,
                normalized_institution AS term,
                COUNT(*) AS freq
            FROM "SearchHistory"
            WHERE normalized_institution IS NOT NULL
              AND search_time BETWEEN p_start AND p_end
            GROUP BY normalized_institution
            ORDER BY freq DESC
            LIMIT p_limit
        ),
        total AS (
            SELECT 
                (SELECT COUNT(*) FROM grant_terms) +
                (SELECT COUNT(*) FROM recipient_terms) +
                (SELECT COUNT(*) FROM institute_terms) AS count
        ),
        combined AS (
            SELECT * FROM grant_terms
            UNION ALL
            SELECT * FROM recipient_terms
            UNION ALL 
            SELECT * FROM institute_terms
        )
        SELECT 
            t.count,
            c.cat,
            c.term,
            c.freq
        FROM total t, combined c;
    END IF;
END;
$$;