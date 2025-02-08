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

2. Install MySQL
    ```bash
    cd scripts
    # Run mysql-rgap-stop if there is a MySQL Server running
    ./mysql_setup.sh
    ```

3. Access the MySQL Server Shell and Create a User
    ```bash
    # In the virtual environment
    mysql-rgap -u root rgap
    ```

    ```sql
    # In the MySQL Shell
    CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
    GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost';

    CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';
    GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'%';

    FLUSH PRIVILEGES;
    exit;
    ```

4. Environment Variables
    Create a `.env` file in `ROOT` folder with the following content:
    ```bash
    DB_HOST=localhost
    DB_USER=rgap_user
    DB_PASSWORD=12345
    DB_NAME=rgap
    DB_PORT=7272
    PORT=3030
    ```

5. Populate the Tables
    ```bash
    # In the virtual environment
    python populate_tables.py
    ```

6. Run MySQL Server
    ```bash
    # Install dependencies
    cd ../server
    npm i

    # Run the server
    npm run dev

    # Access the application 
    curl http://localhost:3030
    ```

7. Run the Client
    ```bash
    # Install dependencies
    cd ../client
    npm i

    # Run the client
    npm run dev

    # Access the application
    curl http://localhost:3000
    ```

> [!TIP]  
> You can also test out our MySQL Server through API calls when it is running! Try running the following command in your terminal:
> ```bash
> # Make sure the server is running by following the steps 1-6 above!
> curl -X POST http://localhost:3030/search \ 
> -H "Content-Type: application/json" \
> -d '{"searchTerms":{"institute":"waterloo"},"filters":{},"sortConfig":{"field":"date","direction":"desc"}}'
> ```
> This will return a list of grants that have the word "waterloo" in their institute name, sorted by date in descending order.