-- File: sql/sp/sp_get_bookmarked_recipient_ids.sql
/*
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_recipient_ids$
CREATE PROCEDURE sp_get_bookmarked_recipient_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT recipient_id
    FROM BookmarkedRecipients
    WHERE user_id = p_user_id;
END$
DELIMITER ;
*/

-- PostgreSQL version of sp_get_bookmarked_recipient_ids.sql
CREATE OR REPLACE FUNCTION get_bookmarked_recipient_ids(
    p_user_id INTEGER
)
RETURNS TABLE(recipient_id INTEGER) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT br.recipient_id
    FROM "BookmarkedRecipients" br
    WHERE br.user_id = p_user_id;
END;
$$;