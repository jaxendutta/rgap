#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print with color
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}==>${NC} $1"
}

print_error() {
    echo -e "${RED}==>${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}==>${NC} $1"
}

# Function to check for errors
check_error() {
    if [ $? -ne 0 ]; then
        print_error "$1"
        return 1
    fi
    return 0
}

# Check if environment is set up
if [[ -z "${MYSQL_DIR}" ]]; then
    print_error "Environment not set up. Please run 'source setup_env.sh' first."
    exit 1
fi

# Get current user and directories
USER=$(whoami)
USER_MYSQL_DIR="${MYSQL_DIR}/users/${USER}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/database_import.log"

# Initialize log file
echo "Database setup started at $(date)" >"$LOG_FILE"

# Check if MySQL is running
if [ ! -S "${USER_MYSQL_DIR}/run/mysql.sock" ]; then
    print_error "MySQL is not running. Please ensure MySQL is started first."
    exit 1
fi

print_status "Setting up RGAP database..."

# Create main database initialization SQL
cat >"${SCRIPT_DIR}/temp_init.sql" <<EOF
-- Drop existing database and users
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
EOF

# Execute initial setup
print_status "Initializing database..."
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u root <"${SCRIPT_DIR}/temp_init.sql" 2>>"$LOG_FILE"

if ! check_error "Failed to initialize database"; then
    rm -f "${SCRIPT_DIR}/temp_init.sql"
    exit 1
fi

# Create schema
print_status "Creating database schema..."
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SCRIPT_DIR}/sql/schema.sql" 2>>"$LOG_FILE"

if ! check_error "Failed to create schema"; then
    exit 1
fi

# Add create_user stored procedure
print_status "Adding stored procedures..."
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SCRIPT_DIR}/sql/sp_create_user.sql" 2>>"$LOG_FILE"

if ! check_error "Failed to add stored procedures"; then
    exit 1
fi

# Create data loading SQL
SAMPLE_DATA="${SCRIPT_DIR}/data/sample/data_2019.csv"
if [ ! -f "$SAMPLE_DATA" ]; then
    print_error "Sample data file not found at ${SAMPLE_DATA}"
    exit 1
fi

print_status "Preparing data loading script..."
cat >"${SCRIPT_DIR}/temp_load.sql" <<EOF
-- Set SQL mode to allow invalid dates to be converted to NULL
SET SESSION sql_mode = '';

-- Create a temporary table that exactly matches CSV structure
DROP TABLE IF EXISTS temp_grants;
CREATE TABLE temp_grants (
    ref_number VARCHAR(50),
    _id VARCHAR(50),
    _full_text TEXT,
    amendment_number VARCHAR(10),
    amendment_date VARCHAR(50),      -- Changed to VARCHAR to handle invalid dates
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
    agreement_start_date VARCHAR(50),  -- Changed to VARCHAR to handle invalid dates
    agreement_end_date VARCHAR(50),    -- Changed to VARCHAR to handle invalid dates
    coverage TEXT,
    description_en TEXT,
    description_fr TEXT,
    naics_identifier VARCHAR(10),
    expected_results_en TEXT,
    expected_results_fr TEXT,
    additional_information_en TEXT,
    additional_information_fr TEXT,
    owner_org VARCHAR(20),
    owner_org_title VARCHAR(100),
    org VARCHAR(10),
    year VARCHAR(4)
);

-- Load data with strict error handling and input preprocessing
LOAD DATA LOCAL INFILE '${SAMPLE_DATA}'
INTO TABLE temp_grants
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;

-- Clean up the data first
UPDATE temp_grants
SET 
    -- Trim whitespace from text fields
    recipient_legal_name = NULLIF(TRIM(recipient_legal_name), ''),
    research_organization_name = NULLIF(TRIM(research_organization_name), ''),
    -- Clean up recipient type
    recipient_type = CASE recipient_type
        WHEN 'P' THEN 'Individual or sole proprietorships'
        WHEN 'G' THEN 'Government'
        WHEN 'A' THEN 'Academia'
        ELSE 'Other'
    END,
    -- Clean up currency values
    agreement_value = REGEXP_REPLACE(agreement_value, '[^0-9.]', ''),
    foreign_currency_value = REGEXP_REPLACE(foreign_currency_value, '[^0-9.]', ''),
    -- Clean up dates
    amendment_date = CASE 
        WHEN amendment_date = '0000-00-00' THEN NULL
        WHEN amendment_date NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN NULL
        ELSE amendment_date
    END,
    agreement_start_date = CASE 
        WHEN agreement_start_date = '0000-00-00' THEN NULL
        WHEN agreement_start_date NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN NULL
        ELSE agreement_start_date
    END,
    agreement_end_date = CASE 
        WHEN agreement_end_date = '0000-00-00' THEN NULL
        WHEN agreement_end_date NOT REGEXP '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN NULL
        ELSE agreement_end_date
    END;

-- Insert Organizations first
INSERT IGNORE INTO Organization (owner_org, org_title, abbreviation)
SELECT DISTINCT 
    owner_org,
    owner_org_title,
    org
FROM temp_grants
WHERE owner_org IS NOT NULL;

-- Insert Programs
INSERT IGNORE INTO Program (prog_id, name_en, name_fr, purpose_en, purpose_fr, naics_identifier)
SELECT DISTINCT
    prog_name_en,
    prog_name_en,
    prog_name_fr,
    prog_purpose_en,
    prog_purpose_fr,
    naics_identifier
FROM temp_grants
WHERE prog_name_en IS NOT NULL;

