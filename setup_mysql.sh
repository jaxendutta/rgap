#!/bin/bash

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Import setup_utils.sh
. "$SCRIPT_DIR/setup_utils.sh"

# Start timing
start_timer

# Get current user and directories
MYSQL_DIR="$(pwd)/mysql"
USER=$(whoami)
USER_MYSQL_DIR="${MYSQL_DIR}/users/${USER}"

# Function to check if MySQL is running
check_mysql_running() {
    # Only check for MySQL processes using our specific socket
    if pgrep -f "${USER_MYSQL_DIR}/run/mysql.sock" >/dev/null; then
        return 0 # MySQL is running
    else
        return 1 # MySQL is not running
    fi
}

# Function to prompt user for action on running MySQL
handle_running_mysql() {
    print_warning "MySQL instance for user ${USER} is currently running!"
    echo
    echo "Choose an action:"
    echo "1) Kill existing MySQL and continue setup"
    echo "2) Exit setup"
    echo
    read -p "Enter your choice (1/2): " choice

    case $choice in
    1)
        print_status "Stopping existing MySQL processes..."
        pkill -9 -f "${USER_MYSQL_DIR}/run/mysql.sock" 2>/dev/null
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

# Create user-specific directories
print_status "Creating user-specific directories..."
mkdir -p "${USER_MYSQL_DIR}"/{data,run,log}
chmod 700 "${USER_MYSQL_DIR}"  # Restrictive permissions
chmod 700 "${USER_MYSQL_DIR}"/{data,run,log}

cd "${MYSQL_DIR}"

if [ ! $MYSQL_VERSION ]; then
    print_error "MySQL version not found in your environment."
    print_error "Please make sure you have activated your virtual environment."
    print_error "Run 'source setup_env.sh' and try again."
    exit 1
fi

# Download MySQL if not already downloaded
if [ ! -f "mysql-${MYSQL_VERSION}.tar.xz" ]; then
    print_status "Downloading MySQL..."
    ulimit -f unlimited
    wget "https://cdn.mysql.com/Downloads/MySQL-${MYSQL_VERSION%.*}/mysql-${MYSQL_VERSION}-linux-glibc2.28-x86_64.tar.xz" -O "mysql-${MYSQL_VERSION}.tar.xz"
    check_error "Failed to download MySQL"
fi

# Extract MySQL if not already extracted
if [ ! -d "mysql-${MYSQL_VERSION}" ]; then
    print_status "Extracting MySQL..."
    tar xf "mysql-${MYSQL_VERSION}.tar.xz" --one-top-level="mysql-${MYSQL_VERSION}" --strip-components 1
    check_error "Failed to extract MySQL"
else
    rm -rf "mysql-${MYSQL_VERSION}.tar.xz"
fi

# Create MySQL configuration
print_status "Creating MySQL configuration..."
cat >"${USER_MYSQL_DIR}/my.cnf" <<EOF
[mysqld]
basedir = ${MYSQL_DIR}/mysql-${MYSQL_VERSION}
datadir = ${USER_MYSQL_DIR}/data
socket = ${USER_MYSQL_DIR}/run/mysql.sock
pid-file = ${USER_MYSQL_DIR}/run/mysql.pid
port = ${MYSQL_PORT:-5000}
log-error = ${USER_MYSQL_DIR}/log/error.log

# Disable X Plugin
mysqlx = 0

# Security Settings
secure-file-priv = NULL

# InnoDB Settings 
innodb_buffer_pool_size = 2G
innodb_redo_log_capacity = 256M
innodb_flush_log_at_trx_commit = 0
innodb_file_per_table = 1
innodb_thread_concurrency = 4

# Performance Settings
key_buffer_size = 256M
max_allowed_packet = 64M
table_open_cache = 2000
sort_buffer_size = 4M
read_buffer_size = 2M
read_rnd_buffer_size = 2M
thread_cache_size = 8
max_connections = 151

# Enable local infile loading
local_infile = 1

[client]
socket = ${USER_MYSQL_DIR}/run/mysql.sock
local_infile = 1
EOF

# Create MySQL control scripts
print_status "Creating MySQL control scripts..."
cat >"${USER_MYSQL_DIR}/start.sh" <<EOF
#!/bin/bash

MYSQL_DIR="${MYSQL_DIR}"
MYSQL_BIN="${MYSQL_BIN}"
USER_MYSQL_DIR="${USER_MYSQL_DIR}"

# Check if MySQL is already running
if [ -f "\${USER_MYSQL_DIR}/run/mysql.pid" ]; then
    PID=\$(cat "\${USER_MYSQL_DIR}/run/mysql.pid")
    if ps -p "\$PID" > /dev/null 2>&1; then
        echo "MySQL is already running with PID \$PID"
        echo "Use stop.sh first if you want to restart"
        exit 0
    else
        echo "Found stale PID file, cleaning up..."
        rm -f "\${USER_MYSQL_DIR}/run/mysql.pid"
    fi
fi

echo "Starting MySQL in the background..."
cd "\${MYSQL_DIR}/mysql-${MYSQL_VERSION}"
"\${MYSQL_BIN}/mysqld" --defaults-file="\${USER_MYSQL_DIR}/my.cnf" > "\${USER_MYSQL_DIR}/log/nohup.out" 2>&1 & 

