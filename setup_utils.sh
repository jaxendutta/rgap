# Colors for output
export GREEN='\033[0;32m'
export BLUE='\033[0;34m'
export RED='\033[0;31m'
export YELLOW='\033[1;33m'
export NC='\033[0m' # No Color

# Print with newline
print() {
    printf "%b\n" "$*"
}
export -f print

# Print with color
print_status() {
    echo -e "${BLUE}==>${NC} $1"
}
export -f print_status

print_success() {
    echo -e "${GREEN}==>${NC} $1"
}
export -f print_success

print_error() {
    echo -e "${RED}==>${NC} $1"
}
export -f print_error

print_warning() {
    echo -e "${YELLOW}==>${NC} $1"
}
export -f print_warning

# Function to check for errors
check_error() {
    if [ $? -ne 0 ]; then
        print_error "$1"
        exit 1
    fi
}
export -f check_error

# Script timer
start_timer() {
    export start_time=$(date +%s)
}
export -f start_timer

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
export -f format_duration

print_time_taken() {
    if [ -n "$start_time" ]; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        print "${BLUE}Script completed in $(format_duration $duration)${NC}"
    fi
}
export -f print_time_taken
