-- File: sql/sp/sp_get_bookmarked_searches.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_searches$
CREATE PROCEDURE sp_get_bookmarked_searches(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT *
    FROM SearchHistory
    WHERE user_id = p_user_id AND bookmarked = TRUE
    ORDER BY search_time DESC;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_searches.sql
CREATE OR REPLACE FUNCTION get_bookmarked_searches(
    p_user_id INTEGER
)
RETURNS TABLE(
    history_id INTEGER,
    user_id INTEGER,
    search_recipient VARCHAR(500),
    search_grant VARCHAR(500),
    search_institution VARCHAR(500),
    normalized_recipient VARCHAR(500),
    normalized_grant VARCHAR(500),
    normalized_institution VARCHAR(500),
    search_filters JSONB,
    search_time TIMESTAMP,
    result_count INTEGER,
    bookmarked BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM "SearchHistory" sh
    WHERE sh.user_id = p_user_id AND sh.bookmarked = TRUE
    ORDER BY sh.search_time DESC;
END;
$$;