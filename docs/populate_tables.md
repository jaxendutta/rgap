# Database Population Script Documentation

## Overview
The `populate_tables.py` script is designed to populate the RGAP (Research Grant Analytics Platform) database with data from a CSV file containing tri-agency grant information. It handles the insertion of data into multiple related tables while maintaining referential integrity.

## Prerequisites

### Required Python Packages
```bash
pip install pandas mysql-connector-python python-dotenv
```

### Environment Setup
Create a `.env` file in the project root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=rgap_user
DB_PASSWORD=12345
DB_NAME=rgap
DB_PORT=3306
PORT=3030
```

### Database Setup
- Ensure MySQL is installed and running
- The database specified in `DB_NAME` must exist
- The database schema must be created using the `schema.sql` script
- The user specified in `DB_USER` must have appropriate permissions

## Script Location
```
rgap/
├── .env
└── scripts/
    ├── populate_tables.py
    └── data/
        └── tri_agency_grants_2019.csv
```

## Input Data Format
The script expects a CSV file with the following columns:
- ref_number
- amendment_number
- amendment_date
- agreement_type
- recipient_legal_name
- research_organization_name
- recipient_country
- recipient_province
- recipient_city
- recipient_postal_code
- federal_riding_name_en
- federal_riding_name_fr
- federal_riding_number
- prog_name_en
- prog_name_fr
- prog_purpose_en
- prog_purpose_fr
- agreement_title_en
- agreement_title_fr
- agreement_number
- agreement_value
- foreign_currency_type
- foreign_currency_value
- agreement_start_date
- agreement_end_date
- description_en
- description_fr
- expected_results_en
- expected_results_fr
- owner_org
- owner_org_title
- org

## Usage

### Basic Usage
```bash
cd scripts
python populate_tables.py
```

### Output
The script creates a `database_import.log` file containing detailed information about the import process, including:
- Number of records processed
- Any errors encountered
- Success/failure status of each operation

## Functionality

### The script performs the following operations:

1. **Environment Loading**
   - Loads database configuration from `.env` file
   - Validates required environment variables

2. **Data Loading**
   - Reads CSV file using pandas
   - Converts data types appropriately
   - Handles missing values

3. **Database Population**
   - Populates Recipients table
   - Populates Programs table
   - Populates Organizations table
   - Populates ResearchGrants table

4. **Error Handling**
   - Logs errors to file and console
   - Maintains database consistency
   - Proper cleanup on failure

## Error Handling

The script handles several types of errors:
- Missing `.env` file
- Invalid database credentials
- Missing or invalid CSV file
- Data format errors
- Database connection issues
- Insert/update failures

## Logging

The script logs information to both console and file:
- Debug information
- Progress updates
- Error messages
- Success confirmations

Log file location: `./database_import.log`

## Common Issues and Solutions

1. **Environment File Not Found**
   ```
   FileNotFoundError: Environment file not found
   ```
   Solution: Ensure `.env` file exists in project root

2. **Database Connection Failed**
   ```
   Error connecting to MySQL
   ```
   Solution: Check database credentials and server status

3. **CSV File Not Found**
   ```
   FileNotFoundError: CSV file not found
   ```
   Solution: Ensure CSV file exists in correct location

## Performance Considerations

The script includes several performance optimizations:
- Uses bulk operations where possible
- Maintains connection state
- Uses dictionary mappings for lookups
- Implements efficient error handling

## Security Considerations

- Sensitive information is stored in `.env` file
- SQL injection prevention through parameterized queries
- Limited database permissions recommended