-- Create user
INSERT INTO User (email, name, password_hash) VALUES('test@test.ca', 'test', 'pw');

-- Add Recipient Bookmark 
INSERT INTO BookmarkedRecipients (user_id, recipient_id) VALUES(1, 16576);
-- Output after adding
SELECT user_id, recipient_id FROM BookmarkedRecipients;

-- Delete Recipient Bookmark 
DELETE FROM BookmarkedRecipients WHERE recipient_id = 16576 AND user_id = 1;
-- Output after deleting
SELECT user_id, recipient_id FROM BookmarkedRecipients;



-- Add Institute Bookmark 
INSERT INTO BookmarkedInstitutes (user_id, institute_id) VALUES(1, 8);
-- Output after adding
SELECT user_id, institute_id FROM BookmarkedInstitutes;

-- Delete Institute Bookmark 
DELETE FROM BookmarkedInstitutes WHERE institute_id = 8 AND user_id = 1;
-- Output after deleting
SELECT user_id, institute_id FROM BookmarkedInstitutes;