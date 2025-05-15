-- File: sql/schema/recipients.sql
/*
USE rgap;

DROP TABLE IF EXISTS Recipient;
CREATE TABLE Recipient (
    recipient_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    legal_name VARCHAR(255) NOT NULL,
    institute_id INT UNSIGNED,
    type VARCHAR(1),
    FOREIGN KEY (institute_id) REFERENCES Institute(institute_id) ON DELETE SET NULL
);
*/

-- PostgreSQL version of recipients.sql
CREATE TABLE IF NOT EXISTS "Recipient" (
    recipient_id SERIAL PRIMARY KEY,
    legal_name VARCHAR(255) NOT NULL,
    institute_id INTEGER REFERENCES "Institute"(institute_id) ON DELETE SET NULL,
    type VARCHAR(1)
);

-- Add index for name search performance
CREATE INDEX IF NOT EXISTS idx_recipient_legal_name ON "Recipient" USING gin (legal_name gin_trgm_ops);