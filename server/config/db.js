// server/config/db.js
import { createPool } from "mysql2/promise";

// Database configuration
const dbConfig = {
    socketPath: process.env.MYSQL_SOCKET, // From setup_app.sh
    user: "rgap_user",
    password: "12345",
    database: "rgap",
    // Enable multiple statements for filter options query
    multipleStatements: true,
    // Better connection handling
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
};

console.log("Database config:", {
    ...dbConfig,
    password: "[REDACTED]",
});

export const pool = createPool(dbConfig);

// Test query to verify connection and data
async function verifyDatabaseSetup() {
    try {
        const [rows] = await pool.query(
            "SELECT COUNT(*) as count FROM ResearchGrant"
        );
        console.log(
            `Database connection verified: ${rows[0].count} grants found`
        );

        // Test a join query
        const [testJoin] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM ResearchGrant rg 
            JOIN Recipient r ON rg.recipient_id = r.recipient_id 
            JOIN Organization o ON rg.org = o.org 
            LIMIT 1
        `);
        console.log("Join query test successful");

        return true;
    } catch (err) {
        console.error("Database verification failed:", err);
        process.exit(1);
    }
}

// This will verify the database is properly set up on server start
verifyDatabaseSetup();
