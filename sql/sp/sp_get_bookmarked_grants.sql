-- File: sql/sp/sp_get_bookmarked_grants.sql
/*
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
*/

-- PostgreSQL version of sp_get_bookmarked_grants
CREATE OR REPLACE FUNCTION get_bookmarked_grants(
    p_user_id INTEGER
)
RETURNS TABLE(
    grant_id INTEGER,
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    recipient_id INTEGER,
    org VARCHAR(5),
    prog_id INTEGER,
    amendments_history JSONB,
    legal_name VARCHAR(255),
    research_organization_name VARCHAR(255),
    institute_id INTEGER,
    city VARCHAR(100),
    province VARCHAR(50),
    country VARCHAR(50),
    org_title VARCHAR(100),
    prog_title_en VARCHAR(255),
    prog_purpose_en TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        rg.grant_id,
        rg.ref_number,
        rg.latest_amendment_number,
        rg.amendment_date,
        rg.agreement_number,
        rg.agreement_value,
        rg.foreign_currency_type,
        rg.foreign_currency_value,
        rg.agreement_start_date,
        rg.agreement_end_date,
        rg.agreement_title_en,
        rg.description_en,
        rg.expected_results_en,
        rg.additional_information_en,
        rg.recipient_id,
        rg.org,
        rg.prog_id,
        rg.amendments_history,
        r.legal_name,
        i.name AS research_organization_name,
        i.institute_id,
        i.city,
        i.province,
        i.country,
        o.org_title,
        p.name_en AS prog_title_en,
        p.purpose_en AS prog_purpose_en
    FROM "BookmarkedGrants" bg
    JOIN "ResearchGrant" rg ON bg.grant_id = rg.grant_id
    JOIN "Recipient" r ON rg.recipient_id = r.recipient_id
    JOIN "Institute" i ON r.institute_id = i.institute_id
    JOIN "Organization" o ON rg.org = o.org
    LEFT JOIN "Program" p ON rg.prog_id = p.prog_id
    WHERE bg.user_id = p_user_id
    ORDER BY rg.agreement_start_date DESC;
END;
$$;