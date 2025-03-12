-- File: sql/schema/recipients.sql
USE rgap;

DROP TABLE IF EXISTS Recipient;
CREATE TABLE Recipient (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    legal_name VARCHAR(255) NOT NULL,
    institute_id INT,
    type VARCHAR(50),
    recipient_type ENUM(
         'Indigenous recipients',                      
         'For-profit organizations', 
         'Government',
         'International (non-government)',
         'Not-for-profit organizations and charities', 
         'Other',
         'Individual or sole proprietorships', 
         'Academia'),
    UNIQUE (legal_name),
    FOREIGN KEY (institute_id) REFERENCES Institute(institute_id) ON DELETE SET NULL
);