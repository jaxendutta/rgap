-- File: sp_update_user_profile.sql
/*
DELIMITER $$
CREATE PROCEDURE sp_update_user_profile(
    IN p_user_id INT,
    IN p_email VARCHAR(255),
    IN p_name VARCHAR(100)
)
BEGIN
    UPDATE User
    SET email = p_email, name = p_name
    WHERE user_id = p_user_id;
    
    -- Return the updated user row so that we can get the API to update the context
    SELECT user_id, email, name, created_at FROM User WHERE user_id = p_user_id;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_update_user_profile.sql
CREATE OR REPLACE FUNCTION update_user_profile(
    p_user_id INTEGER,
    p_email VARCHAR(255),
    p_name VARCHAR(100)
)
RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR(255),
    name VARCHAR(100),
    created_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE "User"
    SET email = p_email, name = p_name
    WHERE user_id = p_user_id;
    
    -- Return the updated user row
    RETURN QUERY
    SELECT 
        u.user_id, 
        u.email, 
        u.name, 
        u.created_at 
    FROM "User" u 
    WHERE u.user_id = p_user_id;
END;
$$;