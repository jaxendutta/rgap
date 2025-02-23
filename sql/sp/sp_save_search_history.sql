-- File: sql/sp/sp_save_search_history.sql
DELIMITER $$
CREATE PROCEDURE sp_save_search_history(
    IN p_user_id INT,
    IN p_quick_search VARCHAR(500),
    IN p_search_recipient VARCHAR(500),
    IN p_search_grant VARCHAR(500),
    IN p_search_institution VARCHAR(500),
    IN p_search_filters JSON,
    IN p_result_count INT
)
BEGIN
    INSERT INTO SearchHistory (
        user_id,
        quick_search,
        search_recipient,
        search_grant,
        search_institution,
        search_filters,
        search_time,
        result_count,
        saved
    )
    VALUES (
        p_user_id,
        p_quick_search,
        p_search_recipient,
        p_search_grant,
        p_search_institution,
        p_search_filters,
        NOW(),
        p_result_count,
        FALSE
    );
    
    SELECT LAST_INSERT_ID() as history_id;
END $$
DELIMITER ;