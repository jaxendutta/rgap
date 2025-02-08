DELIMITER $$
CREATE PROCEDURE sp_search_combined(
    IN p_user_id INT,
    IN p_search_grant VARCHAR(500),
    IN p_search_recipient VARCHAR(500),
    IN p_search_institution VARCHAR(500)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Check that at least one grant matches the search grant text
    SELECT COUNT(*) INTO v_count
    FROM ResearchGrant
    WHERE agreement_title_en LIKE CONCAT('%', p_search_grant, '%');
    IF v_count = 0 THEN
       SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching grant found.';
    END IF;
    
    -- Check that at least one recipient matches the search recipient text
    SELECT COUNT(*) INTO v_count
    FROM Recipient
    WHERE legal_name LIKE CONCAT('%', p_search_recipient, '%');
    IF v_count = 0 THEN
       SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching recipient found.';
    END IF;
    
    -- Check that at least one institution matches the search institution text
    SELECT COUNT(*) INTO v_count
    FROM Recipient
    WHERE research_organization_name LIKE CONCAT('%', p_search_institution, '%');
    IF v_count = 0 THEN
       SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'No matching institution found.';
    END IF;
    
    -- Insert the combined search record into SearchHistory with all three search parameters and the current timestamp
    INSERT INTO SearchHistory (
        user_id, 
        search_grant, 
        search_recipient, 
        search_institution, 
        search_time, 
        result_count, 
        saved
    )
    VALUES (
        p_user_id, 
        p_search_grant, 
        p_search_recipient, 
        p_search_institution, 
        NOW(), 
        0, 
        FALSE
    );
    
    -- Retrieve matching rows that satisfy all three conditions
    SELECT 
        R.legal_name AS recipient,
        R.research_organization_name AS institution,
        RG.agreement_title_en AS grant_name,
        RG.ref_number AS grant_ref_number,
        RG.agreement_value AS grant_value,
        O.org_title AS organization,
        RG.agreement_start_date AS agreement_start_date,
        RG.agreement_end_date AS agreement_end_date
    FROM ResearchGrant RG
    JOIN Recipient R ON RG.recipient_id = R.recipient_id
    JOIN Organization O ON RG.owner_org = O.owner_org
    WHERE RG.agreement_title_en LIKE CONCAT('%', p_search_grant, '%')
      AND R.legal_name LIKE CONCAT('%', p_search_recipient, '%')
      AND R.research_organization_name LIKE CONCAT('%', p_search_institution, '%');
    
    -- Count the matching rows for the combined search
    SELECT COUNT(*) INTO v_count
    FROM ResearchGrant RG
    JOIN Recipient R ON RG.recipient_id = R.recipient_id
    WHERE RG.agreement_title_en LIKE CONCAT('%', p_search_grant, '%')
      AND R.legal_name LIKE CONCAT('%', p_search_recipient, '%')
      AND R.research_organization_name LIKE CONCAT('%', p_search_institution, '%');
    
    -- Update the SearchHistory record with the result count
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id 
      AND search_grant = p_search_grant
      AND search_recipient = p_search_recipient
      AND search_institution = p_search_institution
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
