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
