#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Get the absolute path of the project root
PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
MYSQL_DIR="${PROJECT_ROOT}/mysql"
MYSQL_VERSION="mysql-8.0.36-linux-glibc2.28-x86_64"
MYSQL_BIN="${MYSQL_DIR}/${MYSQL_VERSION}/bin"

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

# Function to check if a command succeeded
check_error() {
    if [ $? -ne 0 ]; then
        print_error "$1"
        exit 1
    fi
}

# Create project directory structure
setup_directories() {
    print_status "Creating project directory structure..."
    
    directories=(
        "${PROJECT_ROOT}/mysql/data"
        "${PROJECT_ROOT}/mysql/run"
        "${PROJECT_ROOT}/mysql/log"
        "${PROJECT_ROOT}/sql"
        "${PROJECT_ROOT}/data/raw"
        "${PROJECT_ROOT}/data/processed"
        "${PROJECT_ROOT}/data/sample"
        "${PROJECT_ROOT}/client/src/components"
        "${PROJECT_ROOT}/server/src"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        check_error "Failed to create directory: $dir"
    done
    
    print_success "Directory structure created successfully"
}

# Download and extract MySQL
setup_mysql() {
    print_status "Setting up MySQL..."
    
    cd "${MYSQL_DIR}"
    
    # Download MySQL if not already downloaded
    if [ ! -f "${MYSQL_VERSION}.tar.xz" ]; then
        print_status "Downloading MySQL..."
        wget "https://dev.mysql.com/get/Downloads/MySQL-8.0/${MYSQL_VERSION}.tar.xz"
        check_error "Failed to download MySQL"
    fi
    
    # Extract MySQL if not already extracted
    if [ ! -d "${MYSQL_VERSION}" ]; then
        print_status "Extracting MySQL..."
        tar xf "${MYSQL_VERSION}.tar.xz"
        check_error "Failed to extract MySQL"
    fi
}

# Create MySQL configuration
create_mysql_config() {
    print_status "Creating MySQL configuration..."
    
    cat > "${MYSQL_DIR}/my.cnf" << EOF
[mysqld]
basedir = ${MYSQL_DIR}/${MYSQL_VERSION}
datadir = ${MYSQL_DIR}/data
socket = ${MYSQL_DIR}/run/mysql.sock
pid-file = ${MYSQL_DIR}/run/mysql.pid
port = 3306
log-error = ${MYSQL_DIR}/log/error.log

# Disable X Plugin
mysqlx = 0

# Security Settings
secure-file-priv = NULL

# InnoDB Settings
innodb_buffer_pool_size = 1G
innodb_redo_log_capacity = 128M
innodb_flush_log_at_trx_commit = 0
innodb_file_per_table = 1
innodb_thread_concurrency = 4

# Performance Settings
key_buffer_size = 256M
max_allowed_packet = 64M
table_open_cache = 2000
sort_buffer_size = 2M
read_buffer_size = 2M
read_rnd_buffer_size = 2M
thread_cache_size = 8
max_connections = 151

[client]
socket = ${MYSQL_DIR}/run/mysql.sock
EOF

    check_error "Failed to create MySQL configuration"
}

# Create MySQL startup script
create_mysql_scripts() {
    print_status "Creating MySQL control scripts..."
    
    # Update the start.sh script portion in create_mysql_scripts():
cat > "${MYSQL_DIR}/start.sh" << EOF
#!/bin/bash

MYSQL_DIR="${MYSQL_DIR}"
MYSQL_BIN="${MYSQL_BIN}"

# Check if MySQL is already running
if [ -f "\${MYSQL_DIR}/run/mysql.pid" ]; then
    PID=\$(cat "\${MYSQL_DIR}/run/mysql.pid")
    if ps -p "\$PID" > /dev/null 2>&1; then
        echo "MySQL is already running with PID \$PID"
        echo "Use mysql-rgap-stop first if you want to restart"
        exit 0
    else
        echo "Found stale PID file, cleaning up..."
        rm -f "\${MYSQL_DIR}/run/mysql.pid"
    fi
fi

echo "Cleaning up old processes..."
pkill -9 -f "mysqld" 2>/dev/null || true
sleep 2

echo "Cleaning up old files..."
rm -f "\${MYSQL_DIR}/run/mysql.sock"

echo "Starting MySQL in the background..."
cd "\${MYSQL_DIR}/${MYSQL_VERSION}"
"\${MYSQL_BIN}/mysqld" --defaults-file="\${MYSQL_DIR}/my.cnf" > "\${MYSQL_DIR}/log/nohup.out" 2>&1 & 

MYSQL_PID=\$!
echo "MySQL started with PID: \$MYSQL_PID"

max_attempts=30
attempt=0
while [ \$attempt -lt \$max_attempts ]; do
    if [ -S "\${MYSQL_DIR}/run/mysql.sock" ]; then
        if "\${MYSQL_BIN}/mysqladmin" -u root --socket="\${MYSQL_DIR}/run/mysql.sock" ping > /dev/null 2>&1; then
            echo "MySQL is accepting connections!"
            exit 0
        fi
    fi
    
    # Check if process is still running
    if ! ps -p \$MYSQL_PID > /dev/null 2>&1; then
        echo "MySQL process died. Check error log at: \${MYSQL_DIR}/log/error.log"
        echo "Last few lines of error log:"
        tail -n 10 "\${MYSQL_DIR}/log/error.log"
        exit 1
    fi
    
    attempt=\$((attempt + 1))
    echo "Waiting for MySQL to start... (attempt \$attempt/\$max_attempts)"
    sleep 1
done

echo "MySQL failed to start within \$max_attempts seconds"
echo "Last few lines of error log:"
tail -n 10 "\${MYSQL_DIR}/log/error.log"
exit 1
EOF

    # Create stop script
    cat > "${MYSQL_DIR}/stop.sh" << EOF
#!/bin/bash

MYSQL_DIR="${MYSQL_DIR}"
MYSQL_BIN="${MYSQL_BIN}"

echo "Stopping MySQL..."

# Try graceful shutdown first
if [ -S "\${MYSQL_DIR}/run/mysql.sock" ]; then
    "\${MYSQL_BIN}/mysqladmin" -u root --socket="\${MYSQL_DIR}/run/mysql.sock" shutdown
    echo "MySQL stopped gracefully"
    sleep 2
fi

# Check if any MySQL processes are still running
MYSQL_PIDS=\$(pgrep -f "mysqld")
if [ ! -z "\$MYSQL_PIDS" ]; then
    echo "Found running MySQL processes, force stopping..."
    pkill -9 -f "mysqld"
    sleep 2
fi

# Clean up files
rm -f "\${MYSQL_DIR}/run/mysql.sock" "\${MYSQL_DIR}/run/mysql.pid"

echo "MySQL stopped and cleaned up"
EOF

    chmod +x "${MYSQL_DIR}/start.sh" "${MYSQL_DIR}/stop.sh"
    check_error "Failed to create MySQL control scripts"
}

# Initialize MySQL
initialize_mysql() {
    print_status "Initializing MySQL..."
    
    # Clean up existing data
    rm -rf "${MYSQL_DIR}/data/"*
    
    # Initialize MySQL
    cd "${MYSQL_DIR}/${MYSQL_VERSION}"
    "${MYSQL_BIN}/mysqld" --defaults-file="${MYSQL_DIR}/my.cnf" --initialize-insecure --user=$(whoami)
    check_error "Failed to initialize MySQL"
}

# Setup aliases
setup_aliases() {
    print_status "Setting up MySQL aliases..."
    
    # Remove old aliases first
    sed -i '/mysql-rgap/d' ~/.bashrc
    
    # Add new aliases
    cat >> ~/.bashrc << EOF

# MySQL aliases for RGAP project
alias mysql-rgap-start="${MYSQL_DIR}/start.sh"
alias mysql-rgap-stop="${MYSQL_DIR}/stop.sh"
alias mysql-rgap="${MYSQL_BIN}/mysql --socket=${MYSQL_DIR}/run/mysql.sock"
EOF
    
    # Add MySQL bin to PATH
    echo "export PATH=\"\${PATH}:${MYSQL_BIN}\"" >> ~/.bashrc
    
    print_success "Aliases added to ~/.bashrc"
    
    # Source bashrc in the current shell
    source ~/.bashrc
}

# Set up database schema
setup_database() {
    print_status "Setting up database schema..."
    
    # Start MySQL
    "${MYSQL_DIR}/start.sh"
    sleep 5
    
    if [ -f "${PROJECT_ROOT}/sql/schema.sql" ]; then
        # Create database and import schema
        "${MYSQL_BIN}/mysql" -u root --socket="${MYSQL_DIR}/run/mysql.sock" << EOF
CREATE DATABASE IF NOT EXISTS rgap;
USE rgap;

CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost';

CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;
EOF
        
        "${MYSQL_BIN}/mysql" -u root --socket="${MYSQL_DIR}/run/mysql.sock" rgap < "${PROJECT_ROOT}/sql/schema.sql"
        check_error "Failed to set up database schema"
    else
        print_status "No schema.sql found - skipping database initialization"
    fi
}

# Main setup process
main() {
    print_status "Starting RGAP project setup..."
    
    setup_directories
    setup_mysql
    create_mysql_config
    create_mysql_scripts
    initialize_mysql
    setup_aliases
    setup_database
    
    print_success "RGAP project setup completed successfully!"
    print_status "MySQL commands are now available:"
    echo "• mysql-rgap-start  - Start the MySQL server"
    echo "• mysql-rgap        - Connect to MySQL (e.g., mysql-rgap -u root rgap)"
    echo "• mysql-rgap-stop   - Stop the MySQL server"
    
    print_status "MySQL is now ready to use!"
}

# Run main setup
main