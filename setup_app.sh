#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if virtual environment is activated
if [[ -z "${VIRTUAL_ENV}" ]]; then
    echo -e "${RED}Error: Virtual environment not activated!${NC}"
    echo -e "${BLUE}Please run 'source setup_env.sh' first.${NC}"
    exit 1
fi

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to wait for MySQL to be ready
wait_for_mysql() {
    echo -e "${BLUE}Waiting for MySQL to be ready...${NC}"
    for i in {1..30}; do
        if [ -S "$SCRIPT_DIR/mysql/run/mysql.sock" ] &&
            mysql -u rgap_user -p12345 --socket="$SCRIPT_DIR/mysql/run/mysql.sock" -e "SELECT 1" >/dev/null 2>&1; then
            echo -e "${GREEN}MySQL is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
    done
    echo -e "\n${RED}MySQL failed to start!${NC}"
    return 1
}

# Clean up function
cleanup() {
    echo -e "\n${BLUE}Checking for old processes...${NC}"
    if pgrep -f "$SCRIPT_DIR/mysql" >/dev/null || pgrep -f "$SCRIPT_DIR/server" >/dev/null || pgrep -f "$SCRIPT_DIR/client" >/dev/null; then
        echo -e "${RED}Warning: There are existing server processes running:${NC}"
        pgrep -af "$SCRIPT_DIR/mysql"
        pgrep -af "$SCRIPT_DIR/server"
        pgrep -af "$SCRIPT_DIR/client"
        echo -e "${BLUE}To kill a process, use the following command:${NC}"
        echo -e "${GREEN}kill -9 <PID>${NC}\n"
        echo -e "${BLUE}We will try cleaning these up for you, but incase we fail, please help us out by killing them yourself!${NC}\n"
        return 1
    else
        echo -e "${GREEN}No old processes found. You're good to go!${NC}"
        return 0
    fi
}

# Start MySQL
echo -e "${BLUE}Starting MySQL...${NC}"
cleanup
cd "$SCRIPT_DIR/mysql"
rm -f run/mysql.sock run/mysql.pid
mkdir -p run
chmod 777 run data
./start.sh
if ! wait_for_mysql; then
    cleanup
    exit 1
fi

# Export MySQL socket path for the server
export MYSQL_SOCKET="$SCRIPT_DIR/mysql/run/mysql.sock"

# Start server in background
echo -e "${BLUE}Starting server...${NC}"
cd "$SCRIPT_DIR/server"
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start server with explicit environment variables
MYSQL_SOCKET="$SCRIPT_DIR/mysql/run/mysql.sock" \
    DB_HOST="127.0.0.1" \
    DB_PORT="7272" \
    DB_USER="rgap_user" \
    DB_PASSWORD="12345" \
    DB_NAME="rgap" \
    PORT="3030" \
    npm run dev &
SERVER_PID=$!
sleep 5 # Wait for server to start

# Start client in background
echo -e "${BLUE}Starting client...${NC}"
cd "$SCRIPT_DIR/client"
if [ ! -d "node_modules" ]; then
    npm install
fi
PORT="3000" npm run dev &
CLIENT_PID=$!

echo -e "${GREEN}Application started successfully!${NC}"
echo -e "${BLUE}Access the application at:${NC}"
echo -e "  Frontend: http://localhost:3000"
echo -e "  API: http://localhost:3030"
echo -e "  MySQL: localhost:7272"
echo
echo -e "${BLUE}To stop the application:${NC}"
echo -e "  1. Press Ctrl+C"
echo -e "  2. Run '$SCRIPT_DIR/mysql/stop.sh'"

# Handle cleanup on script termination
trap 'cleanup' SIGINT SIGTERM

# Keep script running
wait
