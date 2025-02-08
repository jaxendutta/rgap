# RGAP MySQL Database Setup on Student Linux Server

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
