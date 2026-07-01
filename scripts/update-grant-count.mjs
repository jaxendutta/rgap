#!/usr/bin/env node
// Updates GRANTS_COUNT_APPROX in src/constants/data.ts from the live grants
// count, rounded down to the nearest 1,000 (so "over X grants" stays true).
// Run after the monthly data pipeline completes successfully.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "..", "src", "constants", "data.ts");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();
const { rows } = await client.query("SELECT COUNT(*)::bigint AS count FROM grants");
await client.end();

const actualCount = Number(rows[0].count);
const roundedCount = Math.floor(actualCount / 1000) * 1000;

const contents = fs.readFileSync(dataFile, "utf8");
const pattern = /export const GRANTS_COUNT_APPROX: number = \d+;/;
if (!pattern.test(contents)) {
    console.error("Could not find GRANTS_COUNT_APPROX in src/constants/data.ts; not modified");
    process.exit(1);
}

const updated = contents.replace(
    pattern,
    `export const GRANTS_COUNT_APPROX: number = ${roundedCount};`
);

if (updated === contents) {
    console.log(`GRANTS_COUNT_APPROX is already ${roundedCount}; nothing to do`);
    process.exit(0);
}

fs.writeFileSync(dataFile, updated);
console.log(`Bumped GRANTS_COUNT_APPROX to ${roundedCount} (actual count: ${actualCount.toLocaleString()})`);
