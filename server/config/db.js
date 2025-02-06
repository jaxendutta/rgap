const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

/*
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USER);  
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
*/

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});


module.exports = db;
