#!/bin/bash

# Start timing
start_time=$(date +%s)

# Set the default behavior for printf to include a newline
printf_with_newline() {
    printf "$@" && echo
}

# Alias printf to the new function
alias print=printf_with_newline

# print colored text
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
VENV_PATH="$SCRIPT_DIR/venv"
LOG_FILE="$SCRIPT_DIR/setup.log"

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

# Function to handle cleanup on error
cleanup_on_error() {
    local undo=$1
    if [ "$undo" = true ]; then
        print "${BLUE}\nCleaning up RGAP environment...${NC}"
    else
        print "${RED}\nError occurred. Cleaning up...${NC}"
    fi
    
    # Deactivate venv if it's active
    if [[ "$VIRTUAL_ENV" == *"$VENV_PATH"* ]]; then
        printf "${BLUE}  Deactivating virtual environment... ${NC}"
        deactivate 2>/dev/null
        if [ ! -z "$OLD_PS1" ]; then
            export PS1="$OLD_PS1"
            unset OLD_PS1
        fi
        print "${GREEN}✓${NC}"
    fi

    # Remove the venv directory
    if [ -d "$VENV_PATH" ]; then
        printf "${BLUE}  Removing virtual environment directory... ${NC}"
        rm -rf "$VENV_PATH"
        print "${GREEN}✓${NC}"
    fi

    if [ "$undo" = true ]; then
        # Remove setup.log if it exists
        if [ -f $LOG_FILE ]; then
            printf "${BLUE}  Removing setup log... ${NC}"
            rm $LOG_FILE
            print "${GREEN}✓${NC}"
        fi
        print "${GREEN}RGAP environment cleanup complete!${NC}"
        print_time_taken
        return 0
    else
        print "${RED}Setup failed. Check $LOG_FILE for details.${NC}"
        print_time_taken
        return 1
    fi
}

# Check if -undo flag is passed
if [ "$1" = "-undo" ]; then
    cleanup_on_error true
    return 0
fi

# Function to check if virtualenv exists and is valid
check_venv() {
    if [ -d "$VENV_PATH" ] && [ -f "$VENV_PATH/bin/activate" ]; then
        if [ -f "$VENV_PATH/bin/pip" ]; then
            return 0
        fi
    fi
    return 1
}

# Function to strip ANSI color codes
log_with_no_color() {
    sed -r "s/\x1B\[([0-9]{1,3}(;[0-9]{1,2})?)?[mGK]//g"
}

# Function to upgrade pip if needed
upgrade_pip() {
    print "${BLUE}Checking for pip upgrades...${NC}"
    current_version=$(pip --version | awk '{print $2}')
    pip install --upgrade pip --quiet
    new_version=$(pip --version | awk '{print $2}')
    if [ "$current_version" != "$new_version" ]; then
        print "  ${GREEN}Successfully upgraded pip $current_version -> $new_version${NC}"
    else
        print "  ${BLUE}No upgrades pushed to pip. Current version: $current_version${NC}"
    fi
}

