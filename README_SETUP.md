
### Local MySQL Database Setup

#### 1. Install MySQL and Log in
#### 2. Set up Database and User
```sql
CREATE DATABASE rgap_db;

CREATE USER 'rgap_user'@'localhost' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap_db.* TO 'rgap_user'@'localhost';

CREATE USER 'rgap_user'@'%' IDENTIFIED BY '12345';
GRANT ALL PRIVILEGES ON rgap_db.* TO 'rgap_user'@'%';

FLUSH PRIVILEGES;

```
#### 3. Load the Database Schema
```bash
mysql -u rgap_user -p rgap_db < sql/schema.sql
```

#### 4. Insert test data
```sql
USE rgap_db;
INSERT INTO Institutions (name, province, type) VALUES ('University of Waterloo', 'Ontario', 'university');
```

#### 5. Environment Variables
Create a `.env` file in `server/` folder with the following content:
```bash
DB_HOST=localhost
DB_USER=rgap_user
DB_PASSWORD=12345
DB_NAME=rgap_db
DB_PORT=3306
PORT=3000
```

### Run server
#### 1. Install Dependencies
```bash
cd server
npm i
```
#### 2. Run the server
```bash
npm run dev
``` 
or

```bash 
node index.js
```
#### 3. Access the Application
Open your browser and go to `http://localhost:3000`.


### Run client
#### 1. Install Dependencies
```bash
cd client
npm i
```
#### 2. Run the client
```bash
npm run dev
```
#### 3. Access the Application
Open your browser and go to `http://localhost:5173`.



### Run Server and Client with Docker
#### 1. Install Docker and Docker Compose
#### 2.  Create an .env File
Create a `.env` file in project root folder with the following content:
```
MYSQL_USER=rgap_user
MYSQL_PASSWORD=12345
MYSQL_DATABASE=rgap_db
MYSQL_ROOT_PASSWORD=12345
```

#### 3. Start the Server and Client
```bash
docker compose up -d
```
#### 4. Access the Application
Server (API): `http://localhost:3000`

Client (Frontend): `http://localhost:5173`

#### 5. Stop the Container
```bash
docker compose down
```
