#!/bin/bash

# Get the directory where this script is located
SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Function to get a specific port range
get_port_range() {
    local service=$1
    jq -r ".ranges.$service" "$SCRIPT_DIR/ports.json"
}

# Function to get a default port
get_default_port() {
    local service=$1
    jq -r ".defaults.$service" "$SCRIPT_DIR/ports.json"
}

# Export functions
export -f get_port_range
export -f get_default_port