-- File: sql/data/prepare_import.sql
/* Drop if exists with error handling */
SET @sql = (SELECT IF(
    EXISTS(
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = 'rgap' 
        AND TABLE_NAME = 'temp_grants'
    ),
    'DROP TABLE temp_grants',
    'DO 0'  -- No output statement
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

/* Create temporary table for data import with optimized structure */
CREATE TABLE temp_grants (
    _id VARCHAR(50),
    ref_number VARCHAR(50),
    amendment_number VARCHAR(10),
    amendment_date VARCHAR(50),
    agreement_type VARCHAR(50),
    recipient_type VARCHAR(50),
    recipient_business_number VARCHAR(50),
    recipient_legal_name VARCHAR(255),
    recipient_operating_name VARCHAR(255),
    research_organization_name VARCHAR(255),
    recipient_country CHAR(2),
    recipient_province VARCHAR(50),
    recipient_city VARCHAR(100),
    recipient_postal_code VARCHAR(10),
    federal_riding_name_en VARCHAR(100),
    federal_riding_name_fr VARCHAR(100),
    federal_riding_number VARCHAR(10),
    prog_name_en VARCHAR(255),
    prog_name_fr VARCHAR(255),
    prog_purpose_en TEXT,
    prog_purpose_fr TEXT,
    agreement_title_en TEXT,
    agreement_title_fr TEXT,
    agreement_number VARCHAR(50),
    agreement_value VARCHAR(20),
    foreign_currency_type VARCHAR(3),
    foreign_currency_value VARCHAR(20),
    agreement_start_date VARCHAR(50),
    agreement_end_date VARCHAR(50),
    coverage TEXT,
    description_en TEXT,
    description_fr TEXT,
    naics_identifier VARCHAR(10),
    expected_results_en TEXT,
    expected_results_fr TEXT,
    additional_information_en TEXT,
    additional_information_fr TEXT,
    org VARCHAR(5),
    owner_org_title VARCHAR(100),
    year VARCHAR(4),
    KEY (ref_number, amendment_number),
    KEY (recipient_legal_name),
    KEY (research_organization_name),
    KEY (org),
    KEY (prog_name_en)
) ENGINE=InnoDB;
