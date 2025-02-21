# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Set the default behavior for printf to include a newline
printf_with_newline() {
    printf "$@" && echo
}

# Alias printf to the new function
alias print=printf_with_newline

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

# Function to check for errors
check_error() {
    if [ $? -ne 0 ]; then
        print_error "$1"
        exit 1
    fi
}

# Script timer
start_timer() {
    start_time=$(date +%s)
}

# Function to format time duration
format_duration() {
    local duration=$1
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    if [ $minutes -gt 0 ]; then
        echo "${minutes}min ${seconds}s"
    else
        echo "${seconds}s"
    fi
}

print_time_taken() {
    end_time=$(date +%s)
    duration=$(( end_time - start_time ))
    print "${BLUE}Script completed in $(format_duration $duration)${NC}\n"
}