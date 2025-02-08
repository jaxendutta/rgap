INSERT INTO User (user_id, email, name, password_hash)
VALUES(1, "example1@gmail.com", "Name1", "password1") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(2, "example2@gmail.com", "Name2", "password2") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(3, "example3@gmail.com", "Name3", "password3") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(4, "example4@gmail.com", "Name4", "password4") ;


INSERT INTO FavouriteGrants (user_id, grant_id)
VALUES(3, 2) ;

INSERT INTO FavouriteRecipients (user_id, recipient_id)
VALUES(4, 1) ;

INSERT INTO SearchHistory (user_id, search_recipient, result_count, saved)
VALUES(1, 2, 0, TRUE) ;


-- Output before delete
SELECT * FROM FavouriteGrants;
SELECT * FROM FavouriteRecipients;
SELECT * FROM SearchHistory;


-- Delete Favourite_Grant
DELETE FROM FavouriteGrants
WHERE user_id = 3 AND grant_id = 2;

-- Delete Favourite_Recipient
DELETE FROM FavouriteRecipients
WHERE user_id = 4 AND recipient_id = 1;

-- Delete Search History
DELETE FROM SearchHistory WHERE history_id = 1;

-- Output before delete
SELECT * FROM FavouriteGrants;
SELECT * FROM FavouriteRecipients;
SELECT * FROM SearchHistory;
