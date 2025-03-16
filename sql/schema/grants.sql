-- File: sql/schema/grants.sql
USE rgap;

DROP TABLE IF EXISTS ResearchGrant;
CREATE TABLE ResearchGrant (
    grant_id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    ref_number VARCHAR(50),
    amendment_number VARCHAR(10),
    UNIQUE KEY idx_ref_amend (ref_number, amendment_number),
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
    org VARCHAR(5),
    recipient_id INT UNSIGNED,
    prog_id INT UNSIGNED,
    KEY idx_agreement_date (agreement_start_date, agreement_end_date),
    KEY idx_agreement_value (agreement_value),
    KEY idx_org (org),
    KEY idx_recipient (recipient_id),
    FOREIGN KEY (recipient_id) REFERENCES Recipient(recipient_id),
    FOREIGN KEY (org) REFERENCES Organization(org),
    FOREIGN KEY (prog_id) REFERENCES Program(prog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;