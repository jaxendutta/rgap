# RGAP MySQL Database Setup on Student Linux Server

> [!TIP]
> If you would like to run our application on your local machine, please refer to the [Local Preliminary Setup Guide](setup_prelim_local.md) for a walkthrough of how to run our application for Milestone 1.
> 
> This guide is for setting up the MySQL database on the student Linux server.

> [!IMPORTANT]
> Our code is housed on the `develop` branch. Please ensure you are on the 'develop' branch when following this guide!

## Get Started
Let's setup the virtual environment first! Run the following on the terminal:
```bash
source setup_env.sh
```

Unpack the compressed data file to get the data for populating the tables.

```bash
cd scripts/data
7z e data_2019.7z
cd ../..
```

## Run the Application

> [!IMPORTANT]
> Please ensure your local ports `3000`, `3030` and `7272` are not in use before running the application! If you're using VS Code, please head to the Ports tab and ensure these ports are not in use!

### Method 1: Docker Compose
Run the application using Docker Compose by running the following command:
```bash
./setup_app.sh
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
- Exit the MySQL Server
- Create a `.env` file in the `ROOT` folder with the necessary environment variables
- Populate the tables with data
- Run the MySQL Server
- Run the client
- Launch the application on `localhost:3000`

## Method 2: Manual Setup with some Automation
You can also run the application manually by following the steps below:

1. Install and Setup MySQL Server
    ```bash
    cd scripts
    ./mysql_setup.sh
    ```

    This script will:
      - Install MySQL Server for Ubuntu 20.04 LTS
      - Start the MySQL Server
      - Create a database named `rgap`
      - Create tables in the `rgap` database

2. Environment Variables
    Create a `.env` file in `ROOT` folder with the following content:
    ```bash
    DB_HOST=localhost
    DB_USER=rgap_user
    DB_PASSWORD=12345
    DB_NAME=rgap
    DB_PORT=7272
    PORT=3030
    ```

3. Populate the Tables
    ```bash
    # In the virtual environment
    python populate_tables.py
    ```

    This script will:
      - Populate the tables with data in the provided in the    `scripts/data/data_2019.csv` file

4. Run MySQL Server
    ```bash
    # Install dependencies
    cd ../server
    npm i

    # Run the server
    npm run dev

    # Access the application 
    curl http://localhost:3030
    ```

5. Run the Client
    ```bash
    # Install dependencies
    cd ../client
    npm i

    # Run the client
    npm run dev

    # Access the application
    curl http://localhost:3000
    ```

## Test the Application
You can now search for grants. For the purposes of this milestone, go through the following steps:

 - Click on the seach page
 - Type in the following:
   - `"kim"` in the recipients search bar
   - `"waterloo"` in the institutes search bar
 - Press the `Enter` key or click on the `Search` button
 - You should see a list of grants that have the substring `"kim"` in their recipient's legal name and  `"waterloo"` in their research organization/institute name
 - You may choose to try out the filters and sorting options as well, however they have not been extensively tested yet

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