#!/bin/bash

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

# Setup portion - capture in log but don't affect activation
{
    if check_venv; then
        print "${BLUE}\nFound existing RGAP virtual environment${NC}"
    else
        print "${BLUE}\nSetting up new RGAP development environment...${NC}"
        
        # Run the Python setup script
        python setup.py
        
        if [ $? -ne 0 ]; then
            print "${RED}Environment setup failed. Please check the error messages above.${NC}"
            exit 1
        fi
        print "${GREEN}Environment setup completed successfully!${NC}"
    fi
} 2>&1 | tee >(log_with_no_color > setup.log)

# Now execute activation directly (not in a subshell)
if check_venv; then
    print "${BLUE}  Activating RGAP Virtual Environment...${NC}"
    source "$VENV_PATH/bin/activate"
    
    # Add environment info to PS1 if not already there
    if [[ $PS1 != *"RGAP"* ]]; then
        export OLD_PS1="$PS1"
        export PS1="(RGAP) $PS1"
    fi
    
    print "${GREEN}  Activated. You're now in the RGAP Virtual Environment!${NC}"
    print "${BLUE}\nTo set-up the RGAP Virtual Environment in any terminal, run this script again:${NC}"
    print "  source $(basename "${BASH_SOURCE[0]}")\n"
else
    print "${RED}Virtual environment setup failed.${NC}"
    exit 1
fi