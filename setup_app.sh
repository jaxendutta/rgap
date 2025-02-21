#!/bin/bash

# Import setup_utils.sh
source "setup_utils.sh"

# Get script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to clean up processes and files
cleanup() {
    local force=$1
    echo -e "\n${BLUE}Cleaning up...${NC}"
    
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
        echo -e "${YELLOW}Force killing any remaining processes...${NC}"
        pkill -f "node.*$SCRIPT_DIR" 2>/dev/null
        pkill -f "$USER_MYSQL_DIR" 2>/dev/null
    fi
    
    # Clean up socket and pid files
    rm -f "$MYSQL_SOCKET" "$USER_MYSQL_DIR/run/mysql.pid" 2>/dev/null
    
    # Clean up port config file
    rm -f "$SCRIPT_DIR/config/.port-config.json" 2>/dev/null
    
    echo -e "${GREEN}Cleanup complete${NC}"
}

# Handle script exit
trap 'cleanup force' SIGINT SIGTERM ERR

# Check if environment is set up
if [[ -z "${MYSQL_DIR}" ]]; then
    echo -e "${RED}Error: Environment not set up. Please run 'source setup_env.sh' first.${NC}"
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
    echo -e "${YELLOW}MySQL not set up. Running setup_mysql.sh...${NC}"
    ./setup_mysql.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}MySQL setup failed. Please check the errors and try again.${NC}"
        cleanup force
        exit 1
    fi
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"

# Server dependencies
echo -e "${BLUE}Installing server dependencies...${NC}"
cd "$SCRIPT_DIR/server"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install server dependencies${NC}"
    cleanup force
    exit 1
fi

# Client dependencies
echo -e "${BLUE}Installing client dependencies...${NC}"
cd "$SCRIPT_DIR/client"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to install client dependencies${NC}"
    cleanup force
    exit 1
fi

cd "$SCRIPT_DIR"

# Get available ports
echo -e "${BLUE}Finding available ports...${NC}"

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
    echo -e "${RED}Failed to find available ports!${NC}"
    cleanup force
    exit 1
fi

# Parse ports from JSON
CLIENT_PORT=$(echo "$PORT_CONFIG" | jq -r '.client')
SERVER_PORT=$(echo "$PORT_CONFIG" | jq -r '.server')
MYSQL_PORT=$(echo "$PORT_CONFIG" | jq -r '.database')

# Validate ports
if [[ -z "$CLIENT_PORT" || -z "$SERVER_PORT" || -z "$MYSQL_PORT" ]]; then
    echo -e "${RED}Failed to get valid ports!${NC}"
    cleanup force
    exit 1
fi

# Display port information
echo -e "\n${YELLOW}=== RGAP Service Ports ===${NC}"
echo -e "${YELLOW}⚠️  NOTE: These ports may be different from previous runs!${NC}"
echo -e "📝 Port configuration saved at: ${BLUE}$SCRIPT_DIR/config/.port-config.json${NC}\n"
echo -e "🗄️ SQL_DB: ${GREEN}localhost:$MYSQL_PORT${NC}"
echo -e "🚀 Server: ${GREEN}http://localhost:$SERVER_PORT${NC}"
echo -e "🌐 Client: ${GREEN}http://localhost:$CLIENT_PORT${NC}\n"

# Start MySQL with specific port
echo -e "${BLUE}Starting MySQL for user $USER on port $MYSQL_PORT...${NC}"
sed -i "s/^port = .*/port = $MYSQL_PORT/" "$USER_MYSQL_DIR/my.cnf"
"$USER_MYSQL_DIR/start.sh"
if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start MySQL. Check the logs for details.${NC}"
    cleanup force
    exit 1
fi

# Wait for MySQL to be ready
echo -e "${BLUE}Waiting for MySQL to be ready...${NC}"
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if [ -S "$MYSQL_SOCKET" ]; then
        # First try root connection
        if mysql -u root --socket="$MYSQL_SOCKET" -e "SELECT 1" &>/dev/null; then
            echo -e "${GREEN}MySQL is ready for initial setup!${NC}"
            break
        fi
        # Then try rgap_user connection
        if mysql -u rgap_user -p12345 --socket="$MYSQL_SOCKET" -e "SELECT 1" &>/dev/null; then
            echo -e "${GREEN}MySQL is ready with rgap_user!${NC}"
            break
        fi
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${RED}\nMySQL failed to start! Checking error log:${NC}"
        cat "$USER_MYSQL_DIR/log/error.log"
        cleanup force
        exit 1
    fi
    echo -n "."
    sleep 1
done

# Set up database
echo -e "${BLUE}Setting up database...${NC}"
./setup_db.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}Database setup failed. Check the errors and try again.${NC}"
    cleanup force
    exit 1
fi

# Export environment variables
export MYSQL_SOCKET
export CLIENT_PORT
export SERVER_PORT
export MYSQL_PORT

# Start server
echo -e "${BLUE}Starting server...${NC}"
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
echo -e "${BLUE}Waiting for server to start...${NC}"
attempt=0
while [ $attempt -lt 30 ]; do
    if curl -s http://localhost:$SERVER_PORT/health >/dev/null; then
        echo -e "${GREEN}Server is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    if [ $attempt -eq 30 ]; then
        echo -e "${RED}\nServer failed to start!${NC}"
        cleanup force
        exit 1
    fi
    sleep 1
done

# Start client
echo -e "${BLUE}Starting client...${NC}"
cd "$SCRIPT_DIR/client"
VITE_API_URL="http://localhost:$SERVER_PORT" \
PORT="$CLIENT_PORT" npm run dev &
CLIENT_PID=$!
echo $CLIENT_PID > "$SCRIPT_DIR/.client.pid"

echo -e "${GREEN}Application started successfully!${NC}"
echo -e "${BLUE}Opening client in your default browser...${NC}"
sleep 3
xdg-open "http://localhost:$CLIENT_PORT" 2>/dev/null || open "http://localhost:$CLIENT_PORT" 2>/dev/null || echo -e "${YELLOW}Couldn't open browser automatically. Please open http://localhost:$CLIENT_PORT manually.${NC}"

echo
echo -e "${BLUE}To stop the application:${NC}"
echo -e "  1. Press Ctrl+C"
echo -e "  2. Run cleanup script (will be done automatically on Ctrl+C)"

# Print time taken
print_time_taken

# Keep script running and handle cleanup on exit
wait
