# RGAP - MySQL Setup Guide

## Overview

RGAP (Research Grant Analytics Platform) is a database-driven application for analyzing Canadian research funding data. This guide focuses on setting up the MySQL database component.

## Quick Start

```bash
# Make the script executable if not already
chmod +x scripts/mysql_setup.sh

# Run setup
./scripts/mysql_setup.sh
```

## What the Setup Script Does

The `mysql_setup.sh` script automates the following:

1. **Directory Structure Creation**
   - `mysql/` - Main MySQL directory
   - `mysql/data/` - Database files
   - `mysql/run/` - Runtime files (socket, PID)
   - `mysql/log/` - Log files
   - `sql/` - SQL scripts and schema
   - `data/` - Data files directory

2. **MySQL Installation**
   - Downloads MySQL 8.0.36
   - Extracts and configures MySQL
   - Sets up optimized configuration

3. **Database Initialization**
   - Initializes MySQL data directory
   - Creates the RGAP database
   - Imports schema (if provided)

4. **Control Scripts Creation**
   - Creates `start.sh` for starting MySQL
   - Creates `stop.sh` for stopping MySQL
   - Sets up convenient aliases

5. **Local and Remote User Setup**
   - Creates a local user for RGAP
   - Grants necessary permissions
   - Flushes privileges

## Directory Structure

```
rgap/
├── mysql/                 # MySQL installation and data
│   ├── data/              # Database files
│   ├── run/               # Runtime files
│   ├── log/               # Log files
│   ├── my.cnf             # MySQL configuration
│   ├── start.sh           # Start script
│   └── stop.sh            # Stop script
├── scripts/
│   └── mysql_setup.sh     # Main setup script
└── sql/                   # SQL scripts and schema
```

## Usage

### Basic Commands

After running the setup script and sourcing your `.bashrc`:

```bash
# Start MySQL
mysql-rgap-start

# Connect to MySQL
mysql-rgap -u root rgap

# Stop MySQL
mysql-rgap-stop
```

### Detailed Usage

1. **Starting MySQL**
   ```bash
   mysql-rgap-start
   # Watch logs if needed:
   tail -f mysql/log/error.log
   ```

2. **Connecting to Database**
   ```bash
   # Using alias
   mysql-rgap -u root rgap

   # Or full command
   ~/cs348/rgap/mysql/mysql-8.0.36-linux-glibc2.28-x86_64/bin/mysql --socket=/u1/[username]/cs348/rgap/mysql/run/mysql.sock -u root rgap
   ```

3. **Stopping MySQL**
   ```bash
   mysql-rgap-stop
   ```

## Configuration

The MySQL configuration file (`my.cnf`) is located at `mysql/my.cnf` and includes:

- InnoDB buffer pool: 1GB
- Maximum connections: 151
- Socket file location: `mysql/run/mysql.sock`
- Log file location: `mysql/log/error.log`

## Troubleshooting

### Common Issues

1. **MySQL Won't Start**
   ```bash
   # Check logs
   tail -f mysql/log/error.log

   # Clean start
   mysql-rgap-stop
   rm -f mysql/run/mysql.sock mysql/run/mysql.pid
   mysql-rgap-start
   ```

2. **Can't Connect**
   ```bash
   # Verify MySQL is running
   ps aux | grep mysqld

   # Check socket file
   ls -l mysql/run/mysql.sock
   ```

3. **Complete Reset**
   ```bash
   # Stop MySQL
   mysql-rgap-stop

   # Kill processes
   pkill -9 -f mysql

   # Clean directories
   rm -rf mysql/data/*
   rm -f mysql/run/*
   rm -f mysql/log/*

   # Reinitialize
   cd mysql/mysql-8.0.36-linux-glibc2.28-x86_64
   ./bin/mysqld --defaults-file=../my.cnf --initialize-insecure

   # Start MySQL
   mysql-rgap-start
   ```

## Maintenance

### Backup

```bash
# Stop MySQL
mysql-rgap-stop

# Backup data directory
tar czf mysql_backup_$(date +%Y%m%d).tar.gz mysql/data/

# Restart MySQL
mysql-rgap-start
```

### Log Rotation

```bash
# Check log size
ls -lh mysql/log/error.log

# Rotate logs
mv mysql/log/error.log mysql/log/error.log.old
mysql-rgap -u root -e "FLUSH LOGS"
```

## Security Notes

- Default setup has no root password
- All files stored in user home directory
- Socket authentication used by default
- No remote connections enabled

## File Locations

- **MySQL Binary**: `mysql/mysql-8.0.36-linux-glibc2.28-x86_64/bin/mysql`
- **Socket File**: `mysql/run/mysql.sock`
- **Config File**: `mysql/my.cnf`
- **Log File**: `mysql/log/error.log`
- **Data Directory**: `mysql/data/`

## Additional Notes

- The setup script adds aliases to your `.bashrc`
- MySQL runs on port 3306 by default
- All paths are relative to your project directory
- The script assumes a Linux environment

## Support

For issues:
1. Check the error log: `tail -f mysql/log/error.log`
2. Check process status: `ps aux | grep mysqld`
3. Verify file permissions: `ls -la mysql/{data,run,log}`

If problems persist, collect the error log and process status before seeking help.