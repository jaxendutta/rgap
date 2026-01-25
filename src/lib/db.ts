import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Singleton pattern for database connection pool
class Database {
    private static instance: Database;
    private pool: Pool;

    private constructor() {
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            // Use 1 connection per lambda in prod (serverless), 20 in dev
            max: process.env.NODE_ENV === 'production' ? 1 : 20,
            idleTimeoutMillis: 30000,
            // Increase from 2000 to 10000 milliseconds to survive "cold starts"
            connectionTimeoutMillis: 10000,
        });

        // Handle pool errors
        this.pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    // Execute a query
    public async query<T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<QueryResult<T>> {
        const start = Date.now();
        try {
            const result = await this.pool.query<T>(text, params);
            const duration = Date.now() - start;

            if (process.env.NODE_ENV === 'development') {
                console.log('Executed query', { text, duration, rows: result.rowCount });
            }

            return result;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Get a client from the pool for transactions
    public async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    // Close the pool
    public async end(): Promise<void> {
        await this.pool.end();
    }
}

// Export singleton instance
export const db = Database.getInstance();

// Helper function for transactions
export async function transaction<T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> {
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}