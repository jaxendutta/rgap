-- File: sql/init/create_db.sql
DROP DATABASE IF EXISTS rgap;
DROP USER IF EXISTS 'rgap_user'@'localhost';
DROP USER IF EXISTS 'rgap_user'@'%';

-- Create fresh database with proper encoding
CREATE DATABASE rgap
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Create users
CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';

-- Grant permissions
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'%';
GRANT FILE ON *.* TO 'rgap_user'@'localhost';
GRANT FILE ON *.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;

-- Enable loading local files
SET GLOBAL local_infile = 1;