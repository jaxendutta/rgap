-- File: sql/sp/sp_get_bookmarked_grant_ids.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_bookmarked_grant_ids$$
CREATE PROCEDURE sp_get_bookmarked_grant_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT grant_id
    FROM BookmarkedGrants
    WHERE user_id = p_user_id;
END$$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_grant_ids.sql
CREATE OR REPLACE FUNCTION get_bookmarked_grant_ids(
    p_user_id INTEGER
)
RETURNS TABLE(grant_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT bg.grant_id
    FROM "BookmarkedGrants" bg
    WHERE bg.user_id = p_user_id;
END;
$$;