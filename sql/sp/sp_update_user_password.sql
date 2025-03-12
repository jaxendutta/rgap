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
