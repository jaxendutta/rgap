DELIMITER $$

CREATE PROCEDURE sp_search_combined(
    IN p_user_id INT,
    IN p_search_grant VARCHAR(500),
    IN p_search_recipient VARCHAR(500),
    IN p_search_institution VARCHAR(500)
)
BEGIN
    DECLARE v_count INT DEFAULT 0;

    /*
      Insert the search into SearchHistory.
      The procedure records the search parameters and the current time.
      (If a parameter isn’t used, pass in an empty string or NULL to sp.)
    */
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

    /*
      Retrieve matching rows.
      The query joins ResearchGrant with Recipient so that we can apply the various filters.
      For each filter, if the search parameter is NULL or an empty string, that condition is ignored.
    */
    SELECT 
        RG.grant_id,
        RG.agreement_title_en AS matched_grant_text,
        RG.agreement_start_date AS grant_date,
        RG.agreement_value AS grant_value,
        R.recipient_id,
        R.legal_name AS matched_recipient_text,
        R.research_organization_name AS matched_institution_text
    FROM ResearchGrant RG
    JOIN Recipient R ON RG.recipient_id = R.recipient_id
    WHERE 
        (
            p_search_grant IS NULL 
            OR p_search_grant = '' 
            OR RG.agreement_title_en LIKE CONCAT('%', p_search_grant, '%')
        )
        AND (
            p_search_recipient IS NULL 
            OR p_search_recipient = '' 
            OR R.legal_name LIKE CONCAT('%', p_search_recipient, '%')
        )
        AND (
            p_search_institution IS NULL 
            OR p_search_institution = '' 
            OR R.research_organization_name LIKE CONCAT('%', p_search_institution, '%')
        );

    /*
      Count the matching rows using the same filter conditions.
    */
    SELECT COUNT(*) INTO v_count
    FROM ResearchGrant RG
    JOIN Recipient R ON RG.recipient_id = R.recipient_id
    WHERE 
        (
            p_search_grant IS NULL 
            OR p_search_grant = '' 
            OR RG.agreement_title_en LIKE CONCAT('%', p_search_grant, '%')
        )
        AND (
            p_search_recipient IS NULL 
            OR p_search_recipient = '' 
            OR R.legal_name LIKE CONCAT('%', p_search_recipient, '%')
        )
        AND (
            p_search_institution IS NULL 
            OR p_search_institution = '' 
            OR R.research_organization_name LIKE CONCAT('%', p_search_institution, '%')
        );

    /*
      Update the most recent SearchHistory record for this user with the result count.
      The ORDER BY ... LIMIT 1 clause ensures we update the latest record.
    */
    UPDATE SearchHistory
    SET result_count = v_count
    WHERE user_id = p_user_id
    ORDER BY search_time DESC
    LIMIT 1;
END $$
DELIMITER ;
