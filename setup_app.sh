#!/bin/bash

# Import setup_utils.sh
source "setup_utils.sh"

# Start timing
start_timer

# Get script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse command line arguments
INTERACTIVE=true
DATA_SIZE="sample"

while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
    # New combined data option that takes a value
    --data)
        shift
        if [[ $# -gt 0 ]]; then
            case "$1" in
            full|prod)
                DATA_SIZE="full"
                ;;
            filtered)
                DATA_SIZE="filtered"
                ;;
            sample)
                DATA_SIZE="sample"
                ;;
            *)
                print_warning "Unknown data option: $1. Using 'sample' instead."
                DATA_SIZE="sample"
                ;;
            esac
            shift
        else
            print_warning "--data option requires a value (full, filtered, or sample). Using 'sample'."
        fi
        ;;
    # For backwards compatibility
    --full)
        DATA_SIZE="full"
        shift
        ;;
    --filtered)
        DATA_SIZE="filtered"
        shift
        ;;
    --non-interactive)
        INTERACTIVE=false
        shift
        ;;
    *)
        # Unknown option
        shift
        ;;
    esac
done

# Function to clean up processes and files
cleanup() {
    local force=$1
    print_status "Cleaning up..."

    # Kill processes using PID files
    if [ -f "$SCRIPT_DIR/.client.pid" ]; then
        kill -9 $(cat "$SCRIPT_DIR/.client.pid") 2>/dev/null
        rm "$SCRIPT_DIR/.client.pid"
    fi
    if [ -f "$SCRIPT_DIR/.server.pid" ]; then
        kill -9 $(cat "$SCRIPT_DIR/.server.pid") 2>/dev/null
        rm "$SCRIPT_DIR/.server.pid"
    fi

    # Stop MySQL if it's running
    if [ -f "$USER_MYSQL_DIR/stop.sh" ]; then
        "$USER_MYSQL_DIR/stop.sh"
    fi

    # Force kill any remaining processes if requested
    if [ "$force" = "force" ]; then
        print_warning "Force killing any remaining processes..."
        pkill -f "node.*$SCRIPT_DIR" 2>/dev/null
        pkill -f "$USER_MYSQL_DIR" 2>/dev/null
    fi

    # Clean up socket and pid files
    rm -f "$MYSQL_SOCKET" "$USER_MYSQL_DIR/run/mysql.pid" 2>/dev/null

    # Clean up port config file
    rm -f "$SCRIPT_DIR/config/.port-config.json" 2>/dev/null

    print_success "Cleanup complete"
}

# Handle script exit
trap 'cleanup force' SIGINT SIGTERM ERR

# Check if environment is set up
if [[ -z "${MYSQL_DIR}" ]]; then
    print_error "Environment not set up. Please run 'source setup_env.sh' first."
    exit 1
fi

# Get user-specific MySQL directory
USER=$(whoami)
USER_MYSQL_DIR="$MYSQL_DIR/users/$USER"
MYSQL_SOCKET="$USER_MYSQL_DIR/run/mysql.sock"

# Cleanup any existing processes and files
cleanup force

# Check if MySQL is set up
if [ ! -d "$USER_MYSQL_DIR" ]; then
    print_warning "MySQL not set up. Running setup_mysql.sh..."
    ./setup_mysql.sh
    if [ $? -ne 0 ]; then
        print_error "MySQL setup failed. Please check the errors and try again."
        cleanup force
        exit 1
    fi
fi

# Install dependencies
print_status "Installing dependencies..."

# Server dependencies
print_status "Installing server dependencies..."
cd "$SCRIPT_DIR/server"
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install server dependencies"
    cleanup force
    exit 1
fi
print_success "Server dependencies installed successfully"

# Client dependencies
print_status "Installing client dependencies..."
cd "$SCRIPT_DIR/client"
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install client dependencies"
    cleanup force
    exit 1
fi
print_success "Client dependencies installed successfully"

cd "$SCRIPT_DIR"

# Get available ports
print_status "Finding available ports..."

# Create temporary port finding script
cat > temp_port_script.js << 'EOF'
const { findAvailablePorts } = require('./config/ports');
findAvailablePorts()
  .then(ports => {
    console.log(JSON.stringify(ports));
  })
  .catch(err => {
    console.error('Error finding ports:', err);
    process.exit(1);
  });
EOF

PORT_CONFIG=$(node temp_port_script.js)
rm temp_port_script.js

if [ $? -ne 0 ]; then
    print_error "Failed to find available ports!"
    cleanup force
    exit 1
fi

# Parse ports from JSON
CLIENT_PORT=$(echo "$PORT_CONFIG" | jq -r '.client')
SERVER_PORT=$(echo "$PORT_CONFIG" | jq -r '.server')
MYSQL_PORT=$(echo "$PORT_CONFIG" | jq -r '.database')

