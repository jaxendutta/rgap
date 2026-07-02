#!/usr/bin/env python3
"""
Fetch the current tri-agency (NSERC/CIHR/SSHRC) grants dataset from the
Government of Canada's open data portal, preprocess it (cleaning,
standardization, amendment consolidation), and upsert it into the RGAP
Postgres database.

Designed to run unattended (GitHub Actions on a monthly schedule): it never
prompts for input and always re-fetches the full current dataset rather than
an incremental delta, because amendments can be filed against grants from any
past year at any time.

Usage:
    DATABASE_URL=postgresql://... python fetch_and_load.py
    DATABASE_URL=postgresql://... python fetch_and_load.py --dry-run
    python fetch_and_load.py --dry-run --save-csv processed.csv  # no DB needed
"""

import argparse
import concurrent.futures
import io
import json
import logging
import os
import sys
import time
from pathlib import Path

import pandas as pd
import psycopg2
import requests
import urllib3

from preprocessor import DataPreprocessor

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# The CKAN API is fetched with verify=False (matching the old fetcher.py),
# which otherwise logs a warning on every one of the ~260 paginated requests.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CKAN_BASE_URL = "https://open.canada.ca/data/api/action"
RESOURCE_ID = "1d15a62f-5656-49ad-8c88-f40ce689d831"
TRI_AGENCIES = {
    "nserc-crsng": "NSERC",
    "sshrc-crsh": "SSHRC",
    "cihr-irsc": "CIHR",
}

REPO_ROOT = Path(__file__).resolve().parent.parent
SEED_SQL_PATH = REPO_ROOT / "database" / "seeds" / "01-load-data.sql"
MIGRATIONS_DIR = REPO_ROOT / "database" / "migrations"

# The exact \copy line in 01-load-data.sql. We split the script on this marker:
# everything before it creates the staging table (run as-is), then we load the
# CSV ourselves via copy_expert (psql's \copy is a client meta-command that
# doesn't exist over a plain libpq/psycopg2 connection), then everything after
# it does the cleanup/normalization/upsert (also run as-is).
COPY_MARKER = "\\copy temp_grants FROM '/data/grants.csv' WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '');"

# Column order must match database/seeds/01-load-data.sql's temp_grants table
# exactly -- COPY matches columns positionally, not by name.
TEMP_GRANTS_COLUMNS = [
    "id", "ref_number", "latest_amendment_number", "amendment_date", "agreement_type",
    "recipient_type", "recipient_business_number", "recipient_legal_name",
    "recipient_operating_name", "research_organization_name", "recipient_country",
    "recipient_province", "recipient_city", "recipient_postal_code",
    "federal_riding_name_en", "federal_riding_name_fr", "federal_riding_number",
    "prog_name_en", "prog_name_fr", "prog_purpose_en", "prog_purpose_fr",
    "agreement_title_en", "agreement_title_fr", "agreement_number", "agreement_value",
    "foreign_currency_type", "foreign_currency_value", "agreement_start_date",
    "agreement_end_date", "coverage", "description_en", "description_fr",
    "naics_identifier", "expected_results_en", "expected_results_fr",
    "additional_information_en", "additional_information_fr", "org", "org_title",
    "year", "amendments_history",
]


def fetch_agency(agency: str, verify_ssl: bool = False) -> list:
    """Fetch every record for one tri-agency via the CKAN datastore_search API."""
    records = []
    offset = 0
    # CKAN's datastore_search on this instance accepts up to somewhere between
    # 10,000 and 20,000 per page (10,000 verified reliable; larger values were
    # rejected). 1,000 meant ~152 sequential requests just for NSERC; this cuts
    # that to ~16 and each request is also more efficient per-record.
    limit = 10000
    retries = 0
    while True:
        params = {
            "resource_id": RESOURCE_ID,
            "filters": json.dumps({"owner_org": agency}),
            "limit": limit,
            "offset": offset,
        }
        try:
            resp = requests.get(f"{CKAN_BASE_URL}/datastore_search", params=params, verify=verify_ssl, timeout=60)
            resp.raise_for_status()
            data = resp.json()
            if not data.get("success"):
                raise RuntimeError(data.get("error", {}).get("message", "Unknown CKAN API error"))
            batch = data["result"]["records"]
            if not batch:
                break
            records.extend(batch)
            offset += len(batch)
            retries = 0
            if len(batch) < limit:
                break
        except (requests.exceptions.Timeout, requests.exceptions.RequestException):
            retries += 1
            if retries > 3:
                raise
            time.sleep(2)
    logger.info(f"Fetched {len(records):,} records for {TRI_AGENCIES[agency]}")
    return records


