-- File: sql/sp/sp_get_search_history.sql
DELIMITER $$
CREATE PROCEDURE sp_get_search_history(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    SELECT 
        history_id,
        search_recipient,
        search_grant,
        search_institution,
        search_filters,
        search_time,
        result_count,
        saved
    FROM SearchHistory
    WHERE user_id = p_user_id
    ORDER BY search_time DESC
    LIMIT p_limit;
END $$
DELIMITER ;