-- File: sql/sp/sp_login.sql
/*
DELIMITER $$
CREATE PROCEDURE sp_login(
    IN p_email VARCHAR(255)
)
BEGIN
    SELECT 
        user_id,
        email,
        name,
        password_hash,
        created_at
    FROM User 
    WHERE email = p_email;
END $$
DELIMITER ;
*/

-- PostgreSQL version of sp_login.sql
CREATE OR REPLACE FUNCTION login(
    p_email VARCHAR(255)
)
RETURNS TABLE(
    user_id INTEGER,
    email VARCHAR(255),
    name VARCHAR(100),
    password_hash VARCHAR(255),
    created_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.user_id,
        u.email,
        u.name,
        u.password_hash,
        u.created_at
    FROM "User" u
    WHERE u.email = p_email;
END;
$$;