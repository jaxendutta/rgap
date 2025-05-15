-- File: sql/sp/sp_save_grant_bookmark.sql
/*
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_save_grant_bookmark$$
CREATE PROCEDURE sp_save_grant_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_grant_id INT UNSIGNED
)
BEGIN
    DECLARE v_exists BOOLEAN DEFAULT FALSE;
    
    -- Check if the bookmark already exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM BookmarkedGrants
    WHERE user_id = p_user_id AND grant_id = p_grant_id;
    
    -- Insert only if not exists
    IF NOT v_exists AND p_grant_id IS NOT NULL THEN
        INSERT INTO BookmarkedGrants (user_id, grant_id)
        VALUES (p_user_id, p_grant_id);
        SELECT 'created' AS status;
    ELSE
        SELECT 'exists' AS status;
    END IF;
END$$
DELIMITER ;
*/

