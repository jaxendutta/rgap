
INSERT INTO User (user_id, email, name, password_hash)
VALUES(1, "example1@gmail.com", "Name1", "password1") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(2, "example2@gmail.com", "Name2", "password2") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(3, "example3@gmail.com", "Name3", "password3") ;

INSERT INTO User (user_id, email, name, password_hash)
VALUES(4, "example4@gmail.com", "Name4", "password4") ;


-- Add Favourite_Grant
INSERT INTO FavouriteGrants (user_id, grant_id)
VALUES(3, 2) ;

-- Add Favourite_Recipient
INSERT INTO FavouriteRecipients (user_id, recipient_id)
VALUES(4, 1) ;

-- Add Search History
INSERT INTO SearchHistory (user_id, search_recipient, result_count, saved)
VALUES(1, 2, 0, TRUE) ;


SELECT * FROM FavouriteGrants;
SELECT * FROM FavouriteRecipients;
SELECT * FROM SearchHistory;
