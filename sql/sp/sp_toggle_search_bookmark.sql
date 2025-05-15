-- File: sql/sp/sp_toggle_search_bookmark.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_toggle_search_bookmark$
CREATE PROCEDURE sp_toggle_search_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_history_id INT UNSIGNED
)
BEGIN
    DECLARE v_current_state BOOLEAN;
    
    -- Get current bookmark state
    SELECT bookmarked INTO v_current_state
    FROM SearchHistory
    WHERE history_id = p_history_id
    LIMIT 1;
    
    -- Toggle the bookmark state
    UPDATE SearchHistory
    SET bookmarked = NOT IFNULL(v_current_state, FALSE)
    WHERE history_id = p_history_id;
    
    -- Return the new state
    SELECT NOT IFNULL(v_current_state, FALSE) AS bookmarked;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_toggle_search_bookmark.sql
CREATE OR REPLACE FUNCTION toggle_search_bookmark(
    p_user_id INTEGER,
    p_history_id INTEGER
)
RETURNS TABLE(bookmarked BOOLEAN) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_state BOOLEAN;
BEGIN
    -- Get current bookmark state
    SELECT bookmarked INTO v_current_state
    FROM "SearchHistory"
    WHERE history_id = p_history_id
    LIMIT 1;
    
    -- Toggle the bookmark state
    UPDATE "SearchHistory"
    SET bookmarked = NOT COALESCE(v_current_state, FALSE)
    WHERE history_id = p_history_id;
    
    -- Return the new state
    RETURN QUERY 
    SELECT NOT COALESCE(v_current_state, FALSE);
END;
$$;