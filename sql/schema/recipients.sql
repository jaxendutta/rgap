-- File: sql/schema/recipients.sql
USE rgap;

CREATE TABLE Recipient (
    recipient_id INT PRIMARY KEY AUTO_INCREMENT,
    legal_name VARCHAR(255) NOT NULL,
    research_organization_name VARCHAR(255) NOT NULL,
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
    country CHAR(2),
    province VARCHAR(50),
    city VARCHAR(100),
    postal_code VARCHAR(10),
    riding_name_en VARCHAR(100),
    riding_name_fr VARCHAR(100),
    riding_number VARCHAR(10),
    UNIQUE (legal_name, research_organization_name, country, city)
);