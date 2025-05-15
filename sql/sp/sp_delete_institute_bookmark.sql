-- File: sql/sp/sp_delete_institute_bookmark.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_delete_institute_bookmark$
CREATE PROCEDURE sp_delete_institute_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_institute_id INT UNSIGNED
)
BEGIN
    DECLARE v_rowcount INT;
    
    -- Delete the bookmark if it exists
    DELETE FROM BookmarkedInstitutes
    WHERE user_id = p_user_id AND institute_id = p_institute_id;
    
    -- Check if any rows were deleted
    SET v_rowcount = ROW_COUNT();
    
    IF v_rowcount > 0 THEN
        SELECT 'deleted' AS status;
    ELSE
        SELECT 'not_found' AS status;
    END IF;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_delete_institute_bookmark.sql
CREATE OR REPLACE FUNCTION delete_institute_bookmark(
    p_user_id INTEGER,
    p_institute_id INTEGER
)
RETURNS TABLE(status TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_rowcount INTEGER;
BEGIN
    -- Delete the bookmark if it exists
    DELETE FROM "BookmarkedInstitutes"
    WHERE user_id = p_user_id AND institute_id = p_institute_id;
    
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