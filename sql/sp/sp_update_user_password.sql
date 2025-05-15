-- File: sp_update_user_password.sql
/*
DELIMITER $$
CREATE PROCEDURE sp_update_user_password(
    IN p_user_id INT,
    IN p_new_password_hash VARCHAR(255)
)
BEGIN
    UPDATE User
    SET password_hash = p_new_password_hash
    WHERE user_id = p_user_id;
    
    SELECT user_id FROM User WHERE user_id = p_user_id;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_update_user_password.sql
CREATE OR REPLACE FUNCTION update_user_password(
    p_user_id INTEGER,
    p_new_password_hash VARCHAR(255)
)
RETURNS TABLE(user_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "User"
    SET password_hash = p_new_password_hash
    WHERE user_id = p_user_id;
    
    RETURN QUERY
    SELECT u.user_id FROM "User" u WHERE u.user_id = p_user_id;
END;
$$;
