-- File: sql/sp/sp_delete_user.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_delete_user$$
CREATE PROCEDURE sp_delete_user(
    IN p_user_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update SearchHistory to set user_id to NULL 
    UPDATE SearchHistory 
    SET user_id = NULL
    WHERE user_id = p_user_id;
    
    -- Delete bookmarks
    DELETE FROM BookmarkedGrants 
    WHERE user_id = p_user_id;
    
    DELETE FROM BookmarkedRecipients
    WHERE user_id = p_user_id;
    
    -- Delete the user
    DELETE FROM User 
    WHERE user_id = p_user_id;
    
    COMMIT;
END $$
DELIMITER ;