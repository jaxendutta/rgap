#!/usr/bin/env node
// Refreshes the recipient_stats / institute_stats / global_trend_stats
// materialized views that the /recipients and /institutes list + detail pages
// (and their funding-trend charts) read from.
//
// The monthly pipeline (pipeline/fetch_and_load.py) already refreshes these
// after each load, so you normally don't need this. Run it for an ad-hoc data
// fix applied outside the pipeline, or to backfill after first deploying the
// 20260708160000 migration on a database whose data was loaded earlier.
//
// REFRESH ... CONCURRENTLY keeps the views readable while they rebuild and
// cannot run inside a transaction, so this uses an autocommit connection.

import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
try {
    await client.query("SET statement_timeout = '10min'");
    for (const view of ["recipient_stats", "institute_stats", "global_trend_stats"]) {
        const start = Date.now();
        process.stdout.write(`Refreshing ${view} (concurrently)... `);
        await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
        console.log(`done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
    }
} finally {
    await client.end();
}