def fetch_all() -> pd.DataFrame:
    """Fetch the current full dataset for all three tri-agencies in parallel."""
    all_records = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=len(TRI_AGENCIES)) as executor:
        futures = {executor.submit(fetch_agency, agency): agency for agency in TRI_AGENCIES}
        for future in concurrent.futures.as_completed(futures):
            all_records.extend(future.result())
    logger.info(f"Fetched {len(all_records):,} total raw records")
    return pd.DataFrame(all_records)


def to_temp_grants_csv(df: pd.DataFrame) -> io.StringIO:
    """Shape a preprocessed DataFrame into the exact column set/order/typing
    that the temp_grants staging table (01-load-data.sql) expects."""
    df = df.copy()
    for col in TEMP_GRANTS_COLUMNS:
        if col not in df.columns:
            df[col] = None
    df = df[TEMP_GRANTS_COLUMNS]

    # latest_amendment_number is a real INTEGER column in temp_grants (every
    # other column is TEXT), so it must render as clean integer text ("5"),
    # not pandas's float rendering ("5.0"), or COPY will reject the row.
    df["latest_amendment_number"] = pd.to_numeric(
        df["latest_amendment_number"], errors="coerce"
    ).astype("Int64")

    buf = io.StringIO()
    df.to_csv(buf, index=False, na_rep="")
    buf.seek(0)
    return buf


def load_into_postgres(csv_buf: io.StringIO, database_url: str, commit: bool = True) -> None:
    sql_text = SEED_SQL_PATH.read_text(encoding="utf-8")
    if COPY_MARKER not in sql_text:
        raise RuntimeError(
            "01-load-data.sql no longer contains the expected \\copy marker; "
            "update COPY_MARKER in fetch_and_load.py to match"
        )
    pre_sql, post_sql = sql_text.split(COPY_MARKER, 1)

    migration_files = sorted(MIGRATIONS_DIR.glob("*.sql"))

    conn = psycopg2.connect(database_url)
    try:
        with conn.cursor() as cur:
            # Supabase's connection-level default (2 minutes) is too tight
            # for a ~199K-row COPY plus the normalize/upsert step under
            # real-world variable load -- this failed a real run with
            # QueryCanceled on the COPY alone. 10 minutes leaves comfortable
            # headroom within the workflow's 30-minute job timeout.
            cur.execute("SET statement_timeout = '10min'")

            for migration_file in migration_files:
                logger.info(f"Applying migration {migration_file.name} (idempotent)...")
                cur.execute(migration_file.read_text(encoding="utf-8"))

            logger.info("Creating staging table...")
            cur.execute(pre_sql)

            logger.info("Loading CSV into staging table...")
            cur.copy_expert(
                "COPY temp_grants FROM STDIN WITH (FORMAT csv, HEADER true, DELIMITER ',', NULL '')",
                csv_buf,
            )

            logger.info("Normalizing and upserting into production tables...")
            cur.execute(post_sql)

        if commit:
            conn.commit()
            logger.info("Load complete (committed).")
        else:
            conn.rollback()
            logger.info("Dry run complete (rolled back, no changes kept).")
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description="Fetch, preprocess, and load the latest tri-agency grants dataset")
    parser.add_argument("--dry-run", action="store_true", help="Run the full load inside a transaction, then roll back")
    parser.add_argument("--save-csv", help="Also save the processed CSV to this path for inspection")
    parser.add_argument("--skip-load", action="store_true", help="Fetch and preprocess only; never touch the database")
    args = parser.parse_args()

    database_url = os.environ.get("DATABASE_URL")
    if not args.skip_load and not database_url:
        logger.error("DATABASE_URL environment variable is required (unless --skip-load is set)")
        sys.exit(1)

    logger.info("Fetching latest data from open.canada.ca...")
    raw_df = fetch_all()
    if raw_df.empty:
        logger.error("No records fetched; aborting without touching the database")
        sys.exit(1)

    logger.info("Preprocessing (cleaning, standardizing, consolidating amendments)...")
    preprocessor = DataPreprocessor(quiet=False)
    processed_df = preprocessor.preprocess_data(raw_df)
    logger.info(f"Processed dataset: {len(processed_df):,} rows (one per unique grant)")

    if args.save_csv:
        processed_df.to_csv(args.save_csv, index=False)
        logger.info(f"Saved processed dataset to {args.save_csv}")

    if args.skip_load:
        logger.info("--skip-load set; not touching the database")
        return

    csv_buf = to_temp_grants_csv(processed_df)
    load_into_postgres(csv_buf, database_url, commit=not args.dry_run)


if __name__ == "__main__":
    main()
