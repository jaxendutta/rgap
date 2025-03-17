#!/bin/bash

# File: setup_db.sh
# Purpose: Set up RGAP database, load schema, and import data

# Import utility functions
source "setup_utils.sh"

# Start timing
start_timer

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/log/database_import.log"

# Get current user and directories
USER=$(whoami)
USER_MYSQL_DIR="${MYSQL_DIR}/users/${USER}"

# Parse command line arguments
DATA_SOURCE="sample"  # Default to sample data

while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    --full|--prod)
      DATA_SOURCE="full"
      shift
      ;;
    --sample)
      DATA_SOURCE="sample"
      shift
      ;;
    --filtered)
      DATA_SOURCE="filtered"
      shift
      ;;
    *)
      # Unknown option
      shift
      ;;
  esac
done

# Initialize log file
echo "Database setup started at $(date)" >"$LOG_FILE"

# Define schema file execution order
SCHEMA_FILES=(
    "users"
    "institute"
    "programs"      # Programs must be created before grants
    "organizations" # Organizations must be created before grants
    "recipients"    # Recipients must be created before grants
    "grants"        # Grants has foreign keys to the above tables
    "bookmarks"
    "search_history"
)

# Function to run SQL files in a directory
run_sql_files() {
    local dir=$1
    local description=$2
    local total=0
    local current=0

    # If it's the schema directory, use predefined order
    if [[ $dir == *"/schema"* ]]; then
        total=${#SCHEMA_FILES[@]}
        print_status "Running $description..."

        for base_name in "${SCHEMA_FILES[@]}"; do
            ((current++))
            local sql_file="$dir/${base_name}.sql"

            if [ ! -f "$sql_file" ]; then
                print_error "Required schema file not found: ${base_name}.sql"
                return 1
            fi

            setup_progress "$current" "$total" "${base_name}.sql"
            mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"$sql_file" 2>>"$LOG_FILE"

            if ! check_error "Failed to run ${base_name}.sql"; then
                printf "\n"
                return 1
            fi
        done
    else
        # For other directories, process all .sql files
        local files=("$dir"/*.sql)
        total=${#files[@]}

        print_status "Running $description..."
        for sql_file in "${files[@]}"; do
            ((current++))
            local file_name=$(basename "$sql_file")
            
            # Skip temporary SQL files
            if [[ "$file_name" == *"runtime"* ]] || [[ "$file_name" == *"custom"* ]]; then
                continue
            fi
            
            setup_progress "$current" "$total" "$file_name"

            if [[ $dir == *"/init"* ]]; then
                mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u root <"$sql_file" 2>>"$LOG_FILE"
            else
                mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"$sql_file" 2>>"$LOG_FILE"
            fi

            if ! check_error "Failed to run $file_name"; then
                printf "\n"
                return 1
            fi
        done
    fi

    printf "\n"
    return 0
}

# Check if MySQL is running
if [ ! -S "${USER_MYSQL_DIR}/run/mysql.sock" ]; then
    print_error "MySQL is not running. Please ensure MySQL is started first."
    exit 1
fi

# Define SQL directories and their execution order
SQL_ROOT="${SCRIPT_DIR}/sql"
DIRS=(
    "init"
    "schema"
    "sp"
    "indexes"
)

# Run SQL files in each directory except data
for dir in "${DIRS[@]}"; do
    if [ "$dir" != "data" ]; then # Skip data dir for now
        full_dir="${SQL_ROOT}/${dir}"
        if [ ! -d "$full_dir" ]; then
            print_error "Directory not found: $full_dir"
            exit 1
        fi

        run_sql_files "$full_dir" "${dir} scripts"
        if [ $? -ne 0 ]; then
            exit 1
        fi
    fi
done

print_status "Loading data preparation scripts..."
{
    # Run data preparation SQL
    mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SQL_ROOT}/data/prepare_import.sql" 2>>"$LOG_FILE"
} || {
    print_error "Failed to prepare data tables"
    exit 1
}

print_status "Loading ${DATA_SOURCE} data..."

# Determine which data directory to use based on DATA_SOURCE
case "$DATA_SOURCE" in
    "full"|"prod")
        # Use the processed directory for full/production data
        DATA_DIR="${SCRIPT_DIR}/data/production"
        DATA_DESC="full"
        ;;
    "filtered")
        # Use the filtered directory for filtered data
        DATA_DIR="${SCRIPT_DIR}/data/filtered"
        DATA_DESC="filtered"
        ;;
    *)
        # Default to sample data
        DATA_DIR="${SCRIPT_DIR}/data/sample"
        DATA_DESC="sample"
        ;;
esac

# Check if the selected data directory exists
if [ ! -d "$DATA_DIR" ]; then
    print_error "${DATA_DESC} data directory not found at ${DATA_DIR}"
    if [ "$DATA_SOURCE" = "filtered" ]; then
        print_status "The filtered dataset directory doesn't exist. You may need to create it first."
        print_status "Falling back to sample dataset..."
        DATA_DIR="${SCRIPT_DIR}/data/sample"
        DATA_DESC="sample"
        DATA_SOURCE="sample"
    elif [ "$DATA_SOURCE" = "full" ] || [ "$DATA_SOURCE" = "prod" ]; then
        print_status "Falling back to sample dataset..."
        DATA_DIR="${SCRIPT_DIR}/data/sample"
        DATA_DESC="sample"
        DATA_SOURCE="sample"
    fi
    
    # If even the sample directory doesn't exist, exit with error
    if [ ! -d "$DATA_DIR" ]; then
        print_error "Sample data directory not found at ${DATA_DIR}"
        exit 1
    fi
fi

# Find the most recent data file in the selected directory
# First try to find a 7z file
SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.7z" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)

# If no 7z file, try to find a csv.gz file
if [ -z "$SAMPLE_DATA_7Z" ]; then
    SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.csv.gz" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
fi

# If still no file, try to find a plain csv file
if [ -z "$SAMPLE_DATA_7Z" ]; then
    SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.csv" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
fi

# Check if we found a data file
if [ -z "$SAMPLE_DATA_7Z" ]; then
    print_error "No ${DATA_DESC} dataset found in ${DATA_DIR}"
    
    # If not using sample already, try falling back to sample
    if [ "$DATA_SOURCE" != "sample" ]; then
        print_status "Falling back to sample dataset..."
        DATA_DIR="${SCRIPT_DIR}/data/sample"
        SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.7z" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
        
        if [ -z "$SAMPLE_DATA_7Z" ]; then
            SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.csv.gz" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
        fi
        
        if [ -z "$SAMPLE_DATA_7Z" ]; then
            SAMPLE_DATA_7Z=$(find "$DATA_DIR" -name "data_*.csv" -type f -print0 2>/dev/null | xargs -0 ls -t 2>/dev/null | head -n 1)
        fi
        
        if [ -z "$SAMPLE_DATA_7Z" ]; then
            print_error "No fallback sample dataset found either. Please ensure data files exist."
            exit 1
        else
            print_status "Using sample dataset: $(basename "$SAMPLE_DATA_7Z")"
            DATA_DESC="sample"
        fi
    else
        print_error "No sample dataset found. Please ensure data files exist."
        exit 1
    fi
else
    print_status "Using ${DATA_DESC} dataset: $(basename "$SAMPLE_DATA_7Z")"
fi

# Create temporary directory for extraction
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Handle different file types
if [[ "$SAMPLE_DATA_7Z" == *.7z ]]; then
    # Extract 7z file
    print_status "Extracting 7z data file..."
    7z e "$SAMPLE_DATA_7Z" -o"$TMP_DIR" > /dev/null
    
    if [ $? -ne 0 ]; then
        print_error "Failed to extract ${SAMPLE_DATA_7Z}"
        exit 1
    fi
    
    # Find the extracted CSV file
    SAMPLE_DATA=$(find "$TMP_DIR" -name "*.csv" -type f | head -n 1)
elif [[ "$SAMPLE_DATA_7Z" == *.csv.gz ]]; then
    # Extract gzip file
    print_status "Extracting gzipped CSV file..."
    gunzip -c "$SAMPLE_DATA_7Z" > "$TMP_DIR/data.csv"
    SAMPLE_DATA="$TMP_DIR/data.csv"
elif [[ "$SAMPLE_DATA_7Z" == *.csv ]]; then
    # Just copy the CSV file
    print_status "Copying CSV file..."
    cp "$SAMPLE_DATA_7Z" "$TMP_DIR/data.csv"
    SAMPLE_DATA="$TMP_DIR/data.csv"
else
    print_error "Unsupported file format: $(basename "$SAMPLE_DATA_7Z")"
    exit 1
fi

if [ -z "$SAMPLE_DATA" ] || [ ! -f "$SAMPLE_DATA" ]; then
    print_error "No CSV file found in extracted archive or specified path"
    exit 1
fi

# Fix encoding issues
print_status "Fixing encoding issues in the CSV file..."
iconv -f UTF-8 -t UTF-8 -c "$SAMPLE_DATA" > "${SAMPLE_DATA}.fixed"
if [ $? -ne 0 ] || [ ! -s "${SAMPLE_DATA}.fixed" ]; then
    print_warning "iconv failed, trying alternative method..."
    sed 's/[^[:print:]\t]/?/g' "$SAMPLE_DATA" > "${SAMPLE_DATA}.fixed"
    if [ $? -ne 0 ] || [ ! -s "${SAMPLE_DATA}.fixed" ]; then
        print_error "Failed to fix encoding issues"
        exit 1
    fi
fi
mv "${SAMPLE_DATA}.fixed" "$SAMPLE_DATA"

# Count total rows for progress reporting
TOTAL_ROWS=$(wc -l < "$SAMPLE_DATA" | awk '{print $1-1}')  # Subtract 1 for header
print_status "Preparing to load ${TOTAL_ROWS} records..."

# Create a load file with special handling for embedded newlines and column mapping
LOAD_SQL="${TMP_DIR}/load_data_runtime.sql"
cat >"$LOAD_SQL" <<EOF
SET SESSION character_set_client = utf8mb4;
SET SESSION character_set_connection = utf8mb4;
SET SESSION character_set_results = utf8mb4;
SET SESSION collation_connection = utf8mb4_unicode_ci;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 0;

-- Using column mapping to skip French fields and agreement_type
LOAD DATA LOCAL INFILE '${SAMPLE_DATA}'
INTO TABLE temp_grants
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
ESCAPED BY '\\\\'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(
    _id,
    ref_number,
    amendment_number,
    amendment_date,
    @dummy_agreement_type,       -- Skip agreement_type
    recipient_type,
    recipient_business_number,
    recipient_legal_name,
    recipient_operating_name,
    research_organization_name,
    recipient_country,
    recipient_province,
    recipient_city,
    recipient_postal_code,
    federal_riding_name_en,
    @dummy_riding_name_fr,       -- Skip federal_riding_name_fr
    federal_riding_number,
    prog_name_en,
    @dummy_prog_name_fr,         -- Skip prog_name_fr
    prog_purpose_en,
    @dummy_prog_purpose_fr,      -- Skip prog_purpose_fr
    agreement_title_en,
    @dummy_agreement_title_fr,   -- Skip agreement_title_fr
    agreement_number,
    agreement_value,
    foreign_currency_type,
    foreign_currency_value,
    agreement_start_date,
    agreement_end_date,
    coverage,
    description_en,
    @dummy_description_fr,       -- Skip description_fr
    naics_identifier,
    expected_results_en,
    @dummy_expected_results_fr,  -- Skip expected_results_fr
    additional_information_en,
    @dummy_additional_information_fr,  -- Skip additional_information_fr
    org,
    owner_org_title,
    year
);

SET FOREIGN_KEY_CHECKS = 1;
EOF

# Enhanced progress indication for data loading
print_status "Data Import Process (3 phases)"
print_status "Phase 1/3: Loading CSV data into temporary table..."

# Start a spinner animation for the loading phase
spin() {
  local i=0
  local sp='/-\|'
  while true; do
    printf "\r  %s Processing... %s " "$(tput bold)" "${sp:i++%${#sp}:1}"
    sleep 0.2
  done
}

# Start spinner in background
spin &
SPIN_PID=$!

# Make sure to kill the spinner when the script exits
trap 'kill $SPIN_PID 2>/dev/null; rm -rf "$TMP_DIR"' EXIT

# Load the data
mysql --local-infile=1 --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"$LOAD_SQL" 2>>"$LOG_FILE"

# Check if data loading succeeded
if [ $? -ne 0 ]; then
    # Kill spinner and show error
    kill $SPIN_PID 2>/dev/null
    wait $SPIN_PID 2>/dev/null
    printf "\r%s                                      \r" "$(tput sgr0)"
    print_error "Failed to load CSV data. Check $LOG_FILE for details."
    exit 1
fi

# Kill spinner
kill $SPIN_PID 2>/dev/null
wait $SPIN_PID 2>/dev/null
printf "\r%s                                      \r" "$(tput sgr0)"
print_success "CSV data loaded successfully!"

# Phase 2: Transforming data
print_status "Phase 2/3: Transforming temporary data into normalized schema..."
print_status "This may take a while for large datasets. Please be patient."

# Start spinner for transformation phase
spin &
SPIN_PID=$!

# Perform the data transformation
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SQL_ROOT}/data/import_data.sql" 2>>"$LOG_FILE"

# Kill spinner
kill $SPIN_PID 2>/dev/null
wait $SPIN_PID 2>/dev/null
printf "\r%s                                      \r" "$(tput sgr0)"

if [ $? -ne 0 ]; then
    print_error "Failed to transform data. Check $LOG_FILE for details."
    exit 1
fi

print_success "Data transformation complete!"
print_status "Phase 3/3: Creating database indexes and finalizing..."

# Run any final optimization or cleanup SQL here
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap -e "ANALYZE TABLE ResearchGrant, Recipient, Institute, Program, Organization;" >>"$LOG_FILE" 2>&1

# Clear progress line before printing status
clear_progress_line
print_success "Data import process completed successfully!"

# Run SQL with error redirection to gather database statistics
{
    mysql --skip-column-names --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap >temp_stats.txt 2>/dev/null <<EOF
-- Table statistics
SELECT 'Table', 'Count'
UNION ALL
SELECT '---------------', '---------------'
UNION ALL
SELECT 'Recipients', CAST(COUNT(*) AS CHAR)
FROM Recipient
UNION ALL
SELECT 'Institutes', CAST(COUNT(*) AS CHAR)
FROM Institute
UNION ALL
SELECT 'Programs', CAST(COUNT(*) AS CHAR)
FROM Program
UNION ALL
SELECT 'Organizations', CAST(COUNT(*) AS CHAR)
FROM Organization
UNION ALL
SELECT 'Grants', CAST(COUNT(*) AS CHAR)
FROM ResearchGrant;

-- Sample Recipients
SELECT '\nRecipient', 'Institution', 'Type'
UNION ALL
SELECT '---------------', '---------------', '---------------'
UNION ALL
SELECT 
    LEFT(legal_name, 30),
    LEFT(i.name, 35),
    recipient_type
FROM Recipient r 
LEFT JOIN Institute i ON r.institute_id = i.institute_id
LIMIT 3;

-- Sample Grants
SELECT '\nReference', 'Value', 'Start Date'
UNION ALL
SELECT '---------------', '---------------', '---------------'
UNION ALL
SELECT 
    ref_number,
    CONCAT('$', FORMAT(agreement_value, 2)),
    DATE_FORMAT(agreement_start_date, '%Y-%m-%d')
FROM ResearchGrant 
LIMIT 3;
EOF
}

# Format and display the output with proper spacing
{
    print "\n${BLUE}Database Statistics:${NC}"
    sed -n '1,7p' temp_stats.txt | column -t -s $'\t' | grep -v "^-" | while IFS= read -r line; do
        print "  $line"
    done

    print "\n${BLUE}Sample Recipients:${NC}"
    sed -n '/Recipient/,/Reference/p' temp_stats.txt | grep -v "Reference" | grep -v "^-" | column -t -s $'\t' | while IFS= read -r line; do
        if [ ! -z "$line" ]; then
            print "  $line"
        fi
    done

    print "\n${BLUE}Sample Grants:${NC}"
    sed -n '/Reference/,$p' temp_stats.txt | grep -v "^-" | column -t -s $'\t' | while IFS= read -r line; do
        if [ ! -z "$line" ]; then
            print "  $line"
        fi
    done
    print
}

# Clean up
rm -f temp_stats.txt

print_success "Database setup completed successfully!"
print_time_taken
print_status "Database Info:"
print "• Database Name: rgap"
print "• Username: rgap_user"
print "• Password: 12345"
print "• Socket: ${USER_MYSQL_DIR}/run/mysql.sock"
print "• Data Source: ${DATA_DESC} (${TOTAL_ROWS} records)"