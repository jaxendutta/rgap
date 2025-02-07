#!/usr/bin/env python3

import os
import sys
from pathlib import Path
import logging
from typing import Dict, Tuple, Optional, Any
import pandas as pd
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('database_import.log')
    ]
)
logger = logging.getLogger(__name__)

class DatabasePopulator:
    def __init__(self):
        self.load_environment()
        self.maps = {
            'recipient': {},
            'program': {},
            'organization': {}
        }
        self.conn = None
        self.cursor = None

    def load_environment(self) -> None:
        """Load environment variables from .env file"""
        env_path = Path(__file__).parents[1] / '.env'
        if not env_path.exists():
            raise FileNotFoundError(f"Environment file not found at {env_path}")
        
        load_dotenv(env_path)
        
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME'),
            'port': int(os.getenv('DB_PORT', 3306))
        }

        if not all(self.db_config.values()):
            raise ValueError("Missing required database configuration in .env file")

    def connect_db(self) -> None:
        """Establish database connection"""
        try:
            self.conn = mysql.connector.connect(**self.db_config)
            self.cursor = self.conn.cursor()
            logger.info("Successfully connected to the database")
        except Error as e:
            logger.error(f"Error connecting to MySQL: {e}")
            raise

    def close_db(self) -> None:
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.commit()
            self.conn.close()
            logger.info("Database connection closed")

    def load_data(self, csv_path: str) -> pd.DataFrame:
        """Load and prepare CSV data"""
        try:
            columns = [
                "ref_number", "amendment_number", "amendment_date", "agreement_type",
                "recipient_legal_name", "research_organization_name", "recipient_country", 
                "recipient_province", "recipient_city", "recipient_postal_code",
                "federal_riding_name_en", "federal_riding_name_fr", "federal_riding_number",
                "prog_name_en", "prog_name_fr", "prog_purpose_en", "prog_purpose_fr",
                "agreement_title_en", "agreement_title_fr", "agreement_number",
                "agreement_value", "foreign_currency_type", "foreign_currency_value",
                "agreement_start_date", "agreement_end_date", "description_en", "description_fr",
                "expected_results_en", "expected_results_fr", "owner_org", "owner_org_title", "org"
            ]
            
            df = pd.read_csv(
                csv_path,
                usecols=columns,
                dtype=str,
                low_memory=False
            )
            df.fillna("", inplace=True)
            logger.info(f"Successfully loaded {len(df)} records from CSV")
            return df
        except Exception as e:
            logger.error(f"Error loading CSV data: {e}")
            raise

    def insert_recipients(self, df: pd.DataFrame) -> None:
        """Insert recipients and build recipient mapping"""
        logger.info("Inserting recipients...")
        for _, row in df.iterrows():
            recipient_key = (
                row["recipient_legal_name"],
                row["research_organization_name"],
                row["recipient_country"],
                row["recipient_city"]
            )
            
            if recipient_key not in self.maps['recipient']:
                try:
                    self.cursor.execute("""
                        INSERT IGNORE INTO Recipient 
                        (legal_name, research_organization_name, country, province, city, 
                         postal_code, riding_name_en, riding_name_fr, riding_number)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        row["recipient_legal_name"], row["research_organization_name"],
                        row["recipient_country"], row["recipient_province"], row["recipient_city"],
                        row["recipient_postal_code"], row["federal_riding_name_en"],
                        row["federal_riding_name_fr"], row["federal_riding_number"]
                    ))
                    
                    self.cursor.execute("""
                        SELECT recipient_id FROM Recipient
                        WHERE legal_name = %s AND research_organization_name = %s
                              AND country = %s AND city = %s
                    """, recipient_key)
                    
                    recipient_id = self.cursor.fetchone()
                    if recipient_id:
                        self.maps['recipient'][recipient_key] = recipient_id[0]
                except Error as e:
                    logger.error(f"Error inserting recipient {recipient_key}: {e}")
                    raise

    def insert_programs(self, df: pd.DataFrame) -> None:
        """Insert programs and build program mapping"""
        logger.info("Inserting programs...")
        for _, row in df.iterrows():
            prog_id = row["prog_name_en"]
            
            if prog_id not in self.maps['program']:
                try:
                    self.cursor.execute("""
                        INSERT IGNORE INTO Program 
                        (prog_id, name_en, name_fr, purpose_en, purpose_fr)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        prog_id, row["prog_name_en"], row["prog_name_fr"],
                        row["prog_purpose_en"], row["prog_purpose_fr"]
                    ))
                    
                    self.cursor.execute(
                        "SELECT prog_id FROM Program WHERE prog_id = %s",
                        (prog_id,)
                    )
                    program_id = self.cursor.fetchone()
                    if program_id:
                        self.maps['program'][prog_id] = program_id[0]
                except Error as e:
                    logger.error(f"Error inserting program {prog_id}: {e}")
                    raise

    def insert_organizations(self, df: pd.DataFrame) -> None:
        """Insert organizations and build organization mapping"""
        logger.info("Inserting organizations...")
        for _, row in df.iterrows():
            owner_org = row["owner_org"]
            
            if owner_org not in self.maps['organization']:
                try:
                    self.cursor.execute("""
                        INSERT IGNORE INTO Organization 
                        (owner_org, org_title, abbreviation)
                        VALUES (%s, %s, %s)
                    """, (
                        owner_org, row["owner_org_title"], row["org"]
                    ))
                    
                    self.cursor.execute(
                        "SELECT owner_org FROM Organization WHERE owner_org = %s",
                        (owner_org,)
                    )
                    org_id = self.cursor.fetchone()
                    if org_id:
                        self.maps['organization'][owner_org] = org_id[0]
                except Error as e:
                    logger.error(f"Error inserting organization {owner_org}: {e}")
                    raise

    def insert_grants(self, df: pd.DataFrame) -> None:
        """Insert research grants"""
        logger.info("Inserting research grants...")
        for _, row in df.iterrows():
            try:
                recipient_key = (
                    row["recipient_legal_name"],
                    row["research_organization_name"],
                    row["recipient_country"],
                    row["recipient_city"]
                )
                recipient_id = self.maps['recipient'].get(recipient_key)
                program_id = self.maps['program'].get(row["prog_name_en"])
                owner_org = self.maps['organization'].get(row["owner_org"])
                
                agreement_value = float(row["agreement_value"]) if row["agreement_value"] else None
                
                self.cursor.execute("""
                    INSERT IGNORE INTO ResearchGrant 
                    (ref_number, amendment_number, amendment_date, agreement_type, 
                     agreement_number, agreement_value, foreign_currency_type, foreign_currency_value, 
                     agreement_start_date, agreement_end_date, agreement_title_en, agreement_title_fr, 
                     description_en, description_fr, expected_results_en, expected_results_fr, 
                     owner_org, recipient_id, prog_id)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    row["ref_number"], row["amendment_number"], row["amendment_date"],
                    row["agreement_type"], row["agreement_number"], agreement_value,
                    row["foreign_currency_type"], row["foreign_currency_value"],
                    row["agreement_start_date"], row["agreement_end_date"],
                    row["agreement_title_en"], row["agreement_title_fr"],
                    row["description_en"], row["description_fr"],
                    row["expected_results_en"], row["expected_results_fr"],
                    owner_org, recipient_id, program_id
                ))
            except Error as e:
                logger.error(f"Error inserting grant {row['ref_number']}: {e}")
                raise

    def populate_database(self, csv_path: str) -> None:
        """Main method to populate the database"""
        try:
            self.connect_db()
            df = self.load_data(csv_path)
            
            # Process each table
            self.insert_recipients(df)
            self.insert_programs(df)
            self.insert_organizations(df)
            self.insert_grants(df)
            
            logger.info("Database population completed successfully")
            
        except Exception as e:
            logger.error(f"Error during database population: {e}")
            raise
        finally:
            self.close_db()

def main():
    try:
        populator = DatabasePopulator()
        csv_path = Path(__file__).parents[1] / 'data' / 'tri_agency_grants_2019.csv'
        
        if not csv_path.exists():
            raise FileNotFoundError(f"CSV file not found at {csv_path}")
        
        populator.populate_database(str(csv_path))
        
    except Exception as e:
        logger.error(f"Script execution failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()