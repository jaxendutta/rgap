# RGAP MySQL Database Setup on Local Machine
## 1. Install MySQL and Log in
## 2. Set up Database and User
```sql
CREATE DATABASE rgap;

CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'localhost';

CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;

```
## 3. Load the Database Schema
```bash
mysql -u rgap_user -p rgap < sql/schema.sql
```

## 4. Insert test data
1. Setup Virtual Environment
    ```bash
    source setup.sh
    ```

2. Populate the Tables
    ```bash
    # In the virtual environment
    cd scripts
    python populate_tables.py
    ```

## 5. Environment Variables
Create a `.env` file in `server/` folder with the following content:
```bash
DB_HOST=localhost
DB_USER=rgap_user
DB_PASSWORD=12345
DB_NAME=rgap_db
DB_PORT=3306
PORT=3000
```

## Run server
### 1. Install Dependencies
```bash
cd server
npm i
```
### 2. Run the server
```bash
npm run dev
``` 
or

```bash 
node index.js
```
### 3. Access the Application
Open your browser and go to `http://localhost:3000`.


## Run client
### 1. Install Dependencies
```bash
cd client
npm i
```
### 2. Run the client
```bash
npm run dev
```
### 3. Access the Application
Check the terminal to confirm the URL. The client is typically available at:
Open your browser and go to `http://localhost:5173`.
