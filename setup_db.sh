#!/bin/bash

# File: setup_db.sh
# Purpose: Set up RGAP database, load schema, and import data

# Import utility functions
source "setup_utils.sh"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="${SCRIPT_DIR}/database_import.log"

# Get current user and directories
USER=$(whoami)
USER_MYSQL_DIR="${MYSQL_DIR}/users/${USER}"

# Initialize log file
echo "Database setup started at $(date)" >"$LOG_FILE"

# Define schema file execution order
SCHEMA_FILES=(
    "users"
    "recipients"
    "programs"
    "organizations"
    "grants"
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
    "data"
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

# Special handling for data loading
print_status "Loading data preparation scripts..."
{
    # Run data preparation SQL
    mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SQL_ROOT}/data/prepare_import.sql" 2>>"$LOG_FILE"
} || {
    print_error "Failed to prepare data tables"
    exit 1
}

print_status "Loading sample data..."
# Define the sample data file and its compressed version
SAMPLE_DATA_DIR="${SCRIPT_DIR}/data/sample"
SAMPLE_DATA_7Z="${SAMPLE_DATA_DIR}/data_2019.7z"
SAMPLE_DATA="${SAMPLE_DATA_DIR}/data_2019.csv"

# Check if the compressed file exists
if [ ! -f "$SAMPLE_DATA_7Z" ]; then
    print_error "Compressed sample data file not found at ${SAMPLE_DATA_7Z}"
    exit 1
fi

# Uncompress the 7z file to get the CSV file
7z e "$SAMPLE_DATA_7Z" -o"$SAMPLE_DATA_DIR"
if [ $? -ne 0 ]; then
    print_error "Failed to uncompress ${SAMPLE_DATA_7Z}"
    exit 1
fi

# Check if the CSV file was successfully extracted
if [ ! -f "$SAMPLE_DATA" ]; then
    print_error "Sample data file not found at ${SAMPLE_DATA} after extraction"
    exit 1
fi
if [ ! -f "$SAMPLE_DATA" ]; then
    print_error "Sample data file not found at ${SAMPLE_DATA}"
    exit 1
fi

setup_progress 1 3 "Loading CSV data "
mysql --local-infile=1 --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <<EOF
LOAD DATA LOCAL INFILE '${SAMPLE_DATA}'
INTO TABLE temp_grants
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;
EOF

if ! check_error "Failed to load CSV data"; then
    exit 1
fi

setup_progress 2 3 "Transforming data "
mysql --socket="${USER_MYSQL_DIR}/run/mysql.sock" -u rgap_user -p12345 rgap <"${SQL_ROOT}/data/import_data.sql" 2>>"$LOG_FILE"

if ! check_error "Failed to transform data"; then
    exit 1
fi

# Clear progress line before printing status
clear_progress_line
print_status "Data import summary"

# Run SQL with error redirection
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
    LEFT(research_organization_name, 35),
    recipient_type
FROM Recipient 
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
    print "\n${BLUE}Table Statistics:${NC}"
    sed -n '1,6p' temp_stats.txt | column -t -s $'\t' | grep -v "^-" | while IFS= read -r line; do
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
print_status "Database Info:"
print "• Database Name: rgap"
print "• Username: rgap_user"
print "• Password: 12345"
print "• Socket: ${USER_MYSQL_DIR}/run/mysql.sock"