# Validate ports
if [[ -z "$CLIENT_PORT" || -z "$SERVER_PORT" || -z "$MYSQL_PORT" ]]; then
    print_error "Failed to get valid ports!"
    cleanup force
    exit 1
fi

# Display port information
print "\n${YELLOW}=== RGAP Service Ports ===${NC}"
print "${YELLOW}⚠️  NOTE: These ports may be different from previous runs!${NC}"
print "📝 Port configuration saved at: ${BLUE}$SCRIPT_DIR/config/.port-config.json${NC}\n"
print "🗄️ SQL_DB: ${GREEN}localhost:$MYSQL_PORT${NC}"
print "🚀 Server: ${GREEN}http://localhost:$SERVER_PORT${NC}"
print "🌐 Client: ${GREEN}http://localhost:$CLIENT_PORT${NC}\n"

# Start MySQL with specific port
print_status "Starting MySQL for user $USER on port $MYSQL_PORT..."
sed -i "s/^port = .*/port = $MYSQL_PORT/" "$USER_MYSQL_DIR/my.cnf"
"$USER_MYSQL_DIR/start.sh"
if [ $? -ne 0 ]; then
    print_error "Failed to start MySQL. Check the logs for details."
    cleanup force
    exit 1
fi

# Wait for MySQL to be ready
print_status "Waiting for MySQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if [ -S "$MYSQL_SOCKET" ]; then
        # First try root connection
        if mysql -u root --socket="$MYSQL_SOCKET" -e "SELECT 1" &>/dev/null; then
            print_success "MySQL is ready for initial setup!"
            break
        fi
        # Then try rgap_user connection
        if mysql -u rgap_user -p12345 --socket="$MYSQL_SOCKET" -e "SELECT 1" &>/dev/null; then
            print_success "MySQL is ready with rgap_user!"
            break
        fi
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        print_error "\nMySQL failed to start! Checking error log:"
        cat "$USER_MYSQL_DIR/log/error.log"
        cleanup force
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Set up database
print_status "Setting up database..."

# Prompt for data size if in interactive mode
if [ "$INTERACTIVE" = true ]; then
    echo
    echo "Database setup options:"
    echo "1) Use sample data (35K+ records, faster setup)"
    echo "2) Use filtered dataset (subset with specific criteria)"
    echo "3) Use full dataset (231K+ records, comprehensive but slower)"
    echo
    read -p "Choose an option [1/2/3] (default: 1): " data_choice

    case $data_choice in
        3)
            DATA_SIZE="full"
            print_status "Using full dataset. This may take several minutes to load."
            ;;
        2)
            DATA_SIZE="filtered"
            print_status "Using filtered dataset for specific analysis."
            ;;
        *)
            DATA_SIZE="sample"
            print_status "Using sample dataset for faster setup."
            ;;
    esac
fi

# Pass the data size parameter to setup_db.sh
case $DATA_SIZE in
    full|prod)
        ./setup_db.sh --full
        ;;
    filtered)
        ./setup_db.sh --filtered
        ;;
    *)
        ./setup_db.sh --sample
        ;;
esac

if [ $? -ne 0 ]; then
    print_error "Database setup failed. Check the errors and try again."
    cleanup force
    exit 1
fi
print_success "Database setup completed successfully"

# Export environment variables
export MYSQL_SOCKET
export CLIENT_PORT
export SERVER_PORT
export MYSQL_PORT

# Start server
print_status "Starting server..."
cd "$SCRIPT_DIR/server"
PORT="$SERVER_PORT" \
    DB_PORT="$MYSQL_PORT" \
    DB_HOST="127.0.0.1" \
    DB_USER="rgap_user" \
    DB_PASSWORD="12345" \
    DB_NAME="rgap" \
    MYSQL_SOCKET="$MYSQL_SOCKET" \
    npm run dev &
SERVER_PID=$!
echo $SERVER_PID > "$SCRIPT_DIR/.server.pid"

# Wait for server to start
print_status "Waiting for server to start..."
attempt=0
while [ $attempt -lt 30 ]; do
    if curl -s http://localhost:$SERVER_PORT/health >/dev/null; then
        print_success "Server is ready!"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq 30 ]; then
        print_error "\nServer failed to start!"
        cleanup force
        exit 1
    fi
    sleep 1
done

# Start client
print_status "Starting client..."
cd "$SCRIPT_DIR/client"
VITE_API_URL="http://localhost:$SERVER_PORT" \
    PORT="$CLIENT_PORT" npm run dev &
CLIENT_PID=$!
echo $CLIENT_PID > "$SCRIPT_DIR/.client.pid"

print_success "Application started successfully!"
print_status "Opening client in your default browser..."
sleep 3

print
print_status "To stop the application:"
print "  1. Press Ctrl+C"
print "  2. Run cleanup script (will be done automatically on Ctrl+C)"

# Print time taken
print_time_taken

# Keep script running and handle cleanup on exit
wait
