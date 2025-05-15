-- File: sql/sp/sp_check_user_exists.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_check_user_exists$$
CREATE PROCEDURE sp_check_user_exists(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT COUNT(*) > 0 AS user_exists 
    FROM User
    WHERE user_id = p_user_id;
END$$
DELIMITER ;
*/
-- PostgreSQL version of sp_check_user_exists
CREATE OR REPLACE FUNCTION check_user_exists(
    p_user_id INTEGER
)
RETURNS TABLE(user_exists BOOLEAN) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT COUNT(*) > 0 AS user_exists 
    FROM "User"
    WHERE user_id = p_user_id;
END;
$$;