# Function to set up Node.js
setup_node() {
    print "${BLUE}Setting up Node.js toolchain...${NC}"
    
    # Check if nvm is installed
    if [ -d "$HOME/.nvm" ]; then
        print "  ${BLUE}Found existing nvm installation${NC}"
        
        # Upgrade nvm itself
        print "  ${BLUE}Checking for nvm updates...${NC}"
        current_version=$(nvm --version 2>/dev/null || echo "unknown")
        
        # Only try to upgrade if we got a valid version
        if [ "$current_version" != "unknown" ]; then
            # Use curl to get the latest version number
            latest_version=$(curl -s https://api.github.com/repos/nvm-sh/nvm/releases/latest | grep '"tag_name":' | sed -E 's/.*"v([0-9]+\.[0-9]+\.[0-9]+).*/\1/')
            
            if [ "$current_version" != "$latest_version" ]; then
                print "  ${BLUE}Upgrading nvm $current_version -> $latest_version${NC}"
                curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$latest_version/install.sh" | bash
            else
                print "  ${BLUE}nvm is up to date ($current_version)${NC}"
            fi
        fi
    else
        print "  ${BLUE}Installing nvm...${NC}"
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
    fi
    
    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    # Check Node.js and upgrade if needed
    if command -v node > /dev/null; then
        current_version=$(node -v)
        print "  ${BLUE}Checking for Node.js updates...${NC}"
        
        # Get the latest LTS version without the 'v' prefix
        latest_version=$(nvm version-remote --lts | sed 's/v//')
        current_version=$(echo $current_version | sed 's/v//')
        
        # Version comparison
        if [ "$current_version" != "$latest_version" ]; then
            print "  ${BLUE}Upgrading Node.js v$current_version -> v$latest_version${NC}"
            nvm install --lts --reinstall-packages-from=current --latest-npm
            nvm use --lts
            nvm alias default "lts/*"
        else
            print "  ${BLUE}Node.js is up to date (v$current_version)${NC}"
        fi
    else
        print "  ${BLUE}Installing Node.js LTS...${NC}"
        nvm install --lts --latest-npm
        nvm use --lts
        nvm alias default "lts/*"
    fi
    
    # Check npm and upgrade if needed
    if command -v npm > /dev/null; then
        current_version=$(npm -v)
        print "  ${BLUE}Checking for npm updates...${NC}"
        latest_version=$(npm view npm version 2>/dev/null)
        
        if [ "$current_version" != "$latest_version" ]; then
            print "  ${BLUE}Upgrading npm $current_version -> $latest_version${NC}"
            npm install -g npm@latest
        else
            print "  ${BLUE}npm is up to date ($current_version)${NC}"
        fi
    else
        print "  ${RED}npm not found after Node.js installation${NC}"
        return 1
    fi
    
    print "${GREEN}Node.js toolchain setup complete!${NC}"
}

# Setup portion with both terminal output and logging
{
    print "${BLUE}\nChecking RGAP development environment...${NC}"

    # Create virtual environment if it doesn't exist
    if ! check_venv; then
        print "${BLUE}Creating new virtual environment...${NC}"
        python -m venv "$VENV_PATH"
        
        if [ $? -ne 0 ]; then
            cleanup_on_error
            return 1
        fi
    fi

    print "${GREEN}Environment check completed successfully!${NC}"
} 2>&1 | tee >(log_with_no_color >> $LOG_FILE)

# Setup MySQL path
export PATH="$SCRIPT_DIR/mysql/mysql-8.0.36-linux-glibc2.28-x86_64/bin:$PATH"

# Now execute activation
if ! check_venv; then
    cleanup_on_error
    return 1
fi

print "${BLUE}  Activating RGAP Virtual Environment...${NC}"
source "$VENV_PATH/bin/activate"

# Add environment info to PS1 if not already there
if [[ $PS1 != *"RGAP"* ]]; then
    export OLD_PS1="$PS1"
    export PS1="(RGAP) $PS1"
fi

print "${GREEN}  Activated. You're now in the RGAP Virtual Environment!${NC}"

# Upgrade pip
upgrade_pip

# Set up Node.js tools
setup_node
node_exit_code=$?
if [ $node_exit_code -ne 0 ]; then
    cleanup_on_error
    return 1
fi

# Install RGAP package in development mode
{
    print "${BLUE}Installing RGAP package in development mode...${NC}"
    pip install -e . 2>&1
    pip_exit_code=$?
    
    if [ $pip_exit_code -ne 0 ]; then
        cleanup_on_error
        return 1
    fi
    print "${GREEN}  RGAP project package installed successfully!${NC}"
} 2>&1 | tee >(log_with_no_color >> $LOG_FILE)

print "${BLUE}\nTo set-up the RGAP Virtual Environment in any terminal, run this script again:${NC}"
print "  source $(basename "${BASH_SOURCE[0]}")\n"

print "${BLUE}Run './setup_app.sh' to start the application${NC}"

# Calculate and display execution time
print_time_taken