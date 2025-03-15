#!/bin/bash

# Import setup_utils.sh
source "setup_utils.sh"

# Start timing
start_timer

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_PATH="$SCRIPT_DIR/venv"
LOG_DIR="$SCRIPT_DIR/log"
LOG_FILE="$LOG_DIR/setup_env.log"

# Create log directory if it doesn't exist
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
fi

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
        # Remove log file if it exists
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

# Print header
print_header "RGAP Development Environment Setup"

# Function to check if virtualenv exists and is valid
check_venv() {
    if [ -d "$VENV_PATH" ] && [ -f "$VENV_PATH/bin/activate" ]; then
        if [ -f "$VENV_PATH/bin/pip" ]; then
            return 0
        fi
    fi
    return 1
}

# Function to check for package updates
check_package_updates() {
    print_section "3" "Package Updates Check"

    print_status "Checking for outdated packages..."
    local outdated=$(pip list --outdated --format=json)
    local outdated_count=$(echo $outdated | jq '. | length')

    if [ "$outdated_count" -eq "0" ]; then
        print_success "All packages are up to date"
        return 0
    fi

    print_warning "Found $outdated_count outdated packages:"
    local total_packages=$outdated_count
    local current=0

    echo $outdated | jq -c '.[]' | while read -r package; do
        ((current++))
        local name=$(echo $package | jq -r '.name')
        local current_version=$(echo $package | jq -r '.version')
        local latest_version=$(echo $package | jq -r '.latest_version')

        setup_progress "$current" "$total_packages" "Upgrading $name $current_version -> $latest_version"
        pip install --upgrade "$name" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            clear_progress_line
            print_success "Upgraded $name: $current_version -> $latest_version"
        else
            clear_progress_line
            print_error "Failed to upgrade $name"
        fi
    done
}

# Function to upgrade pip if needed
upgrade_pip() {
    print_section "2" "Python Environment"

    print_status "Checking pip version..."
    current_version=$(pip --version | awk '{print $2}')
    pip install --upgrade pip --quiet
    new_version=$(pip --version | awk '{print $2}')
    if [ "$current_version" != "$new_version" ]; then
        print_success "Upgraded pip $current_version -> $new_version"
    else
        print_success "pip is up to date ($current_version)"
    fi
}

# Function to set up Node.js
setup_node() {
    print_section "4" "Node.js Environment"

    print_status "Checking nvm installation..."

    # Check if nvm is installed
    if [ -d "$HOME/.nvm" ]; then
        print_success "Found existing nvm installation"

        # Upgrade nvm itself
        print_status "Checking for nvm updates..."
        current_version=$(nvm --version 2>/dev/null || echo "Unknown!")

        # Only try to upgrade if we got a valid version
        if [ "$current_version" != "unknown" ]; then
            # Use curl to get the latest version number
            latest_version=$(curl -s https://api.github.com/repos/nvm-sh/nvm/releases/latest | grep '"tag_name":' | sed -E 's/.*"v([0-9]+\.[0-9]+\.[0-9]+).*/\1/')

            if [ "$current_version" != "$latest_version" ]; then
                print_status "Upgrading nvm $current_version -> $latest_version"
                curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/$latest_version/install.sh" | bash
            else
                print_success "nvm is up to date ($current_version)"
            fi
        else
            print_error "Unexpected outcome. Current nvm version: $current_version"
            return 1
        fi
    else
        print_status "Installing nvm..."
        curl -o- "https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh" | bash
    fi

    # Load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Check Node.js and upgrade if needed
    if command -v node >/dev/null; then
        current_version=$(node -v)
        print_status "Checking for Node.js updates..."

        # Get the latest LTS version without the 'v' prefix
        latest_version=$(nvm version-remote --lts | sed 's/v//')
        current_version=$(echo $current_version | sed 's/v//')

        # Version comparison
        if [ "$current_version" != "$latest_version" ]; then
            print_status "Upgrading Node.js v$current_version -> v$latest_version"
            nvm install --lts --reinstall-packages-from=current --latest-npm
            nvm use --lts
            nvm alias default "lts/*"
        else
            print_success "Node.js is up to date (v$current_version)"
        fi
    else
        print_status "Installing Node.js LTS..."
        nvm install --lts --latest-npm
        nvm use --lts
        nvm alias default "lts/*"
    fi

    # Check npm and upgrade if needed
    if command -v npm >/dev/null; then
        current_version=$(npm -v)
        print_status "Checking for npm updates..."
        latest_version=$(npm view npm version 2>/dev/null)

        if [ "$current_version" != "$latest_version" ]; then
            print_status "Upgrading npm $current_version -> $latest_version"
            npm install -g npm@latest
        else
            print_success "npm is up to date ($current_version)"
        fi
    else
        print_error "npm not found after Node.js installation"
        return 1
    fi

    print_success "Node.js toolchain setup complete"
    return 0
}

# Environment check
print_section "1" "Environment Check"

# Setup portion with both terminal output and logging
{
    print_status "Checking RGAP development environment..."

    # Create virtual environment if it doesn't exist
    if ! check_venv; then
        print_status "Creating new virtual environment..."
        # Run the Python setup script
        python setup_env.py --path "$SCRIPT_DIR"

        if [ $? -ne 0 ]; then
            cleanup_on_error
            return 1
        fi
    fi

    print_success "Environment check completed successfully"
} 2>&1 | tee >(log_with_no_color >>$LOG_FILE)

# Export MySQL related paths
export MYSQL_DIR="$SCRIPT_DIR/mysql"
export MYSQL_VERSION="8.0.41"
export MYSQL_BIN="$MYSQL_DIR/mysql-$MYSQL_VERSION/bin"

# Source port configuration
source "$SCRIPT_DIR/config/get_port_config.sh"

# Now execute activation
if ! check_venv; then
    cleanup_on_error
    return 1
fi

print_status "Activating RGAP Virtual Environment..."
source "$VENV_PATH/bin/activate"

# Add environment info to PS1 if not already there
if [[ $PS1 != *"RGAP"* ]]; then
    export OLD_PS1="$PS1"
    export PS1="(RGAP) $PS1"
fi

print_success "Virtual environment activated"

# Upgrade pip
upgrade_pip

# Check for package updates if environment already existed
if [ -f "$VENV_PATH/.initialized" ]; then
    check_package_updates
fi

# Set up Node.js tools
setup_node
node_exit_code=$?
if [ $node_exit_code -ne 0 ]; then
    cleanup_on_error
    return 1
fi

print_header "Ready to Use"
print "${BLUE}To set-up the RGAP Virtual Environment in any terminal, run this script again:${NC}"
print "  source $(basename "${BASH_SOURCE[0]}")\n"

print "${GREEN}Environment setup complete!${NC}"
print "${BLUE}You can now run:"
print "  1.${NC} source setup_env.sh ${BLUE}(to activate the virtual environment on the terminal)"
print "  2.${NC} ./setup_mysql.sh    ${BLUE}(to install and setup MySQL 8.0.36 for Linux -> first time only)"
print "  3.${NC} ./setup_app.sh      ${BLUE}(to start the application)\n"

# Calculate and display execution time
print_time_taken
