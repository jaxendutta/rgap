# RGAP Data Documentation

This document provides information about the data sources, schema, and processing pipeline used in the Research Grant Analytics Platform (RGAP).

## Data Sources

RGAP uses open data from Canada's three major research funding agencies:

1. **NSERC** - Natural Sciences and Engineering Research Council of Canada
2. **CIHR** - Canadian Institutes of Health Research
3. **SSHRC** - Social Sciences and Humanities Research Council of Canada

The data is sourced from the Government of Canada's Open Data Portal via the CKAN API:
- Dataset ID: `432527ab-7aac-45b5-81d6-7597107a7013`
- Resource ID: `1d15a62f-5656-49ad-8c88-f40ce689d831`

## Data Schema

The RGAP database uses a normalized schema to efficiently store and query grant data. Below are the main tables in the database:

### Core Tables

#### `Institute`
Stores information about research institutions.

| Column | Type | Description |
|--------|------|-------------|
| institute_id | INT | Primary key |
| name | VARCHAR(255) | Institution name |
| type | VARCHAR(50) | Institution type (University, College, etc.) |
| country | VARCHAR(50) | Country |
| province | VARCHAR(50) | Province/State |
| city | VARCHAR(100) | City |
| postal_code | VARCHAR(10) | Postal code |
| riding_name_en | VARCHAR(100) | Electoral district name (English) |
| riding_name_fr | VARCHAR(100) | Electoral district name (French) |
| riding_number | VARCHAR(10) | Electoral district number |

#### `Recipient`
Stores information about grant recipients.

| Column | Type | Description |
|--------|------|-------------|
| recipient_id | INT | Primary key |
| legal_name | VARCHAR(255) | Legal name of recipient |
| institute_id | INT | Foreign key to Institute |
| type | VARCHAR(50) | Recipient type |
| recipient_type | ENUM | Categorized recipient type |

#### `Program`
Stores information about funding programs.

| Column | Type | Description |
|--------|------|-------------|
| prog_id | VARCHAR(50) | Primary key |
| name_en | VARCHAR(255) | Program name (English) |
| name_fr | VARCHAR(255) | Program name (French) |
| purpose_en | TEXT | Program purpose (English) |
| purpose_fr | TEXT | Program purpose (French) |
| naics_identifier | VARCHAR(10) | NAICS code |

#### `Organization`
Stores information about funding organizations.

| Column | Type | Description |
|--------|------|-------------|
| owner_org | VARCHAR(20) | Primary key |
| org_title | VARCHAR(100) | Organization title |
| abbreviation | VARCHAR(10) | Organization abbreviation (NSERC, CIHR, SSHRC) |

#### `ResearchGrant`
Stores information about research grants.

| Column | Type | Description |
|--------|------|-------------|
| grant_id | INT | Primary key |
| ref_number | VARCHAR(50) | Reference number |
| amendment_number | VARCHAR(10) | Amendment number |
| amendment_date | DATE | Amendment date |
| agreement_type | VARCHAR(50) | Agreement type |
| agreement_number | VARCHAR(50) | Agreement number |
| agreement_value | DECIMAL(15,2) | Agreement value in CAD |
| foreign_currency_type | VARCHAR(3) | Foreign currency type |
| foreign_currency_value | DECIMAL(15,2) | Value in foreign currency |
| agreement_start_date | DATE | Agreement start date |
| agreement_end_date | DATE | Agreement end date |
| agreement_title_en | TEXT | Agreement title (English) |
| agreement_title_fr | TEXT | Agreement title (French) |
| description_en | TEXT | Description (English) |
| description_fr | TEXT | Description (French) |
| expected_results_en | TEXT | Expected results (English) |
| expected_results_fr | TEXT | Expected results (French) |
| org | VARCHAR(20) | Organization code |
| owner_org | VARCHAR(20) | Foreign key to Organization |
| recipient_id | INT | Foreign key to Recipient |
| prog_id | VARCHAR(50) | Foreign key to Program |

### User-Related Tables

#### `User`
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| user_id | INT | Primary key |
| email | VARCHAR(255) | Email address |
| name | VARCHAR(100) | User name |
| password_hash | VARCHAR(255) | Hashed password |
| created_at | DATETIME | Account creation timestamp |

#### `SearchHistory`
Stores user search history.

