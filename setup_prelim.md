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

3. Environment Variables
    Create a `.env` file in `server/` folder with the following content:
    ```bash
    DB_HOST=localhost
    DB_USER=rgap_user
    DB_PASSWORD=12345
    DB_NAME=rgap_db
    DB_PORT=3306
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
