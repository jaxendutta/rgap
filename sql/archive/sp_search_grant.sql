DELIMITER $$
CREATE PROCEDURE sp_search_grant(
    IN p_user_id INT,
    IN p_search VARCHAR(500)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    
    -- Insert the search record for a grant search into SearchHistory with the current timestamp
    INSERT INTO SearchHistory (
        user_id, 
        search_grant, 
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
    
    -- Return matching grant records with recipient and organization info
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
    WHERE RG.agreement_title_en LIKE CONCAT('%', p_search, '%');
    
    -- Count the matching rows
    SELECT COUNT(*) INTO v_count
    FROM ResearchGrant RG
    WHERE RG.agreement_title_en LIKE CONCAT('%', p_search, '%');
    
    -- Update the SearchHistory record with the result count
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id 
      AND search_grant = p_search
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
