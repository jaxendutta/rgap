-- File: sql/sp/sp_check_user_exists.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_check_user_exists$$
CREATE PROCEDURE sp_check_user_exists(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT COUNT(*) > 0 AS user_exists 
    FROM User
    WHERE user_id = p_user_id;
END$$
DELIMITER ;

-- File: sql/sp/sp_save_grant_bookmark.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_save_grant_bookmark$$
CREATE PROCEDURE sp_save_grant_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_grant_id INT UNSIGNED
)
BEGIN
    DECLARE v_exists BOOLEAN DEFAULT FALSE;
    
    -- Check if the bookmark already exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM BookmarkedGrants
    WHERE user_id = p_user_id AND grant_id = p_grant_id;
    
    -- Insert only if not exists
    IF NOT v_exists AND p_grant_id IS NOT NULL THEN
        INSERT INTO BookmarkedGrants (user_id, grant_id)
        VALUES (p_user_id, p_grant_id);
        SELECT 'created' AS status;
    ELSE
        SELECT 'exists' AS status;
    END IF;
END$$
DELIMITER ;

-- File: sql/sp/sp_delete_grant_bookmark.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_delete_grant_bookmark$$
CREATE PROCEDURE sp_delete_grant_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_grant_id INT UNSIGNED
)
BEGIN
    DECLARE v_rowcount INT;
    
    -- Delete the bookmark if it exists
    DELETE FROM BookmarkedGrants
    WHERE user_id = p_user_id AND grant_id = p_grant_id;
    
    -- Check if any rows were deleted
    SET v_rowcount = ROW_COUNT();
    
    IF v_rowcount > 0 THEN
        SELECT 'deleted' AS status;
    ELSE
        SELECT 'not_found' AS status;
    END IF;
END$$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_grant_ids.sql
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_get_bookmarked_grant_ids$$
CREATE PROCEDURE sp_get_bookmarked_grant_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT grant_id
    FROM BookmarkedGrants
    WHERE user_id = p_user_id;
END$$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_grants.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_grants$
CREATE PROCEDURE sp_get_bookmarked_grants(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT 
        rg.*,
        r.legal_name,
        i.name AS research_organization_name,
        i.institute_id,
        i.city,
        i.province,
        i.country,
        o.org,
        o.org_title,
        p.name_en AS prog_title_en,
        p.purpose_en AS prog_purpose_en
    FROM BookmarkedGrants bg
    JOIN ResearchGrant rg ON bg.grant_id = rg.grant_id
    JOIN Recipient r ON rg.recipient_id = r.recipient_id
    JOIN Institute i ON r.institute_id = i.institute_id
    JOIN Organization o ON rg.org = o.org
    LEFT JOIN Program p ON rg.prog_id = p.prog_id
    WHERE bg.user_id = p_user_id
    ORDER BY rg.agreement_start_date DESC;
END$
DELIMITER ;

-- File: sql/sp/sp_save_recipient_bookmark.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_save_recipient_bookmark$
CREATE PROCEDURE sp_save_recipient_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_recipient_id INT UNSIGNED
)
BEGIN
    DECLARE v_exists BOOLEAN DEFAULT FALSE;
    
    -- Check if the bookmark already exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM BookmarkedRecipients
    WHERE user_id = p_user_id AND recipient_id = p_recipient_id;
    
    -- Insert only if not exists
    IF NOT v_exists THEN
        INSERT INTO BookmarkedRecipients (user_id, recipient_id)
        VALUES (p_user_id, p_recipient_id);
        SELECT 'created' AS status;
    ELSE
        SELECT 'exists' AS status;
    END IF;
END$
DELIMITER ;

-- File: sql/sp/sp_delete_recipient_bookmark.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_delete_recipient_bookmark$
CREATE PROCEDURE sp_delete_recipient_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_recipient_id INT UNSIGNED
)
BEGIN
    DECLARE v_rowcount INT;
    
    -- Delete the bookmark if it exists
    DELETE FROM BookmarkedRecipients
    WHERE user_id = p_user_id AND recipient_id = p_recipient_id;
    
    -- Check if any rows were deleted
    SET v_rowcount = ROW_COUNT();
    
    IF v_rowcount > 0 THEN
        SELECT 'deleted' AS status;
    ELSE
        SELECT 'not_found' AS status;
    END IF;
END$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_recipient_ids.sql
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

