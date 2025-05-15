-- File: sql/schema/grants.sql
/*
USE rgap;

DROP TABLE IF EXISTS ResearchGrant;
CREATE TABLE ResearchGrant (
    grant_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ref_number VARCHAR(50),
    latest_amendment_number INT,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    org VARCHAR(5),
    recipient_id INT UNSIGNED,
    prog_id INT UNSIGNED,
    amendments_history JSON,
    KEY idx_agreement_date (agreement_start_date, agreement_end_date),
    KEY idx_agreement_value (agreement_value),
    KEY idx_org (org),
    KEY idx_recipient (recipient_id),
    KEY idx_ref_number (ref_number),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id),
    FOREIGN KEY (org) REFERENCES Organization(org),
    FOREIGN KEY (prog_id) REFERENCES Program(prog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
*/

-- PostgreSQL version of grants.sql
CREATE TABLE IF NOT EXISTS "ResearchGrant" (
    grant_id SERIAL PRIMARY KEY,
    ref_number VARCHAR(50),
    latest_amendment_number INTEGER,
    amendment_date DATE,
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    description_en TEXT,
    expected_results_en TEXT,
    additional_information_en TEXT,
    org VARCHAR(5) REFERENCES "Organization"(org),
    recipient_id INTEGER REFERENCES "Recipient"(recipient_id),
    prog_id INTEGER REFERENCES "Program"(prog_id),
    amendments_history JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agreement_date ON "ResearchGrant" (agreement_start_date, agreement_end_date);
CREATE INDEX IF NOT EXISTS idx_agreement_value ON "ResearchGrant" (agreement_value);
CREATE INDEX IF NOT EXISTS idx_org ON "ResearchGrant" (org);
CREATE INDEX IF NOT EXISTS idx_recipient ON "ResearchGrant" (recipient_id);
CREATE INDEX IF NOT EXISTS idx_ref_number ON "ResearchGrant" (ref_number);