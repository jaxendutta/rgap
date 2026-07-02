#!/usr/bin/env node
// Re-resolves bookmarked_grants/recipients/institutes FKs against the
// stable-identity snapshot captured at bookmark time (ref_number+recipient+
// org for grants; legal_name+institute for recipients; name+city+country
// for institutes). recipient_id/institute_id/grant_id are surrogate keys
// built from exact-match fields, so if the underlying source data shifts
// between pipeline runs (or after a truncate+reload), the old FK can point
// at nothing meaningful -- this finds the row that now matches the
// snapshotted identity and re-points the bookmark at it.
//
// Safe to run repeatedly (only updates rows where the resolved id actually
// differs) and safe against bookmarks with no snapshot yet (older rows,
// before this existed) -- those are simply left untouched, matching
// current behavior.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
}

const client = new pg.Client({ connectionString: databaseUrl });
await client.connect();

async function reconcile(label, sql) {
    const res = await client.query(sql);
    console.log(`${label}: ${res.rowCount} bookmark(s) re-pointed`);
}

await reconcile(
    "bookmarked_grants",
    `UPDATE bookmarked_grants bg
     SET grant_id = correct.grant_id
     FROM (
         SELECT g.grant_id, g.ref_number, r.legal_name AS recipient_legal_name, g.org
         FROM grants g JOIN recipients r ON g.recipient_id = r.recipient_id
     ) correct
     WHERE bg.ref_number IS NOT NULL
       AND bg.ref_number = correct.ref_number
       AND bg.recipient_legal_name = correct.recipient_legal_name
       AND bg.org = correct.org
       AND bg.grant_id != correct.grant_id`
);

await reconcile(
    "bookmarked_recipients",
    `UPDATE bookmarked_recipients br
     SET recipient_id = correct.recipient_id
     FROM (
         SELECT r.recipient_id, r.legal_name,
                i.name AS institute_name, i.city AS institute_city, i.country AS institute_country
         FROM recipients r LEFT JOIN institutes i ON r.institute_id = i.institute_id
     ) correct
     WHERE br.recipient_legal_name IS NOT NULL
       AND br.recipient_legal_name = correct.legal_name
       AND br.institute_name IS NOT DISTINCT FROM correct.institute_name
       AND br.institute_city IS NOT DISTINCT FROM correct.institute_city
       AND br.institute_country IS NOT DISTINCT FROM correct.institute_country
       AND br.recipient_id != correct.recipient_id`
);

await reconcile(
    "bookmarked_institutes",
    `UPDATE bookmarked_institutes bi
     SET institute_id = correct.institute_id
     FROM institutes correct
     WHERE bi.institute_name IS NOT NULL
       AND bi.institute_name = correct.name
       AND bi.institute_city IS NOT DISTINCT FROM correct.city
       AND bi.institute_country = correct.country
       AND bi.institute_id != correct.institute_id`
);

await client.end();