-- File: sql/sp/sp_get_bookmarked_recipients_with_stats.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_recipients_with_stats$
CREATE PROCEDURE sp_get_bookmarked_recipients_with_stats(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT 
        r.*,
        i.name AS research_organization_name,
        i.city,
        i.province,
        i.country,
        COUNT(DISTINCT rg.grant_id) AS grant_count,
        COALESCE(SUM(rg.agreement_value), 0) AS total_funding,
        MIN(rg.agreement_start_date) AS first_grant_date,
        MAX(rg.agreement_start_date) AS latest_grant_date
    FROM BookmarkedRecipients br
    JOIN Recipient r ON br.recipient_id = r.recipient_id
    JOIN Institute i ON r.institute_id = i.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE br.user_id = p_user_id
    GROUP BY r.recipient_id
    ORDER BY total_funding DESC;
END$
DELIMITER ;

-- File: sql/sp/sp_save_institute_bookmark.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_save_institute_bookmark$
CREATE PROCEDURE sp_save_institute_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_institute_id INT UNSIGNED
)
BEGIN
    DECLARE v_exists BOOLEAN DEFAULT FALSE;
    
    -- Check if the bookmark already exists
    SELECT COUNT(*) > 0 INTO v_exists
    FROM BookmarkedInstitutes
    WHERE user_id = p_user_id AND institute_id = p_institute_id;
    
    -- Insert only if not exists
    IF NOT v_exists THEN
        INSERT INTO BookmarkedInstitutes (user_id, institute_id)
        VALUES (p_user_id, p_institute_id);
        SELECT 'created' AS status;
    ELSE
        SELECT 'exists' AS status;
    END IF;
END$
DELIMITER ;

-- File: sql/sp/sp_delete_institute_bookmark.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_delete_institute_bookmark$
CREATE PROCEDURE sp_delete_institute_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_institute_id INT UNSIGNED
)
BEGIN
    DECLARE v_rowcount INT;
    
    -- Delete the bookmark if it exists
    DELETE FROM BookmarkedInstitutes
    WHERE user_id = p_user_id AND institute_id = p_institute_id;
    
    -- Check if any rows were deleted
    SET v_rowcount = ROW_COUNT();
    
    IF v_rowcount > 0 THEN
        SELECT 'deleted' AS status;
    ELSE
        SELECT 'not_found' AS status;
    END IF;
END$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_institute_ids.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_institute_ids$
CREATE PROCEDURE sp_get_bookmarked_institute_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT institute_id
    FROM BookmarkedInstitutes
    WHERE user_id = p_user_id;
END$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_institutes_with_stats.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_institutes_with_stats$
CREATE PROCEDURE sp_get_bookmarked_institutes_with_stats(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT 
        i.*,
        COUNT(DISTINCT r.recipient_id) as recipient_count,
        COUNT(DISTINCT rg.grant_id) as grant_count,
        COALESCE(SUM(rg.agreement_value), 0) as total_funding,
        MAX(rg.agreement_start_date) as latest_grant_date
    FROM BookmarkedInstitutes bi
    JOIN Institute i ON bi.institute_id = i.institute_id
    LEFT JOIN Recipient r ON i.institute_id = r.institute_id
    LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
    WHERE bi.user_id = p_user_id
    GROUP BY i.institute_id
    ORDER BY total_funding DESC;
END$
DELIMITER ;

-- File: sql/sp/sp_toggle_search_bookmark.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_toggle_search_bookmark$
CREATE PROCEDURE sp_toggle_search_bookmark(
    IN p_user_id INT UNSIGNED,
    IN p_history_id INT UNSIGNED
)
BEGIN
    DECLARE v_current_state BOOLEAN;
    
    -- Get current bookmark state
    SELECT bookmarked INTO v_current_state
    FROM SearchHistory
    WHERE history_id = p_history_id
    LIMIT 1;
    
    -- Toggle the bookmark state
    UPDATE SearchHistory
    SET bookmarked = NOT IFNULL(v_current_state, FALSE)
    WHERE history_id = p_history_id;
    
    -- Return the new state
    SELECT NOT IFNULL(v_current_state, FALSE) AS bookmarked;
END$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_search_ids.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_search_ids$
CREATE PROCEDURE sp_get_bookmarked_search_ids(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT history_id
    FROM SearchHistory
    WHERE user_id = p_user_id AND bookmarked = TRUE;
END$
DELIMITER ;

-- File: sql/sp/sp_get_bookmarked_searches.sql
DELIMITER $
DROP PROCEDURE IF EXISTS sp_get_bookmarked_searches$
CREATE PROCEDURE sp_get_bookmarked_searches(
    IN p_user_id INT UNSIGNED
)
BEGIN
    SELECT *
    FROM SearchHistory
    WHERE user_id = p_user_id AND bookmarked = TRUE
    ORDER BY search_time DESC;
END$
DELIMITER ;