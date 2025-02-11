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

# Function to check if MySQL is running
check_mysql_running() {
    if pgrep -f "mysqld" >/dev/null; then
        return 0 # MySQL is running
    else
        return 1 # MySQL is not running
    fi
}

# Function to prompt user for action on running MySQL
handle_running_mysql() {
    print_warning "MySQL is currently running!"
    echo
    echo "Choose an action:"
    echo "1) Kill existing MySQL and continue setup"
    echo "2) Exit setup"
    echo
    read -p "Enter your choice (1/2): " choice

    case $choice in
    1)
        print_status "Stopping existing MySQL processes..."
        pkill -9 -f "mysqld" 2>/dev/null
        sleep 2
        if check_mysql_running; then
            print_error "Failed to stop MySQL. Please stop it manually and try again."
            exit 1
        fi
        print_success "Existing MySQL processes stopped."
        return 0
        ;;
    2)
        print_status "Setup cancelled by user."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Setup cancelled."
        exit 1
        ;;
    esac
}

# Check for existing MySQL processes at start
if check_mysql_running; then
    handle_running_mysql
fi

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

# Create MySQL configuration
print_status "Creating MySQL configuration..."

cat >"${MYSQL_DIR}/my.cnf" <<EOF
[mysqld]
basedir = ${MYSQL_DIR}/${MYSQL_VERSION}
datadir = ${MYSQL_DIR}/data
socket = ${MYSQL_DIR}/run/mysql.sock
pid-file = ${MYSQL_DIR}/run/mysql.pid
port = 7272
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

# Create MySQL startup script
print_status "Creating MySQL control scripts..."

cat >"${MYSQL_DIR}/start.sh" <<EOF
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
cat >"${MYSQL_DIR}/stop.sh" <<EOF
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

# Initialize MySQL
print_status "Initializing MySQL..."

# Clean up existing data
rm -rf "${MYSQL_DIR}/data/"*

# Initialize MySQL
cd "${MYSQL_DIR}/${MYSQL_VERSION}"
"${MYSQL_BIN}/mysqld" --defaults-file="${MYSQL_DIR}/my.cnf" --initialize-insecure --user=$(whoami)

print_success "MySQL setup completed successfully!"
print_status "You can now use:"
echo "• mysql-rgap-start  - Start the MySQL server"
echo "• mysql-rgap        - Connect to MySQL"
echo "• mysql-rgap-stop   - Stop the MySQL server"
