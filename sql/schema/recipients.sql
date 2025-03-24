-- File: sql/schema/recipients.sql
USE rgap;

DROP TABLE IF EXISTS Recipient;
CREATE TABLE Recipient (
    recipient_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    legal_name VARCHAR(255) NOT NULL,
    institute_id INT UNSIGNED,
    type VARCHAR(1),
    FOREIGN KEY (institute_id) REFERENCES Institute(institute_id) ON DELETE SET NULL
);