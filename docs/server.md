
# Local MySQL Database Setup

## 1. Install MySQL and Log in
The `mysqlclient` package is installed when the environment is set up using `source setup.sh`. You can try installing it again using:
```bash
pip install mysqlclient
```

To log in, run:
```bash
mysql -u root -p
```

You will be prompted to put in the password. This has been set to `12345`.


## 2. Set up Database and User
```sql
CREATE DATABASE rgap_db;

CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';

GRANT ALL PRIVILEGES ON rgap_db.* TO 'rgap_user'@'localhost';

FLUSH PRIVILEGES;
```

## 3. Load the Database Schema
```bash
mysql -u rgap_user -p rgap_db < ../sql/schema.sql
```

## 4. Insert test data
```sql
USE rgap_db;
INSERT INTO Institutions (name, province, type) VALUES ('University of Waterloo', 'Ontario', 'university');
```

## 5. Environment Variables
Create a `.env` file in `server/` folder with the following content:
```bash
DB_HOST=localhost
DB_USER=rgap_user
DB_PASSWORD=12345
DB_NAME=rgap_db
PORT=3000
```

# Run server
## 1. Install Dependencies
```bash
cd server
npm i
```
## 2. Run the server
```bash
node index.js
```
## 3. Access the Application
Open your browser and go to `http://localhost:3000`.

## 4. Test query
Go to `http://localhost:3000/test-query`.