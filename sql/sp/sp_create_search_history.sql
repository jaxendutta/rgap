-- File: sql/sp/sp_create_search_history.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_create_search_history$$
CREATE PROCEDURE sp_create_search_history(
    IN p_user_id INT UNSIGNED,
    IN p_search_recipient VARCHAR(500),
    IN p_search_grant VARCHAR(500),
    IN p_search_institution VARCHAR(500),
    IN p_search_filters JSON,
    IN p_result_count INT
)
BEGIN
    -- Check if at least one search term is provided
    IF (
        (p_search_recipient IS NOT NULL AND p_search_recipient != '') OR
        (p_search_grant IS NOT NULL AND p_search_grant != '') OR
        (p_search_institution IS NOT NULL AND p_search_institution != '')
    ) THEN
        -- Only insert if there's at least one valid search term
        INSERT INTO SearchHistory (
            user_id,
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
            NULLIF(p_search_recipient, ''),
            NULLIF(p_search_grant, ''),
            NULLIF(p_search_institution, ''),
            p_search_filters,
            NOW(),
            p_result_count,
            FALSE
        );
        
        -- Return the new history ID
        SELECT LAST_INSERT_ID() as history_id;
    ELSE
        -- No valid search terms, return NULL to indicate no record was created
        SELECT NULL as history_id;
    END IF;
END $$
DELIMITER ;