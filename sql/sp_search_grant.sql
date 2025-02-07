DELIMITER $$
CREATE PROCEDURE sp_search_grant (
    IN p_user_id INT, --current user_id
    IN p_search VARCHAR(500) --curent user searched text
)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    -- Insert the search query into SearchHistory (for grant search) with current time
    INSERT INTO SearchHistory (user_id, search_grant, search_time, result_count, saved)
    VALUES (p_user_id, p_search, NOW(), 0, FALSE);

    -- Return matching rows from ResearchGrant
    SELECT
        -- what if null for all should we have options
        agreement_title_en AS matched_text,
        agreement_start_date AS match_date, 
        agreement_value AS match_value
    FROM ResearchGrant
    WHERE agreement_title_en LIKE CONCAT('%', p_search, '%');

    -- Count the matching rows
    SELECT COUNT(*) INTO v_count
    FROM ResearchGrant
    WHERE agreement_title_en LIKE CONCAT('%', p_search, '%');

    -- Update the SearchHistory record with the count
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id AND search_grant = p_search
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
