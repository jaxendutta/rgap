DELIMITER $$
CREATE PROCEDURE sp_search_recipient (
    IN p_user_id INT,
    IN p_search VARCHAR(500)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    -- Insert the search query into SearchHistory (for recipient search) with current time
    INSERT INTO SearchHistory (user_id, search_recipient, search_time, result_count, saved)
    VALUES (p_user_id, p_search, NOW(), 0, FALSE);

    -- Return matching rows from Recipient
    SELECT 
        -- could be null what to do?
        legal_name AS matched_text,
        NULL AS match_date, -- what to include for these
        NULL AS match_value
    FROM Recipient
    WHERE legal_name LIKE CONCAT('%', p_search, '%');

    -- Count the matching rows
    SELECT COUNT(*) INTO v_count
    FROM Recipient
    WHERE legal_name LIKE CONCAT('%', p_search, '%');

    -- Update the SearchHistory record with the count
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id AND search_recipient = p_search
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
