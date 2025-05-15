-- File: sql/sp/sp_delete_grant_bookmark.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_delete_grant_bookmark$$
CREATE PROCEDURE sp_delete_grant_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_grant_id INT UNSIGNED
)
BEGIN
    DECLARE v_rowcount INT;
    
    -- Delete the bookmark if it exists
    DELETE FROM BookmarkedGrants
    WHERE user_id = p_user_id AND grant_id = p_grant_id;
    
    -- Check if any rows were deleted
    SET v_rowcount = ROW_COUNT();
    
    IF v_rowcount > 0 THEN
        SELECT 'deleted' AS status;
    ELSE
        SELECT 'not_found' AS status;
    END IF;
END$$
DELIMITER ;
*/

-- PostgreSQL version of sp_delete_grant_bookmark.sql
CREATE OR REPLACE FUNCTION delete_grant_bookmark(
    p_user_id INTEGER,
    p_grant_id INTEGER
)
RETURNS TABLE(status TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_rowcount INTEGER;
BEGIN
    -- Delete the bookmark if it exists
    DELETE FROM "BookmarkedGrants"
    WHERE user_id = p_user_id AND grant_id = p_grant_id;
    
    -- Get the number of affected rows
    GET DIAGNOSTICS v_rowcount = ROW_COUNT;
    
    -- Return appropriate status
    IF v_rowcount > 0 THEN
        RETURN QUERY SELECT 'deleted'::TEXT;
    ELSE
        RETURN QUERY SELECT 'not_found'::TEXT;
    END IF;
END;
$$;