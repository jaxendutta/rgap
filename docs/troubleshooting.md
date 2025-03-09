# RGAP Troubleshooting Guide

This guide provides solutions for common issues you might encounter when installing, configuring, or using the Research Grant Analytics Platform (RGAP).

## Table of Contents
- [Installation Issues](#installation-issues)
- [Database Issues](#database-issues)
- [Server Issues](#server-issues)
- [Client Issues](#client-issues)
- [Data Import Issues](#data-import-issues)
- [Performance Issues](#performance-issues)
- [Common Error Messages](#common-error-messages)
- [Getting Help](#getting-help)

## Installation Issues

### Failed Environment Setup

**Problem**: `setup_env.sh` fails or environment variables aren't properly set.

**Solution**:
1. Ensure you're running `source setup_env.sh` not `./setup_env.sh`
2. Check that your shell is compatible (bash or zsh recommended)
3. Manually export required variables:
   ```bash
   export MYSQL_DIR="$(pwd)/mysql"
   export MYSQL_VERSION="mysql-8.0.33-linux-glibc2.12-x86_64"
   export MYSQL_BIN="${MYSQL_DIR}/${MYSQL_VERSION}/bin"
   export PATH="${MYSQL_BIN}:${PATH}"
   ```

### MySQL Installation Issues

**Problem**: `setup_mysql.sh` fails during MySQL installation.

**Solution**:
1. Check if you have sufficient permissions:
   ```bash
   chmod +x setup_mysql.sh
   ```
2. Ensure wget is installed for downloading MySQL:
   ```bash
   sudo apt-get install wget
   ```
3. Try manually downloading MySQL from:
   ```
   https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.33-linux-glibc2.12-x86_64.tar.xz
   ```
4. If port conflicts occur, edit `config/ports.json` to use different port ranges

### Permission Issues

**Problem**: "Permission denied" errors during setup.

**Solution**:
1. Set executable permissions on all scripts:
   ```bash
   chmod +x *.sh
   chmod +x config/*.sh
   ```
2. Ensure you have write permissions to the directory:
   ```bash
   sudo chown -R $(whoami) .
   ```

### Dependency Issues

**Problem**: Missing system dependencies.

**Solution**:
1. Install required system packages:
   ```bash
   # For Debian/Ubuntu
   sudo apt-get update
   sudo apt-get install build-essential libssl-dev python3-dev python3-pip p7zip-full
   
   # For Red Hat/CentOS
   sudo yum install gcc openssl-devel python3-devel python3-pip p7zip
   ```

## Database Issues

### MySQL Connection Failed

**Problem**: Server can't connect to MySQL.

**Solution**:
1. Check if MySQL is running:
   ```bash
   ps aux | grep mysql
   ```
2. Restart the MySQL instance:
   ```bash
   ./mysql/users/$(whoami)/stop.sh
   ./mysql/users/$(whoami)/start.sh
   ```
3. Verify socket file exists:
   ```bash
   ls -la ./mysql/users/$(whoami)/run/mysql.sock
   ```

### Lost Connection After SSH Disconnect

**Problem**: MySQL connection lost after SSH session terminates.

**Solution**:
This is a known issue with the MySQL setup. When your SSH session disconnects, the MySQL process sometimes terminates or the socket file becomes invalid.

1. Complete cleanup of the MySQL installation:
   ```bash
   rm -rf mysql/users/$(whoami)
   ```
2. Re-run MySQL setup:
   ```bash
   ./setup_mysql.sh
   ```
3. For production use, consider using `screen` or `tmux` to maintain your session:
   ```bash
   screen -S rgap
   # Run your commands here
   # Press Ctrl+A, D to detach
   # Use screen -r rgap to reattach
   ```

### Database Schema Errors

**Problem**: Database schema issues during setup.

**Solution**:
1. Start fresh with a clean database:
   ```bash
   # Connect to MySQL
   mysql-rgap
   
   # Drop and recreate the database
   DROP DATABASE rgap;
   CREATE DATABASE rgap;
   ```
2. Re-run the database setup:
   ```bash
   ./setup_db.sh --sample
   ```

## Server Issues

### Server Won't Start

**Problem**: The server fails to start.

**Solution**:
1. Check for port conflicts:
   ```bash
   lsof -i :4000  # Replace with your server port
   ```
2. Check server logs:
   ```bash
   cat server/nohup.out
   ```
3. Manually start the server to see error messages:
   ```bash
   cd server
   npm run dev
   ```
4. Check that database connection parameters are correct:
   ```bash
   # Verify configuration in server/config/db.js
   # or set environment variables manually
   export DB_HOST=localhost
   export DB_PORT=5000
   export DB_USER=rgap_user
   export DB_PASSWORD=12345
   export DB_NAME=rgap
   ```

### Server Crashes

**Problem**: Server crashes during operation.

**Solution**:
1. Check for memory issues:
   ```bash
   free -m
   ```
2. Increase Node.js memory limit:
   ```bash
   export NODE_OPTIONS=--max_old_space_size=4096
   ```
3. Check for unhandled promise rejections in the code
4. Update server dependencies:
   ```bash
   cd server
   npm update
   ```

## Client Issues

### Client Won't Start

**Problem**: The client application fails to start.

**Solution**:
1. Check for port conflicts:
   ```bash
   lsof -i :3000  # Replace with your client port
   ```
2. Check for build errors:
   ```bash
   cd client
   npm run build
   ```
3. Check that API URL is correct:
   ```bash
   # Verify VITE_API_URL in client/.env
   # or set environment variable manually
   export VITE_API_URL=http://localhost:4000
   ```
4. Update client dependencies:
   ```bash
   cd client
   npm update
   ```

### UI Rendering Issues

**Problem**: UI components don't render correctly.

**Solution**:
1. Clear browser cache and reload
2. Try a different browser
3. Update client dependencies:
   ```bash
   cd client
   npm update
   ```
4. Check browser console for JavaScript errors

## Data Import Issues

### Data Fetching Fails

**Problem**: `fetcher.py` fails to download data.

**Solution**:
1. Check internet connection
2. Verify API endpoint is accessible:
   ```bash
   curl "https://open.canada.ca/data/api/action/package_show?id=432527ab-7aac-45b5-81d6-7597107a7013"
   ```
3. Add verbose output for debugging:
   ```bash
   python fetcher.py --year-start 2019 --year-end 2020 --verbose
   ```
4. Try fetching with SSL verification disabled:
   ```bash
   # Note: Only do this for debugging, not in production
   python3 -c "import urllib3; urllib3.disable_warnings()"
   python fetcher.py --year-start 2019 --year-end 2020 --no-verify-ssl
   ```

### Data Import is Slow

**Problem**: Data import takes too long.

**Solution**:
1. Start with sample data for testing:
   ```bash
   ./setup_db.sh --sample
   ```
2. Optimize import settings:
   ```bash
   # Edit sql/data/import_data.sql to adjust batch sizes
   ```
3. Use a more powerful machine for initial import
4. Use compressed data formats (7z) for faster loading:
   ```bash
   python fetcher.py --year-start 2019 --compress 7z
   ```

### Invalid CSV Format

**Problem**: CSV import errors during database setup.

**Solution**:
1. Verify file encoding:
   ```bash
   file data/processed/data_*.csv
   ```
2. Fix encoding issues:
   ```bash
   iconv -f UTF-8 -t UTF-8 -c input.csv > output.csv
   ```
3. Check for and fix quote character issues:
   ```bash
   sed 's/""/"/' input.csv > output.csv
   ```

## Performance Issues

### Slow Search Queries

**Problem**: Search queries are slow.

**Solution**:
1. Check database indexes:
   ```sql
   SHOW INDEX FROM ResearchGrant;
   ```
2. Add missing indexes:
   ```sql
   CREATE INDEX idx_grant_title ON ResearchGrant(agreement_title_en(255));
   ```
3. Optimize database queries in `controllers/searchController.js`
4. Implement result caching for common searches

### High Memory Usage

**Problem**: Application uses too much memory.

**Solution**:
1. Monitor memory usage:
   ```bash
   watch "ps aux | grep node"
   ```
2. Implement pagination for large result sets
3. Use streaming responses for large data transfers
4. Optimize client-side data processing
5. Increase available memory on the server

### Slow Data Visualization

**Problem**: Charts and visualizations are slow to render.

**Solution**:
1. Limit the amount of data displayed at once
2. Use data aggregation for large datasets
3. Implement progressive loading for visualizations
4. Optimize client-side JavaScript code
5. Consider using WebWorkers for data processing

## Common Error Messages

### "Cannot find module"

**Problem**: Node.js reports missing modules.

**Solution**:
1. Install node dependencies:
   ```bash
   cd server
   npm install
   
   cd ../client
   npm install
   ```
2. Check for and fix circular dependencies
3. Ensure node_modules is not in .gitignore if committing dependencies

### "Access denied for user"

**Problem**: MySQL authentication fails.

**Solution**:
1. Verify user credentials:
   ```bash
   # Connect to MySQL as root
   mysql-rgap
   
   # Grant permissions again
   GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost' IDENTIFIED BY '12345';
   FLUSH PRIVILEGES;
   ```
2. Check if the rgap_user exists:
   ```sql
   SELECT User, Host FROM mysql.user;
   ```

### "ER_NO_SUCH_TABLE"

**Problem**: Database tables don't exist.

**Solution**:
1. Run database setup again:
   ```bash
   ./setup_db.sh --sample
   ```
2. Manually create missing tables:
   ```bash
   mysql-rgap rgap < sql/schema/missing_table.sql
   ```

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Problem**: CORS policy prevents API access.

**Solution**:
1. Check CORS configuration in server/index.js
2. Add your client URL to the allowed origins:
   ```javascript
   app.use(cors({
       origin: [
           'http://localhost:3000',
           'http://your-client-domain.com'
       ],
       methods: ['GET', 'POST', 'PUT', 'DELETE'],
       credentials: true
   }));
   ```

## Getting Help

If you've tried the troubleshooting steps above and are still experiencing issues:

1. Check the GitHub repository issues page for similar problems
2. Review detailed logs:
   ```bash
   # Server logs
   cat server/nohup.out
   
   # MySQL logs
   cat mysql/users/$(whoami)/log/error.log
   
   # Database import logs
   cat database_import.log
   ```
3. Gather system information for reporting issues:
   ```bash
   # System info
   uname -a
   free -m
   df -h
   
   # Node.js version
   node -v
   npm -v
   
   # MySQL version
   mysql --version
   
   # Python version
   python --version
   pip list
   ```
4. Contact the development team with detailed information about your issue