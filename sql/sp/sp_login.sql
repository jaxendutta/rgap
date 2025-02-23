-- File: sql/sp/sp_login.sql
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