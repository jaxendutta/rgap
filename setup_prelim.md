# RGAP MySQL Database Setup on Student Linux Server

> [!TIP]
> If you would like to run our application on your local machine, please refer to the [Local Preliminary Setup Guide](setup_prelim_local.md) for a walkthrough of how to run our application for Milestone 1.
> 
> This guide is for setting up the MySQL database on the student Linux server.

> [!IMPORTANT]
> Our code is housed on the `develop` branch. Please ensure you are on the 'develop' branch when following this guide!

1. Setup Virtual Environment
    ```bash
    source setup.sh
    ```

2. Setup MySQL
    ```bash
    cd scripts
    # Run mysql-rgap-stop if there is a MySQL Server running
    ./mysql_setup.sh
    ```

    This script will:
    - Install MySQL Server for Ubuntu 20.04 LTS
    - Start the MySQL Server
    - Create a database named `rgap`
    - Create tables in the `rgap` database
    - Populate the tables with data
    - Create a user named `rgap_user` with all privileges on the `rgap` database
    - Create a user named `rgap_user` with all privileges on the `rgap` database for all hosts
    - Flush privileges

3. Environment Variables
    Create a `.env` file in `ROOT` folder with the following content:
    ```bash
    DB_HOST=localhost
    DB_USER=rgap_user
    DB_PASSWORD=12345
    DB_NAME=rgap
    DB_PORT=7272
    PORT=3030
    ```

4. Populate the Tables
    ```bash
    # In the virtual environment
    python populate_tables.py
    ```

5. Run MySQL Server
    ```bash
    # Install dependencies
    cd ../server
    npm i

    # Run the server
    npm run dev

    # Access the application 
    curl http://localhost:3030
    ```

6. Run the Client
    ```bash
    # Install dependencies
    cd ../client
    npm i

    # Run the client
    npm run dev

    # Access the application
    curl http://localhost:3000
    ```

7. You can now search for grants. For the purposes of this milestone, go through the following steps:
    - Click on the seach page
    - Type in "waterloo" in the institutes search bar
    - Prss the `Enter` key
    - Click the `Search` button
    - You should see a list of grants that have the word "waterloo" in their research organization/institute name
  
    > [!CAUTION]
    > You must press Enter before clicking the search button!

## Alternative Accesses to Database Server

> [!TIP] 
> Please use this if you are unable to access the application through the frontend.

You can also test out our MySQL Server through API calls when it is running! Try running the following command in your terminal:
```bash
# Make sure the server is running by following the steps 1-6 above!
curl -X POST http://localhost:3030/search \ 
-H "Content-Type: application/json" \
-d '{"searchTerms":{"institute":"waterloo"},"filters":{},"sortConfig":{"field":"date","direction":"desc"}}'
```
This will return a list of grants that have the word "waterloo" in their institute name, sorted by date in descending order.