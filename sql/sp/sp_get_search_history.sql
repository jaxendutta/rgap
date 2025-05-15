-- File: sql/sp/sp_get_search_history.sql
/*
DELIMITER $$
CREATE PROCEDURE sp_get_search_history(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    SELECT 
        history_id,
        search_recipient,
        search_grant,
        search_institution,
        search_filters,
        search_time,
        result_count,
        saved
    FROM SearchHistory
    WHERE user_id = p_user_id
    ORDER BY search_time DESC
    LIMIT p_limit;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_search_history.sql
CREATE OR REPLACE FUNCTION get_search_history(
    p_user_id INTEGER,
    p_limit INTEGER
)
RETURNS TABLE(
    history_id INTEGER,
    search_recipient VARCHAR(500),
    search_grant VARCHAR(500),
    search_institution VARCHAR(500),
    search_filters JSONB,
    search_time TIMESTAMP,
    result_count INTEGER,
    saved BOOLEAN
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.history_id,
        sh.search_recipient,
        sh.search_grant,
        sh.search_institution,
        sh.search_filters,
        sh.search_time,
        sh.result_count,
        sh.bookmarked
    FROM "SearchHistory" sh
    WHERE sh.user_id = p_user_id
    ORDER BY sh.search_time DESC
    LIMIT p_limit;
END;
$$;