| Column | Type | Description |
|--------|------|-------------|
| history_id | INT | Primary key |
| user_id | INT | Foreign key to User |
| quick_search | VARCHAR(500) | Quick search term |
| search_recipient | VARCHAR(500) | Recipient search term |
| search_grant | VARCHAR(500) | Grant search term |
| search_institution | VARCHAR(500) | Institution search term |
| search_filters | JSON | Search filters as JSON |
| search_time | TIMESTAMP | Search timestamp |
| result_count | INT | Number of results |
| saved | BOOLEAN | Whether the search is saved |

#### `BookmarkedGrants`
Stores user bookmarked grants.

| Column | Type | Description |
|--------|------|-------------|
| bookmark_id | INT | Primary key |
| user_id | INT | Foreign key to User |
| grant_id | INT | Foreign key to ResearchGrant |
| created_at | TIMESTAMP | Bookmark creation timestamp |

#### `BookmarkedRecipients`
Stores user bookmarked recipients.

| Column | Type | Description |
|--------|------|-------------|
| bookmark_id | INT | Primary key |
| user_id | INT | Foreign key to User |
| recipient_id | INT | Foreign key to Recipient |
| created_at | TIMESTAMP | Bookmark creation timestamp |

## Data Pipeline

The data processing pipeline consists of several stages:

### 1. Data Fetching (`fetcher.py`)

The `fetcher.py` script retrieves data from the source API:

```bash
python fetcher.py --year-start 2019 --year-end 2023 --save
```

Key functions:
- Connects to the tri-agency APIs
- Downloads grant data for specified years
- Processes and cleans the data
- Compresses and saves the data for import

The script creates files in the `data/processed/` directory with naming pattern `data_TIMESTAMP_YEAR_RANGE.csv` or compressed versions.

### 2. Data Import (`setup_db.sh`)

The `setup_db.sh` script imports the data into the MySQL database:

```bash
./setup_db.sh --full
```

The import process:
1. Creates database schema (`sql/schema/*.sql`)
2. Prepares import tables (`sql/data/prepare_import.sql`)
3. Loads the CSV data into temporary tables
4. Transforms and normalizes the data (`sql/data/import_data.sql`)
5. Creates indexes for performance (`sql/indexes/create_indexes.sql`)
6. Creates stored procedures for complex queries (`sql/sp/*.sql`)

### 3. Data Enrichment

During the import process, several data enrichment steps occur:

- Detecting and categorizing institution types
- Filling in missing research organization names
- Consolidating amendments by reference number
- Generating unique identifiers for programs
- Converting currencies and standardizing values

## Data Quality

The data undergoes several quality assurance steps:

### Data Cleaning

- Handling null values and placeholders
- Correcting encoding issues
- Standardizing date formats
- Validating numeric values
- Removing duplicate records

### Data Consistency

- Converting variable-named fields to consistent names
- Normalizing location information
- Ensuring referential integrity
- Standardizing categorical values

### Data Validation

- Checking for logical inconsistencies
- Validating reference numbers
- Ensuring amendment sequences are correct
- Validating date ranges

## Data Updates

The data can be updated periodically to include new grants and amendments:

1. Run `fetcher.py` with updated year ranges
2. Import the new data with `setup_db.sh`
3. The system will maintain consistency through the use of unique constraints

## Data Statistics

The sample dataset includes:
- Over 35,000 grants
- Covering years 2019-2023
- From NSERC, CIHR, and SSHRC

The full dataset includes:
- Over 231,000 grants
- Covering years 1998-2023
- From NSERC, CIHR, and SSHRC

## Data Access

Access to the data is provided through:

1. **Web Interface**: The RGAP client application
2. **REST API**: The RGAP server API
3. **Direct Database Access**: For administrators

## Data Privacy

The grant data is public information provided by the Government of Canada. User account data and usage patterns are stored securely and not shared.

## Data Limitations

- Some historical records may have incomplete information
- Amendment history may not be complete for older grants
- Some institutions may have multiple entries with slight naming variations
- Geographic information may be incomplete for some recipients

## Additional Data Sources

While the core data comes from the tri-agency API, RGAP could be extended with additional data sources:

- Publication data
- Patent information
- Research impact metrics
- Institutional rankings
- Geographic and demographic data

## Data License

The grant data is provided under the [Open Government License - Canada](https://open.canada.ca/en/open-government-licence-canada).