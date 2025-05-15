-- File: sql/sp/sp_save_institute_bookmark.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_save_institute_bookmark$
CREATE PROCEDURE sp_save_institute_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_institute_id INT UNSIGNED
)
BEGIN
    DECLARE v_exists BOOLEAN DEFAULT FALSE;
    
    -- Check if the bookmark already exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM BookmarkedInstitutes
    WHERE user_id = p_user_id AND institute_id = p_institute_id;
    
    -- Insert only if not exists
    IF NOT v_exists THEN
        INSERT INTO BookmarkedInstitutes (user_id, institute_id)
        VALUES (p_user_id, p_institute_id);
        SELECT 'created' AS status;
    ELSE
        SELECT 'exists' AS status;
    END IF;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_save_institute_bookmark.sql
CREATE OR REPLACE FUNCTION save_institute_bookmark(
    p_user_id INTEGER,
    p_institute_id INTEGER
)
RETURNS TABLE(status TEXT) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_exists BOOLEAN DEFAULT FALSE;
BEGIN
    -- Check if the bookmark already exists
    SELECT EXISTS(
        SELECT 1 
        FROM "BookmarkedInstitutes"
        WHERE user_id = p_user_id AND institute_id = p_institute_id
    ) INTO v_exists;
    
    -- Insert only if not exists
    IF NOT v_exists THEN
        INSERT INTO "BookmarkedInstitutes" (user_id, institute_id)
        VALUES (p_user_id, p_institute_id);
        RETURN QUERY SELECT 'created'::TEXT;
    ELSE
        RETURN QUERY SELECT 'exists'::TEXT;
    END IF;
END;
$$;