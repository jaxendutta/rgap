INSERT INTO User (email, name, password_hash, created_at)
VALUES ("", "", "", NOW());
SELECT LAST_INSERT_ID() AS user_id;