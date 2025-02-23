DELIMITER $$
CREATE PROCEDURE sp_search_recipient(
    IN p_user_id INT,
    IN p_search VARCHAR(500)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Insert the search record into SearchHistory with the current timestamp
    INSERT INTO SearchHistory (
        user_id, 
        search_recipient, 
        search_time, 
        result_count, 
        saved
    )
    VALUES (
        p_user_id, 
        p_search, 
        NOW(), 
        0, 
        FALSE
    );
    
    -- Return matching grant records for recipients whose legal_name matches the search text
    SELECT 
        R.legal_name AS recipient,
        R.research_organization_name AS institution,
        RG.agreement_title_en AS grant_name,
        RG.ref_number AS grant_ref_number,
        RG.agreement_value AS grant_value,
        O.org_title AS organization,
        RG.agreement_start_date AS agreement_start_date,
        RG.agreement_end_date AS agreement_end_date
    FROM Recipient R
    JOIN ResearchGrant RG ON R.recipient_id = RG.recipient_id
    JOIN Organization O ON RG.owner_org = O.owner_org
    WHERE R.legal_name LIKE CONCAT('%', p_search, '%');
    
    -- Count the matching rows
    SELECT COUNT(*) INTO v_count
    FROM Recipient R
    JOIN ResearchGrant RG ON R.recipient_id = RG.recipient_id
    WHERE R.legal_name LIKE CONCAT('%', p_search, '%');
    
    -- Update the most recent SearchHistory record for this user with the result count
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id 
      AND search_recipient = p_search
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
