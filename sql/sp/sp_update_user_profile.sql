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
