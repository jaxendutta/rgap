-- File: sql/schema/grants.sql
USE rgap;

DROP TABLE IF EXISTS ResearchGrant;
CREATE TABLE ResearchGrant (
    grant_id INT PRIMARY KEY AUTO_INCREMENT,
    ref_number VARCHAR(50),
    amendment_number VARCHAR(10),
    UNIQUE (ref_number, amendment_number),
    amendment_date DATE,
    agreement_type VARCHAR(50),
    agreement_number VARCHAR(50),
    agreement_value DECIMAL(15,2),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value DECIMAL(15,2),
    agreement_start_date DATE,
    agreement_end_date DATE,
    agreement_title_en TEXT,
    agreement_title_fr TEXT,
    description_en TEXT,
    description_fr TEXT,
    expected_results_en TEXT,
    expected_results_fr TEXT,
    org VARCHAR(20),
    owner_org VARCHAR(20),
    recipient_id INT,
    prog_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id),
    FOREIGN KEY (owner_org) REFERENCES Organization(owner_org),
    FOREIGN KEY (prog_id) REFERENCES Program(prog_id)
);