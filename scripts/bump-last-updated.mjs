#!/usr/bin/env node
// Bumps LAST_UPDATED in src/constants/data.ts to today's date (UTC).
// Run after the monthly data pipeline completes successfully so the homepage
// reflects the real refresh date.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, "..", "src", "constants", "data.ts");

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const contents = fs.readFileSync(dataFile, "utf8");

const pattern = /export const LAST_UPDATED: Date = new Date\('[^']*'\);/;
if (!pattern.test(contents)) {
    console.error("Could not find LAST_UPDATED in src/constants/data.ts; not modified");
    process.exit(1);
}

const updated = contents.replace(
    pattern,
    `export const LAST_UPDATED: Date = new Date('${today}T00:00:00Z');`
);

if (updated === contents) {
    console.log(`LAST_UPDATED is already ${today}; nothing to do`);
    process.exit(0);
}

fs.writeFileSync(dataFile, updated);
console.log(`Bumped LAST_UPDATED to ${today}`);
