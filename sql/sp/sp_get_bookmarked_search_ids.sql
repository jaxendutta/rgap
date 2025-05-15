-- File: sql/sp/sp_get_bookmarked_search_ids.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_search_ids$
CREATE PROCEDURE sp_get_bookmarked_search_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT history_id
    FROM SearchHistory
    WHERE user_id = p_user_id AND bookmarked = TRUE;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_search_ids.sql
CREATE OR REPLACE FUNCTION get_bookmarked_search_ids(
    p_user_id INTEGER
)
RETURNS TABLE(history_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT sh.history_id
    FROM "SearchHistory" sh
    WHERE sh.user_id = p_user_id AND sh.bookmarked = TRUE;
END;
$$;