MYSQL_PID=\$!
echo "MySQL started with PID: \$MYSQL_PID"

max_attempts=30
attempt=0
while [ \$attempt -lt \$max_attempts ]; do
    if [ -S "\${USER_MYSQL_DIR}/run/mysql.sock" ]; then
        if "\${MYSQL_BIN}/mysqladmin" -u root --socket="\${USER_MYSQL_DIR}/run/mysql.sock" ping > /dev/null 2>&1; then
            echo "MySQL is accepting connections!"
            exit 0
        fi
    fi
    
    if ! ps -p \$MYSQL_PID > /dev/null 2>&1; then
        echo "MySQL process died. Check error log at: \${USER_MYSQL_DIR}/log/error.log"
        echo "Last few lines of error log:"
        tail -n 10 "\${USER_MYSQL_DIR}/log/error.log"
        exit 1
    fi
    
    attempt=\$((attempt + 1))
    echo "Waiting for MySQL to start... (attempt \$attempt/\$max_attempts)"
    sleep 1
done

echo "MySQL failed to start within \$max_attempts seconds"
echo "Last few lines of error log:"
tail -n 10 "\${USER_MYSQL_DIR}/log/error.log"
exit 1
EOF

cat >"${USER_MYSQL_DIR}/stop.sh" <<EOF
#!/bin/bash

MYSQL_DIR="${MYSQL_DIR}"
MYSQL_BIN="${MYSQL_BIN}"
USER_MYSQL_DIR="${USER_MYSQL_DIR}"

echo "Stopping MySQL..."

# Try graceful shutdown first
if [ -S "\${USER_MYSQL_DIR}/run/mysql.sock" ]; then
    "\${MYSQL_BIN}/mysqladmin" -u root --socket="\${USER_MYSQL_DIR}/run/mysql.sock" shutdown
    echo "MySQL stopped gracefully"
    sleep 2
fi

# Check only for user's MySQL process
MYSQL_PIDS=\$(pgrep -f "\${USER_MYSQL_DIR}/run/mysql.sock")
if [ ! -z "\$MYSQL_PIDS" ]; then
    echo "Found running MySQL processes, force stopping..."
    kill -9 \$MYSQL_PIDS
    sleep 2
fi

# Clean up files
rm -f "\${USER_MYSQL_DIR}/run/mysql.sock" "\${USER_MYSQL_DIR}/run/mysql.pid"

echo "MySQL stopped and cleaned up"
EOF

chmod +x "${USER_MYSQL_DIR}/start.sh" "${USER_MYSQL_DIR}/stop.sh"

# Initialize MySQL
print_status "Initializing MySQL..."

# Clean up existing data for this user only
rm -rf "${USER_MYSQL_DIR}/data/"*

# Initialize MySQL and create root without password
cd "${MYSQL_DIR}"
"${MYSQL_BIN}/mysqld" --defaults-file="${USER_MYSQL_DIR}/my.cnf" --initialize-insecure --user=${USER}

# Start MySQL to ensure proper initialization
print_status "Starting MySQL to verify initialization..."
"${USER_MYSQL_DIR}/start.sh"

# Wait for MySQL to be ready
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if [ -S "${USER_MYSQL_DIR}/run/mysql.sock" ]; then
        if mysql -u root --socket="${USER_MYSQL_DIR}/run/mysql.sock" -e "SELECT 1" &>/dev/null; then
            break
        fi
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    print_error "MySQL failed to start"
    rm -rf "mysql"
    exit 1
fi

# Ensure root can connect without password and enable local infile
mysql -u root --socket="${USER_MYSQL_DIR}/run/mysql.sock" <<EOF
ALTER USER 'root'@'localhost' IDENTIFIED WITH caching_sha2_password BY '';
SET GLOBAL local_infile = 1;
FLUSH PRIVILEGES;
EOF

# Stop MySQL to ensure clean state
"${USER_MYSQL_DIR}/stop.sh"

# Create symbolic links for convenience
print_status "Creating convenience commands..."
mkdir -p "${HOME}/bin"
ln -sf "${USER_MYSQL_DIR}/start.sh" "${HOME}/bin/mysql-rgap-start"
ln -sf "${USER_MYSQL_DIR}/stop.sh" "${HOME}/bin/mysql-rgap-stop"
echo "mysql -u root --socket=${USER_MYSQL_DIR}/run/mysql.sock" > "${HOME}/bin/mysql-rgap"
chmod +x "${HOME}/bin/mysql-rgap"

# Ensure ${HOME}/bin is in PATH
if [[ ":$PATH:" != *":${HOME}/bin:"* ]]; then
    export PATH="${HOME}/bin:$PATH"
    echo 'export PATH="${HOME}/bin:$PATH"' >> "${HOME}/.bashrc"
fi

print_success "MySQL setup completed successfully!"
print_status "You can now use:"
echo "• mysql-rgap-start  - Start your MySQL server"
echo "• mysql-rgap        - Connect to MySQL"
echo "• mysql-rgap-stop   - Stop your MySQL server"

# Return to original directory
cd "${SCRIPT_DIR}"

# Print time taken
print_time_taken