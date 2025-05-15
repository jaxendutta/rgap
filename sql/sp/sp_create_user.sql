-- File: sql/sp/sp_create_user.sql
/*
DELIMITER $$
CREATE PROCEDURE sp_create_user(
    IN p_email VARCHAR(255),
    IN p_name VARCHAR(100),
    IN p_password_hash VARCHAR(255)
)
BEGIN
    INSERT INTO User (email, name, password_hash, created_at)
    VALUES (p_email, p_name, p_password_hash, NOW());
    SELECT LAST_INSERT_ID() AS user_id;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_create_user.sql
CREATE OR REPLACE FUNCTION create_user(
    p_email VARCHAR(255),
    p_name VARCHAR(100),
    p_password_hash VARCHAR(255)
) 
RETURNS TABLE(user_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    INSERT INTO "User" (email, name, password_hash, created_at)
    VALUES (p_email, p_name, p_password_hash, NOW())
    RETURNING "User".user_id;
END;
$$;