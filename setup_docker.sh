#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Import port configuration function
source "${SCRIPT_DIR}/config/get_port_config.sh"

# Get available ports
get_available_ports

# Export ports for docker-compose (these variables come from get_port_config.sh)
export DB_PORT=${MYSQL_PORT}
export API_PORT=${SERVER_PORT}
export CLIENT_PORT=${CLIENT_PORT}

# Print port configuration
echo -e "${BLUE}=== RGAP Service Ports ===${NC}"
echo -e "🗄️  MySQL:  ${GREEN}localhost:${DB_PORT}${NC}"
echo -e "🚀 Server: ${GREEN}http://localhost:${API_PORT}${NC}"
echo -e "🌐 Client: ${GREEN}http://localhost:${CLIENT_PORT}${NC}\n"

# Start services
echo -e "${BLUE}Starting RGAP services...${NC}"
docker-compose up --build

# Cleanup on exit
trap 'docker-compose down' EXIT