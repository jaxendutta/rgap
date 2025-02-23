-- Add User (Example)
INSERT INTO [User] (email, name, password_hash)
VALUES ("testuser@example.com", "Test User", "hashed_password");  -- In a real application, you would hash the password securely

-- Add Recipient (Example)
INSERT INTO Recipient (legal_name, research_organization_name, country, city)
VALUES ("Test Recipient", "Test Organization", "CA", "Waterloo"); -- Other recipient fields can be added

-- Add Program (Example)
INSERT INTO Program (prog_id, name_en, name_fr)
VALUES ("TEST_PROG", "Test Program (EN)", "Programme Test (FR)"); -- Other program fields can be added

-- Add Organization (Example)
INSERT INTO Organization (owner_org, org_title)
VALUES ("TEST_ORG", "Test Organization Title"); -- Other organization fields can be added

-- Add Grant (Example - requires existing Recipient, Program, and Organization)
INSERT INTO ResearchGrant (ref_number, amendment_number, agreement_value, agreement_start_date, agreement_end_date, agreement_title_en, owner_org, recipient_id, prog_id)
VALUES ("GRANT123", "0", 50000, "2024-01-01", "2025-01-01", "Test Grant Title", "TEST_ORG", 1, "TEST_PROG"); -- Requires existing IDs

-- Add FavouriteGrant (Example - requires existing User and Grant)
INSERT INTO FavouriteGrants (user_id, grant_id)
VALUES (1, 1);

-- Add FavouriteRecipient (Example - requires existing User and Recipient)
INSERT INTO FavouriteRecipients (user_id, recipient_id)
VALUES (1, 1);

-- Add SearchHistory (Example - requires existing User)
INSERT INTO SearchHistory (user_id, quick_search, result_count, saved)
VALUES (1, "Test Search", 10, TRUE);


-- View All Data (for demonstration)

-- Users
SELECT * FROM [User];

-- Recipients
SELECT * FROM Recipient;

-- Programs
SELECT * FROM Program;

-- Organizations
SELECT * FROM Organization;

-- Grants
SELECT * FROM ResearchGrant;

-- Favourite Grants
SELECT * FROM FavouriteGrants;

-- Favourite Recipients
SELECT * FROM FavouriteRecipients;

-- Search History
SELECT * FROM SearchHistory;


-- View Favourite Grants with details (as in your original R10)
SELECT 
    fg.favourite_id,
    fg.created_at as bookmarked_at,
    rg.grant_id,
    rg.ref_number,
    rg.agreement_number,
    rg.agreement_value,
    rg.agreement_title_en,
    rg.agreement_title_fr,
    rg.agreement_start_date,
    rg.agreement_end_date,
    org.org_title as agency,
    r.legal_name as recipient_name,
    r.research_organization_name,
    r.city,
    r.province
FROM FavouriteGrants fg
JOIN ResearchGrant rg ON fg.grant_id = rg.grant_id
JOIN Organization org ON rg.owner_org = org.owner_org
JOIN Recipient r ON rg.recipient_id = r.recipient_id
WHERE fg.user_id = 1  -- Replace with the desired user ID
ORDER BY fg.created_at DESC;

-- View Favourite Recipients with details
SELECT 
    fr.favourite_id,
    fr.created_at as bookmarked_at,
    r.recipient_id,
    r.legal_name,
    r.research_organization_name,
    r.type as recipient_type,
    r.city,
    r.province,
    COUNT(DISTINCT rg.grant_id) as total_grants,
    SUM(rg.agreement_value) as total_funding,
    MAX(rg.agreement_start_date) as latest_grant_date
FROM FavouriteRecipients fr
JOIN Recipient r ON fr.recipient_id = r.recipient_id
LEFT JOIN ResearchGrant rg ON r.recipient_id = rg.recipient_id
WHERE fr.user_id = 1 -- Replace with the desired user ID
GROUP BY 
    fr.favourite_id,
    fr.created_at,
    r.recipient_id,
    r.legal_name,
    r.research_organization_name,
    r.type,
    r.city,
    r.province
ORDER BY fr.created_at DESC;

-- View Search History for a user
SELECT *
FROM SearchHistory
WHERE user_id = 1; -- Replace with the desired user ID