-- File: sql/sp/sp_get_bookmarked_institute_ids.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_institute_ids$
CREATE PROCEDURE sp_get_bookmarked_institute_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT institute_id
    FROM BookmarkedInstitutes
    WHERE user_id = p_user_id;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_institute_ids.sql
CREATE OR REPLACE FUNCTION get_bookmarked_institute_ids(
    p_user_id INTEGER
)
RETURNS TABLE(institute_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT bi.institute_id
    FROM "BookmarkedInstitutes" bi
    WHERE bi.user_id = p_user_id;
END;
$$;