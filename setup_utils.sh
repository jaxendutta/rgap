#!/bin/bash

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
        return 1
    fi
}
export -f check_error

# Visual formatting functions
print_header() {
    local title=$1
    echo
    print "$title"
    print "$(printf '=%.0s' $(seq 1 ${#title}))"
}
export -f print_header

print_section() {
    local number=$1
    local title=$2
    echo
    print "$number. $title"
    print "$(printf '%0.s-' $(seq 1 $((${#number} + ${#title} + 2))))"
}
export -f print_section

print_status_indented() {
    print "   $(print_status "$1")"
}
export -f print_status_indented

print_success_indented() {
    print "      ${GREEN}✓${NC} $1"
}
export -f print_success_indented

# Script timer functions
start_timer() {
    export start_time=$(date +%s)
}
export -f start_timer

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
        print "${BLUE}Script concluded in $(format_duration $duration)${NC}"
    fi
}
export -f print_time_taken

# Progress bar functions
clear_progress_line() {
    printf "\r%*s\r" "$(tput cols)" ""
}
export -f clear_progress_line

setup_progress() {
    local current=$1
    local total=$2
    local description=$3
    local width=50
    local percentage=$((current * 100 / total))
    local filled=$((width * current / total))
    local empty=$((width - filled))

    # Clear the line first
    printf "\r%*s\r" "$(tput cols)" ""

    # Print progress bar
    printf "  Progress: ["
    printf "%${filled}s" '' | tr ' ' '#'
    printf "%${empty}s" '' | tr ' ' '-'
    printf "] %3d%% - %s" "$percentage" "$description"
}
export -f setup_progress

# Logging functions
log_with_no_color() {
    sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"
}
export -f log_with_no_color

log_message() {
    local message=$1
    local log_file=$2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $message" | log_with_no_color >>"$log_file"
}
export -f log_message

# Common validation functions
validate_directory() {
    local dir=$1
    if [ ! -d "$dir" ]; then
        print_error "Directory not found: $dir"
        return 1
    fi
    return 0
}
export -f validate_directory

validate_file() {
    local file=$1
    if [ ! -f "$file" ]; then
        print_error "File not found: $file"
        return 1
    fi
    return 0
}
export -f validate_file

# Common cleanup functions
cleanup_process() {
    local pid=$1
    local name=$2
    if [ -n "$pid" ] && ps -p $pid >/dev/null; then
        print_status "Stopping $name (PID: $pid)..."
        kill -9 $pid 2>/dev/null
        wait $pid 2>/dev/null
    fi
}
export -f cleanup_process

cleanup_file() {
    local file=$1
    if [ -f "$file" ]; then
        print_status "Removing $file..."
        rm -f "$file"
    fi
}
export -f cleanup_file