-- Insert Recipients with proper handling of type
INSERT IGNORE INTO Recipient (
    legal_name,
    research_organization_name,
    type,
    recipient_type,
    country,
    province,
    city,
    postal_code,
    riding_name_en,
    riding_name_fr,
    riding_number
)
SELECT DISTINCT
    COALESCE(NULLIF(TRIM(recipient_legal_name), ''), 'Unknown'),
    COALESCE(NULLIF(TRIM(research_organization_name), ''), 'Unknown Institution'),
    'Academia', -- Default type based on data 
    recipient_type,
    recipient_country,
    recipient_province,
    recipient_city,
    recipient_postal_code,
    federal_riding_name_en,
    federal_riding_name_fr,
    federal_riding_number
FROM temp_grants
WHERE recipient_legal_name IS NOT NULL 
OR research_organization_name IS NOT NULL;

-- Insert Grants with proper relationships
INSERT INTO ResearchGrant (
    ref_number,
    amendment_number,
    amendment_date,
    agreement_type,
    agreement_number,
    agreement_value,
    foreign_currency_type,
    foreign_currency_value,
    agreement_start_date,
    agreement_end_date,
    agreement_title_en,
    agreement_title_fr,
    description_en,
    description_fr,
    expected_results_en,
    expected_results_fr,
    owner_org,
    org,
    recipient_id,
    prog_id
)
SELECT 
    tg.ref_number,
    tg.amendment_number,
    CASE 
        WHEN tg.amendment_date = '0000-00-00' THEN NULL
        WHEN STR_TO_DATE(tg.amendment_date, '%Y-%m-%d') IS NULL THEN NULL
        ELSE STR_TO_DATE(tg.amendment_date, '%Y-%m-%d')
    END,
    tg.agreement_type,
    tg.agreement_number,
    CAST(NULLIF(REGEXP_REPLACE(tg.agreement_value, '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    tg.foreign_currency_type,
    CAST(NULLIF(REGEXP_REPLACE(tg.foreign_currency_value, '[^0-9.]', ''), '') AS DECIMAL(15,2)),
    CASE 
        WHEN tg.agreement_start_date = '0000-00-00' THEN NULL
        WHEN STR_TO_DATE(tg.agreement_start_date, '%Y-%m-%d') IS NULL THEN NULL
        ELSE STR_TO_DATE(tg.agreement_start_date, '%Y-%m-%d')
    END,
    CASE 
        WHEN tg.agreement_end_date = '0000-00-00' THEN NULL
        WHEN STR_TO_DATE(tg.agreement_end_date, '%Y-%m-%d') IS NULL THEN NULL
        ELSE STR_TO_DATE(tg.agreement_end_date, '%Y-%m-%d')
    END,
    tg.agreement_title_en,
    tg.agreement_title_fr,
    tg.description_en,
    tg.description_fr,
    tg.expected_results_en,
    tg.expected_results_fr,
    tg.owner_org,
    tg.org,
    r.recipient_id,
    tg.prog_name_en
FROM temp_grants tg
LEFT JOIN Recipient r ON 
    r.legal_name = COALESCE(NULLIF(TRIM(tg.recipient_legal_name), ''), 'Unknown')
    AND r.research_organization_name = COALESCE(NULLIF(TRIM(tg.research_organization_name), ''), 'Unknown Institution')
    AND r.country = tg.recipient_country
    AND r.city = tg.recipient_city
WHERE tg.ref_number IS NOT NULL;

-- Add indexes for performance
CREATE INDEX idx_grant_ref ON ResearchGrant(ref_number, amendment_number);
CREATE INDEX idx_grant_dates ON ResearchGrant(agreement_start_date, agreement_end_date);
CREATE INDEX idx_grant_value ON ResearchGrant(agreement_value);
CREATE INDEX idx_recipient_name ON Recipient(legal_name, research_organization_name);

-- Clean up
DROP TABLE temp_grants;
EOF

# Load the data
print_status "Loading sample data..."
mysql --local-infile=1 --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SCRIPT_DIR}/temp_load.sql" 2>>"$LOG_FILE"

if ! check_error "Failed to load data"; then
    rm -f "${SCRIPT_DIR}/temp_load.sql"
    exit 1
fi

# Get counts to verify data load
echo -e "\n${BLUE}Data Loading Summary:${NC}"
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <<EOF
SELECT 
    'Recipients' as Table_Name, COUNT(*) as Count FROM Recipient
UNION ALL
SELECT 'Programs', COUNT(*) FROM Program
UNION ALL
SELECT 'Organizations', COUNT(*) FROM Organization
UNION ALL
SELECT 'Grants', COUNT(*) FROM ResearchGrant;

-- Show sample data from each table
SELECT 'Sample Recipients:' as '';
SELECT legal_name, research_organization_name, recipient_type FROM Recipient LIMIT 3;

SELECT 'Sample Grants:' as '';
SELECT ref_number, agreement_value, agreement_start_date FROM ResearchGrant LIMIT 3;
EOF

# Clean up temporary files
rm -f "${SCRIPT_DIR}/temp_init.sql" "${SCRIPT_DIR}/temp_load.sql"

print_success "Database setup completed successfully!"
echo "Database Info:"
echo "• Database Name: rgap"
echo "• Username: rgap_user"
echo "• Password: 12345"
echo "• Socket: ${USER_MYSQL_DIR}/run/mysql.sock"

# Log completion
echo "Database setup completed successfully at $(date)" >>"$LOG_FILE"
