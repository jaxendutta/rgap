// server/config/db.js
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Debug connection info
console.log('Database Configuration:');
console.log({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'rgap_user',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'rgap',
    port: parseInt(process.env.DB_PORT || '7272'),
    socketPath: process.env.MYSQL_SOCKET || path.join(process.env.HOME, 'cs348/rgap/mysql/run/mysql.sock')
});

const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'rgap_user',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'rgap',
    port: parseInt(process.env.DB_PORT || '7272'),
    socketPath: process.env.MYSQL_SOCKET || path.join(process.env.HOME, 'cs348/rgap/mysql/run/mysql.sock'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.query('SELECT 1')
    .then(() => console.log('Database connection successful!'))
    .catch(err => console.error('Database connection failed:', err));

module.exports = pool;