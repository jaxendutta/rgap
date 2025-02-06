CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap_db.* TO 'rgap_user'@'localhost';

--CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';
--GRANT ALL PRIVILEGES ON rgap_db.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;
