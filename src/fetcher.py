import pandas as pd
import numpy as np
import requests
from typing import Dict, Optional
from pathlib import Path
import logging
import argparse
import urllib3
from tqdm import tqdm
import json
import time
import os
import glob
import signal
import sys
from datetime import datetime
import concurrent.futures
import subprocess
import gzip
import tempfile
from IPython.display import display

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Create a custom tqdm subclass with thousands separator formatting
class ThousandsSeparatorTqdm(tqdm):
    """Custom tqdm subclass that formats the total with thousands separators."""
    @property
    def format_dict(self):
        d = super().format_dict
        total = d.get('total', 0)
        if total:
            d['total_fmt'] = f"{total:,}"
        return d

class FetcherConfig:
    """Configuration for the Fetcher class"""
    # Dataset identifiers from the URL
    dataset_id = "432527ab-7aac-45b5-81d6-7597107a7013"
    resource_id = "1d15a62f-5656-49ad-8c88-f40ce689d831"
    
    # Base URLs for API access
    base_url = "https://open.canada.ca/data/api/action"
    
    # Agency information
    tri_agencies = ["cihr-irsc", "nserc-crsng", "sshrc-crsh"]

    def __init__(self, verbose=False):
        self.verbose = verbose
        # Map agencies to their codes
        self.orgs = {
            'nserc-crsng': 'NSERC',
            'sshrc-crsh': 'SSHRC',
            'cihr-irsc': 'CIHR'
        }
        
        # Dynamically find the project root
        self.ROOT = self.find_project_root()

    def find_project_root(self):
        """Find the project root by looking for the setup.py file"""
        current_path = Path(__file__).resolve()
        for parent in current_path.parents:
            if (parent / 'setup.py').exists():
                return parent
            
        # Fallback to 3 directories up if setup.py not found
        return current_path.parents[2]

class Fetcher:
    """Class for fetching and processing tri-agency grant data"""
    
    def __init__(self, config: Optional[FetcherConfig] = None):
        """Initialize the Fetcher with optional custom configuration"""
        self.config = config or FetcherConfig()
        self._setup_directories()
        self.timestamp = time.strftime("%Y%m%d_%H%M%S")
        self.metadata_file = self.production_dir / "dataset_metadata.json"
        self._setup_signal_handlers()
        self.interrupted = False
        
    def _setup_signal_handlers(self):
        """Set up graceful exit handlers"""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
    def _signal_handler(self, sig, frame):
        """Handle termination signals gracefully"""
        print("\n\n📢 Received termination signal. Cleaning up...")
        self.interrupted = True
        print("✓ You can safely re-run the command later to resume where you left off.")
        sys.exit(0)
        
    def _print(self, *args, **kwargs) -> None:
        """Print a message if verbose mode is enabled"""
        if self.config.verbose:
            print(*args, **kwargs)
    
    def _setup_directories(self) -> None:
        """Set up necessary directories for data storage"""
        self.data_dir = self.config.ROOT / 'data'
        self.raw_dir = self.data_dir / "raw"
        self.production_dir = self.data_dir / "production"
        self.sample_dir = self.data_dir / "sample"
               
        for dir_path in [self.data_dir, self.raw_dir, self.production_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
            
    def _save_metadata(self, metadata: Dict) -> None:
        """Save metadata about the dataset"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
    def _load_metadata(self) -> Dict:
        """Load metadata about the dataset"""
        if not self.metadata_file.exists():
            return {}
        
        try:
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        except:
            return {}
    
    def _check_dataset_update(self, verify_ssl: bool = False) -> Dict:
        """Check if the dataset has been updated since our last download"""
        try:
            # Get package info from API
            api_url = f"{self.config.base_url}/package_show"
            params = {"id": self.config.dataset_id}
            
            print(f"Checking dataset updates... ", end="", flush=True)
            response = requests.get(api_url, params=params, verify=verify_ssl, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            if not data.get('success'):
                print("❌ Error")
                self._print(f"API Error checking dataset: {data.get('error', {}).get('message', 'Unknown error')}")
                return {}
                
            package_info = data['result']
            
            # Extract the last modified date
            metadata_modified = package_info.get('metadata_modified', '')
            print("✅ Done")
            
            return {
                'metadata_modified': metadata_modified,
                'dataset_id': self.config.dataset_id,
                'resource_id': self.config.resource_id
            }
            
        except requests.exceptions.Timeout:
            print("❌ Timeout")
            self._print("Timeout checking dataset updates. Check your internet connection.")
            return {}
        except Exception as e:
            print("❌ Error")
            self._print(f"Error checking dataset update: {str(e)}")
            return {}
    
    def _get_latest_dataset_file(self) -> Optional[Path]:
        """Find the most recent dataset file"""
        pattern = str(self.production_dir / "data_*.csv")
        files = glob.glob(pattern)
        
        if not files:
            # Also check for compressed files
            pattern_gz = str(self.production_dir / "data_*.csv.gz")
            pattern_7z = str(self.production_dir / "data_*.7z")
            files = glob.glob(pattern_gz) + glob.glob(pattern_7z)
            if not files:
                return None
            
        # Sort by modification time (newest first)
        latest_file = max(files, key=os.path.getctime)
        return Path(latest_file)
        
    def _compress_file(self, file_path: Path, method: str = 'gzip') -> Path:
        """
        Compress the given file using the specified compression method.
        
        Args:
            file_path: Path to the file to compress
            method: Compression method ('gzip' or '7z')
        
        Returns:
            Path to the compressed file
        """
        if method == '7z':
            try:
                # Try to use 7zip if available
                compressed_path = file_path.with_suffix('.7z')
                print(f"Compressing file with 7z: {file_path.name} -> {compressed_path.name}")
                print("This may take a while but will result in better compression...")
                
                # Check if 7z command is available
                try:
                    subprocess.run(['7z', '--help'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
                except FileNotFoundError:
                    print("7z command not found. Please install p7zip and try again.")
                    print("Falling back to gzip compression...")
                    return self._compress_file(file_path, 'gzip')
                
                # Run 7z with progress display
                process = subprocess.Popen(
                    ['7z', 'a', '-mx=9', str(compressed_path), str(file_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                
                # Show a simple progress indicator
                print("Compressing: ", end="")
                while process.poll() is None:
                    print(".", end="", flush=True)
                    time.sleep(1)
                print(" Done!")
                
                if process.returncode == 0:
                    orig_size = file_path.stat().st_size
                    comp_size = compressed_path.stat().st_size
                    reduction = (1 - comp_size/orig_size) * 100
                    print(f"✓ Compressed {file_path.name} from {orig_size/1024/1024:.1f}MB to {comp_size/1024/1024:.1f}MB ({reduction:.1f}% reduction)")
                    
                    # Optionally remove the original file to save space
                    # os.remove(file_path)
                    # print(f"Removed original uncompressed file: {file_path.name}")
                    
                    return compressed_path
                else:
                    print("7z compression failed. Falling back to gzip...")
                    return self._compress_file(file_path, 'gzip')
                    
            except Exception as e:
                print(f"Error with 7z compression: {e}")
                print("Falling back to gzip compression...")
                return self._compress_file(file_path, 'gzip')
        else:
            # Default to gzip
            try:
                # Try gzip as it's most commonly available
                compressed_path = file_path.with_suffix('.csv.gz')
                
                print(f"==> Compressing file with gzip: {file_path.name} -> {compressed_path.name}")
                
                with open(file_path, 'rb') as f_in:
                    with gzip.open(compressed_path, 'wb') as f_out:
                        with ThousandsSeparatorTqdm(
                            total=os.path.getsize(file_path), 
                            unit='B', 
                            unit_scale=True, 
                            desc="Compressing", 
                            bar_format='{desc}: {percentage:3.0f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]'
                        ) as pbar:
                            while chunk := f_in.read(1024*1024):  # 1MB chunks
                                f_out.write(chunk)
                                pbar.update(len(chunk))
                        
                # Check compression success
                if compressed_path.exists():
                    orig_size = file_path.stat().st_size
                    comp_size = compressed_path.stat().st_size
                    reduction = (1 - comp_size/orig_size) * 100
                    print(f"✅ Compressed {file_path.name} from {orig_size/1024/1024:.1f}MB to {comp_size/1024/1024:.1f}MB ({reduction:.1f}% reduction)")
                    
                    # Optionally remove the original file to save space
                    # os.remove(file_path)
                    # print(f"Removed original uncompressed file: {file_path.name}")
                    
                    return compressed_path
                    
            except ImportError:
                print("⚠️ Compression libraries not available, skipping compression")
                
            # If we get here, compression failed or wasn't available
            return file_path

    def is_likely_institution(self, name):
        """
        Check if a recipient name likely refers to an institution based on keywords.
        
        Args:
            name: The recipient name to check
            
        Returns:
            bool: True if the name appears to be an institution, False otherwise
        """
        if not name or not isinstance(name, str):
            return False
            
        # Convert to lowercase for case-insensitive matching
        name_lower = name.lower()
        
        # English and French keywords that suggest an institution
        institution_keywords = [
            'university', 'université', 'univ.', 'univ ',
            'college', 'collège', 'coll.',
            'institute', 'institut', 'inst.',
            'school', 'école', 'ecole',
            'academy', 'académie', 'academie',
            'cegep', 'cégep',
            'polytechnique', 'polytechnic',
            'research centre', 'centre de recherche',
            'laboratory', 'laboratoire', 'lab ',
            'hospital', 'hôpital', 'hopital',
            'foundation', 'fondation',
            'center', 'centre',
            'council', 'conseil'
        ]
        
        # Check if any of the keywords are in the name
        for keyword in institution_keywords:
            if keyword in name_lower:
                return True
                
        return False

    def fix_missing_research_organizations(self, df):
        """
        Fix missing research_organization_name entries by using the recipient name 
        when it appears to be an institution.
        
        Args:
            df: DataFrame with grant data
            
        Returns:
            DataFrame with fixed research_organization_name values
        """
        # Make a copy to avoid modifying the input
        df_fixed = df.copy()
        
        # Define the recipient and research org column names
        recipient_col = 'recipient_legal_name'
        research_org_col = 'research_organization_name'
        
        # Check if required columns exist
        if recipient_col not in df_fixed.columns:
            print(f"Warning: '{recipient_col}' column not found, skipping fix.")
            return df_fixed
            
        if research_org_col not in df_fixed.columns:
            print(f"Warning: '{research_org_col}' column not found, skipping fix.")
            return df_fixed
        
        # Count missing research organization names before fix
        missing_before = df_fixed[research_org_col].isna().sum()
        
        # Find rows where research_organization_name is missing but recipient_legal_name exists
        # and the recipient name likely refers to an institution
        mask = (
            df_fixed[research_org_col].isna() & 
            df_fixed[recipient_col].notna() & 
            df_fixed[recipient_col].apply(self.is_likely_institution)
        )
        
        # For these rows, set research_organization_name to recipient_legal_name
        if mask.any():
            df_fixed.loc[mask, research_org_col] = df_fixed.loc[mask, recipient_col]
            
            # Count fixed entries
            fixed_count = mask.sum()
            missing_after = df_fixed[research_org_col].isna().sum()
            
            print(f"✓ Fixed {fixed_count} missing research organization names")
            print(f"  - Missing before: {missing_before}")
            print(f"  - Missing after: {missing_after}")
            print(f"  - Improvement: {missing_before - missing_after} entries ({(fixed_count / missing_before * 100):.1f}% of missing entries)")
        else:
            print("No missing research organization names that could be fixed.")
        
        return df_fixed

    def _fetch_data_via_api(self, force_refresh: bool = False, verify_ssl: bool = False) -> pd.DataFrame:
        """
        Fetch all tri-agency data using the CKAN API with pagination.
        
        Args:
            force_refresh: If True, fetch fresh data regardless of existing files
            verify_ssl: Whether to verify SSL certificates
        """
        # Check if we should use an existing file
        if not force_refresh:
            latest_file = self._get_latest_dataset_file()
            if latest_file and latest_file.exists():
                print(f"==> Using existing dataset file: {latest_file}")
                try:
                    # Check if it's a compressed file
                    if latest_file.suffix == '.gz':
                        print("    --> Reading compressed CSV file...")
                        return pd.read_csv(latest_file, compression='gzip', low_memory=False)
                    elif latest_file.suffix == '.7z':
                        print("    --> Reading 7z compressed file...")
                        # Need to extract it first
                        with tempfile.TemporaryDirectory() as tmpdirname:
                            subprocess.run(['7z', 'e', str(latest_file), f'-o{tmpdirname}', '-y'], 
                                        stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                            # Find the extracted CSV file
                            csv_files = glob.glob(f"{tmpdirname}/*.csv")
                            if csv_files:
                                return pd.read_csv(csv_files[0], low_memory=False)
                            else:
                                print("⚠️ No CSV file found in 7z archive")
                                print("--> Attempting to fetch fresh data instead...")
                    else:
                        return pd.read_csv(latest_file, low_memory=False)
                except Exception as e:
                    print(f"⚠️ Error reading existing file: {str(e)}")
                    print(f"--> Attempting to fetch fresh data instead...")
        
        print("==> Fetching complete tri-agency dataset via API...")
        
        # Check if dataset has been updated since our last download
        dataset_info = self._check_dataset_update(verify_ssl)
        current_metadata = self._load_metadata()
        
        # Compare the modification dates
        dataset_updated = True
        if current_metadata.get('metadata_modified') == dataset_info.get('metadata_modified'):
            print("📢 DATASET STATUS: Not modified since last download!")
            dataset_updated = False
            if not force_refresh:
                print("Use --force-refresh to download anyway")
        else:
            print("📢 DATASET STATUS: Dataset has been updated since last download!")
        
        api_url = f"{self.config.base_url}/datastore_search"
        agencies = self.config.tri_agencies
        
        # Store completed progress bars to avoid updating them
        completed_pbars = {}
        all_agency_data = {}
        
        # Helper function to fetch data for a single agency
        def fetch_agency_data(agency):
            """Helper function to fetch data for a single agency"""
            if self.interrupted:
                return []
                
            # This prevents output from overwriting progress bars
            position = agencies.index(agency)
            
            offset = 0
            limit = 1000  # Max records per request
            total_records = None
            agency_records = []
            
            # Initialize the progress bar with better formatting and fixed positions
            pbar = ThousandsSeparatorTqdm(
                desc=f"Fetching {self.config.orgs[agency]} grants", 
                unit="records", 
                position=position,
                leave=True,  # Leave the progress bars on screen
                dynamic_ncols=True,
                bar_format='{desc}: {n:,}/{total_fmt} {bar} [{elapsed}<{remaining}, {rate_fmt}]')
            
            # Store progress bar for later
            completed_pbars[agency] = pbar

            retry_count = 0
            max_retries = 3
            
            while True:
                if self.interrupted:
                    pbar.close()
                    return []
                    
                # Prepare request data
                params = {
                    "resource_id": self.config.resource_id,
                    "filters": json.dumps({"owner_org": agency}),
                    "limit": limit,
                    "offset": offset
                }
                
                try:
                    # Make the API request with timeout
                    response = requests.get(api_url, params=params, verify=verify_ssl, timeout=60)
                    response.raise_for_status()
                    
                    # Parse the response
                    data = response.json()
                    
                    if not data.get('success'):
                        # Instead of printing here which could disrupt other progress bars,
                        # store error to display later
                        all_agency_data[agency] = {'error': data.get('error', {}).get('message', 'Unknown error')}
                        break
                    
                    # Get the records from the response
                    records = data['result']['records']
                    
                    if not records:
                        break  # No more records
                    
                    # Initialize progress bar if this is the first batch
                    if total_records is None and 'total' in data['result']:
                        total_records = data['result']['total']
                        pbar.total = total_records
                        pbar.refresh()
                    
                    # Update progress bar
                    pbar.update(len(records))
                    
                    # Add records to agency collection
                    agency_records.extend(records)
                    
                    # Move to the next page
                    offset += len(records)
                    
                    # Reset retry counter on success
                    retry_count = 0
                    
                    # Break if we got fewer records than the limit (last page)
                    if len(records) < limit:
                        break
                        
                except (requests.exceptions.Timeout, requests.exceptions.RequestException) as e:
                    retry_count += 1
                    if retry_count <= max_retries:
                        # Instead of printing directly, store error for later display
                        time.sleep(2)  # Add delay before retry
                        continue
                    else:
                        # Store error message for later display
                        all_agency_data[agency] = {'error': f"Max retries exceeded: {str(e)}"}
                        break
            
            # Instead of closing the progress bar, update it to 100% if needed
            if pbar.total is not None and pbar.n < pbar.total:
                pbar.update(pbar.total - pbar.n)  # Force to 100%
                
            # Don't print completion message here, wait until all are done
            return agency_records
        
        # Process all agencies in parallel
        all_records = []
        
        print(f"\n==> Fetching data for {len(agencies)} agencies in parallel...")
        
        # Parallel execution of data fetching
        with concurrent.futures.ThreadPoolExecutor(max_workers=len(agencies)) as executor:
            future_to_agency = {executor.submit(fetch_agency_data, agency): agency for agency in agencies}
            
            # Process results as they complete but don't print anything yet
            for future in concurrent.futures.as_completed(future_to_agency):
                agency = future_to_agency[future]
                try:
                    agency_records = future.result()
                    all_records.extend(agency_records)
                    # Store results instead of printing
                    all_agency_data[agency] = {'records': agency_records}
                except Exception as exc:
                    # Store exception instead of printing
                    all_agency_data[agency] = {'error': str(exc)}
        
        # Wait for 2 seconds before proceeding
        time.sleep(2)

        # All progress bars are complete, now print newlines to separate from progress bars
        print("\n\n")
        
        # Now print all completion messages at once
        for agency in agencies:
            data = all_agency_data.get(agency, {})
            if 'error' in data:
                print(f"❌ Error fetching {self.config.orgs[agency]}: {data['error']}")
            elif 'records' in data:
                records = data['records']
                print(f"✓ Retrieved {len(records):,} records for {self.config.orgs[agency]}")
            else:
                print(f"⚠️ No data received for {self.config.orgs[agency]}")
        
        # Close all progress bars
        for pbar in completed_pbars.values():
            pbar.close()
            
        # Convert records to DataFrame
        if all_records:
            total_count = len(all_records)
            print(f"\n==> Processing {total_count:,} records across all agencies...")
            
            # Create DataFrame
            df = pd.DataFrame(all_records)
            
            # Add the 'org' column with uppercase English version of owner_org
            if 'owner_org' in df.columns:
                df['owner_org'] = df['owner_org'].map(self.config.orgs)
            
            # Rename owner_org_title to org_title if it exists
            if 'owner_org_title' in df.columns:
                df.rename(columns={'owner_org': 'org', 'owner_org_title': 'org_title'}, inplace=True)

            if 'research_organization_name' in df.columns:
                # First replace with spaces on both sides
                df['research_organization_name'] = df['research_organization_name'].str.replace(
                    r'\s*([|/\\])\s*', r' \1 ', regex=True)
                
                # Then clean up any double spaces that might have been created
                df['research_organization_name'] = df['research_organization_name'].str.replace(
                    r'\s{2,}', ' ', regex=True)
                
                # Trim leading and trailing whitespace
                df['research_organization_name'] = df['research_organization_name'].str.strip()

            if 'recipient_city' in df.columns:
                # First apply title case to all city names
                df['recipient_city'] = df['recipient_city'].str.title()
                
                # Fix apostrophes (capitalize letter after apostrophe EXCEPT for possessive 's)
                df['recipient_city'] = df['recipient_city'].str.replace(
                    r"'(\w)(?!\s|$)", lambda m: "'" + m.group(1).upper(), regex=True)
                
                # Fix possessive 's to ensure it stays lowercase
                df['recipient_city'] = df['recipient_city'].str.replace(r"'S\b", "'s", regex=True)
                
                # Ensure hyphenated parts are all capitalized
                df['recipient_city'] = df['recipient_city'].str.replace(
                    r"-(\w)", lambda m: "-" + m.group(1).upper(), regex=True)# Add the 'year' column from agreement_start_date

            if 'agreement_start_date' in df.columns:
                df['year'] = df['agreement_start_date'].str.extract(r'^(\d{4})')
            else:
                print("Warning: 'agreement_start_date' column not found")
                df['year'] = None
            
            # NEW: Fix missing research organization names
            print("\n==> Checking for and fixing missing research organization names...")
            df = self.fix_missing_research_organizations(df)
            
            # Print dataset modification status again for clarity
            if dataset_updated:
                print("  📢 DATASET STATUS: Processing updated dataset from the server")
            else:
                print("  📢 DATASET STATUS: Processing fresh download of dataset (not modified since last fetch)")
            
            # Save the complete dataset with timestamp
            master_file = self.production_dir / f"data_{self.timestamp}.csv"
            print(f"  ==> Saving dataset to {master_file}...")
            df.to_csv(master_file, index=False)
            print(f"      ✓ Saved: {master_file}")
            
            # Try to compress the file
            try:
                compressed_file = self._compress_file(master_file, '7z')  # Try 7z first
                if compressed_file != master_file:
                    print(f"  ✓ Compressed master dataset: {compressed_file.name}")
            except Exception as e:
                print(f"  ⚠️ Compression failed: {e}")
            
            # Save metadata
            metadata = {
                'timestamp': self.timestamp,
                'record_count': len(df),
                'metadata_modified': dataset_info.get('metadata_modified', ''),
                'dataset_id': self.config.dataset_id,
                'resource_id': self.config.resource_id,
                'file_path': str(master_file),
                'last_updated': datetime.now().isoformat()
            }
            self._save_metadata(metadata)
            
            return df
        else:
            print("⚠️ No records found")
            return pd.DataFrame()
    
    def fetch_all_orgs(self, 
                      year_start: int,
                      year_end: int = None,
                      verify_ssl: bool = False,
                      force_refresh: bool = False) -> pd.DataFrame:
        """
        Fetch data for all tri-agencies across a range of years.
        This loads from the master dataset and filters in memory.
        
        Args:
            year_start: Start year (inclusive)
            year_end: End year (inclusive), defaults to start_year if None
            verify_ssl: Whether to verify SSL certificate
            force_refresh: If True, force a fresh data collection
        """
        # If year_end not provided, use year_start
        if year_end is None:
            year_end = year_start
            
        # Ensure years are in proper order
        year_start, year_end = min(year_start, year_end), max(year_start, year_end)
        
        print(f'🚚 Starting tri-agency data fetch for {year_start}-{year_end}... ')
        
        # Fetch or load the master dataset
        master_df = self._fetch_data_via_api(force_refresh=force_refresh, verify_ssl=verify_ssl)
        
        if master_df.empty:
            print("⚠️ Failed to retrieve data")
            return master_df
        
        # Filter by year range in memory
        if 'year' in master_df.columns:
            print(f"==> Filtering data for years {year_start}-{year_end}...")
            year_filtered_df = master_df[
                (pd.to_numeric(master_df['year'], errors='coerce') >= year_start) & 
                (pd.to_numeric(master_df['year'], errors='coerce') <= year_end)
            ]
            
            print(f"    --> Filtered {len(master_df):,} records to {len(year_filtered_df):,} records in year range {year_start}-{year_end}")
            
            # Display dataset summary
            self._print_dataset_summary(year_filtered_df)
            
            return year_filtered_df
        else:
            print("⚠️ Warning: No 'year' column found, returning all data")
            return master_df
        
    def fetch_org_year(self, 
                      org: str, 
                      year: str, 
                      verify_ssl: bool = False,
                      handle_amendments: str = 'latest',
                      force_refresh: bool = False) -> pd.DataFrame:
        """
        Fetch data for a specific organization and year.
        
        Args:
            org: Organization code (NSERC, SSHRC, CIHR)
            year: Year
            verify_ssl: Whether to verify SSL certificate
            handle_amendments: How to handle amendments ('all', 'latest', or 'none')
            force_refresh: If True, force a fresh data collection
        """
        # Get the full dataset for this year
        df = self.fetch_all_orgs(int(year), int(year), verify_ssl, force_refresh)
        
        if df.empty:
            return pd.DataFrame()
        
        # Filter for the specific organization
        df = df[df['org'] == org.upper()]
        print(f"✓ Found {len(df):,} records for {org} in {year}")
        
        # Handle amendments based on parameter
        if handle_amendments != 'all' and 'amendment_number' in df.columns:
            print(f"==> Processing amendments: {handle_amendments} strategy")
            if handle_amendments == 'latest':
                df = self._keep_latest_amendments(df)
                print(f"    --> After keeping latest amendments: {len(df):,} records")
            elif handle_amendments == 'none':
                df = df[df['amendment_number'] == '0']
                print(f"    --> After filtering out amendments: {len(df):,} records")
        
        return df

    def _keep_latest_amendments(self, df: pd.DataFrame) -> pd.DataFrame:
        """Keep only the latest amendment for each reference number"""
        # Convert amendment_number to numeric, treating non-numeric as 0
        df['amendment_number'] = pd.to_numeric(df['amendment_number'], errors='coerce').fillna(0)
        
        # Sort by amendment number and keep the latest
        latest_amendments = df.sort_values('amendment_number').groupby('ref_number').last()
        return latest_amendments.reset_index()

    def create_sample_dataset(fetcher, sample_size=5000):
        """
        Creates a truly random sample dataset from the full dataset with representation across years.
        
        Args:
            fetcher: The Fetcher instance
            sample_size: Number of records to include in the sample
            
        Returns:
            DataFrame containing the sampled data
        """
        print("📊 Creating a representative sample dataset...")
        
        # Get the full dataset
        full_df = fetcher._fetch_data_via_api(force_refresh=False)
        
        if full_df.empty:
            print("❌ Failed to retrieve any data for sampling")
            return pd.DataFrame()
        
        print(f"→ Source dataset has {len(full_df):,} total records")
        
        # Explicitly set the random seed for reproducibility
        np.random.seed(42)
        
        # Check if 'year' column exists and has valid data
        if 'year' in full_df.columns and not full_df['year'].isna().all():
            print("→ Using stratified sampling to ensure representation across years")
            
            # Get all available years
            years = full_df['year'].dropna().astype(str).unique()
            valid_years = [y for y in years if y.isdigit()]
            
            if len(valid_years) > 0:
                print(f"→ Dataset contains {len(valid_years)} different years")
                
                # Determine how many samples to take from each year
                samples_per_year = sample_size // len(valid_years)
                extra_samples = sample_size % len(valid_years)
                
                # Create empty list to hold samples from each year
                samples = []
                
                # For each year, take a random sample
                for year in valid_years:
                    year_data = full_df[full_df['year'] == year]
                    
                    # Determine sample size for this year
                    year_sample_size = min(samples_per_year, len(year_data))
                    
                    # Add extra sample to the first few years if needed
                    if extra_samples > 0:
                        year_sample_size += 1
                        extra_samples -= 1
                        
                    # Skip if no data for this year
                    if year_sample_size <= 0 or len(year_data) == 0:
                        continue
                    
                    # Take a random sample for this year
                    year_sample = year_data.sample(n=year_sample_size, random_state=np.random.randint(10000))
                    samples.append(year_sample)
                    
                    print(f"  ✓ Added {len(year_sample):,} records from year {year}")
                    
                # Combine all the samples
                if samples:
                    sampled_df = pd.concat(samples, ignore_index=True)
                    print(f"\n✅ Created stratified sample with {len(sampled_df):,} records across {len(valid_years)} years")
                else:
                    # Fallback to simple random sampling
                    print("⚠️ Failed to create stratified sample, falling back to random sampling")
                    sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
            else:
                # No valid years found, use random sampling
                print("⚠️ No valid years found in dataset, using random sampling")
                sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
        else:
            # No year column, use random sampling
            print("→ Year data not available, using random sampling")
            sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
        
        # Shuffle the final DataFrame to ensure randomness
        sampled_df = sampled_df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        # Print summary statistics about the sample
        print(f"\n📊 Sample Dataset Summary:")
        print(f"  • Total records: {len(sampled_df):,}")
        
        # Show agency distribution if available
        if 'org' in sampled_df.columns:
            org_counts = sampled_df['org'].value_counts()
            print("\n  Agency distribution:")
            for agency, count in org_counts.items():
                print(f"    • {agency}: {count:,} records ({count/len(sampled_df)*100:.1f}%)")
        
        # Show year distribution if available  
        if 'year' in sampled_df.columns:
            year_counts = sampled_df['year'].value_counts().sort_index()
            print("\n  Year distribution (top years):")
            for year, count in year_counts.head(10).items():
                if pd.notna(year):
                    print(f"    • {year}: {count:,} records ({count/len(sampled_df)*100:.1f}%)")
            
            if len(year_counts) > 10:
                print(f"    • ... and {len(year_counts) - 10} more years")
        
        return sampled_df

    def _print_dataset_summary(self, df: pd.DataFrame) -> None:
        """Print summary statistics of the dataset"""
        print('\nDataset Summary')
        print('=' * 40)
        print(f' - Total records: {len(df):,}')
        
        # Count unique reference numbers
        if 'ref_number' in df.columns:
            print(f' - Unique reference numbers: {df["ref_number"].nunique():,}')
        
        # Show distribution by organization
        if 'org' in df.columns and not df['org'].isna().all():
            print('\nRecords per organization:')
            org_counts = df['org'].value_counts()
            for org, count in org_counts.items():
                print(f'  {org}: {count:,}')
        
        # Show distribution by year
        if 'year' in df.columns and not df['year'].isna().all():
            print('\nRecords per year:')
            year_counts = df['year'].value_counts().sort_index()
            for year, count in year_counts.items():
                if pd.notna(year):
                    print(f'  {year}: {count:,}')

    def analyze_grants(self, df: pd.DataFrame, top: int = 10, show: bool = False) -> Dict:
        """
        Analyze the grants data and return a dictionary of analysis results.
        
        Returns:
            Dictionary containing various analysis results
        """
        if df.empty:
            print('No data to analyze!')
            return {}

        self.top = top
            
        print('==> Performing grant analysis... ')
        
        analysis_steps = [
            ('summary_by_org', 'Calculating summary by organization', self.get_org_summary),
            ('provincial_distribution', 'Calculating provincial distribution', self.get_provincial_distribution),
            ('top_recipients', 'Identifying top recipients', self.get_top_recipients),
            ('funding_ranges', 'Analyzing funding ranges', self.get_funding_ranges)
        ]

        analysis_results = {}

        # Simple numbering instead of progress bar
        for i, (key, message, func) in enumerate(analysis_steps, 1):
            print(f'  [{i}/{len(analysis_steps)}] {message}... ', end='', flush=True)
            analysis_results[key] = func(df)
            print('✓')
        
        if show:
            self._print_analysis_results(analysis_results)
        
        return analysis_results

    def get_org_summary(self, df: pd.DataFrame, display_table = False) -> pd.DataFrame:
        """Calculate summary statistics by organization"""
        # Ensure agreement_value is numeric for calculations
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        data = temp_df.groupby('org').agg({
            'agreement_value': ['count', 'sum', 'mean', 'median'],
            'recipient_legal_name': 'nunique'  # Changed to nunique for unique recipients
        }).round(2)

        # Flatten the multi-index columns
        data.columns = ['# of Grants', 'Total Funding ($)', 'Average Funding ($)', 'Median Funding ($)', '# of Recipients']
        data.index.name = 'Organization'
        data.reset_index(inplace=True)

        if display_table:
            try:
                display(data.style.format({
                    '# of Grants': '{:,}',
                    'Total Funding ($)': '${:,.2f}',
                    'Average Funding ($)': '${:,.2f}',
                    'Median Funding ($)': '${:,.2f}',
                    '# of Recipients': '{:,}'
                }))
            except ImportError:
                print(data)

        return data

    def get_provincial_distribution(self, df: pd.DataFrame, display_table = False) -> pd.DataFrame:
        """Calculate total funding by province for each organization"""
        # Ensure agreement_value is numeric for calculations
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        # Handle missing province values
        temp_df['recipient_province'] = temp_df['recipient_province'].fillna('Unknown')
        
        province_funding = temp_df.pivot_table(
            index='recipient_province',
            columns='org',
            values='agreement_value',
            aggfunc='sum'
        ).fillna(0)

        # Calculate total for each province
        province_funding['Total'] = province_funding.sum(axis=1)

        # Calculate percentage distribution
        province_pct = province_funding.div(province_funding.sum(axis=1), axis=0) * 100

        # Create combined DataFrame with single index
        combined_data = pd.DataFrame(index=province_funding.index)

        # Fill in the data
        orgs = ['CIHR', 'NSERC', 'SSHRC']
        for org in orgs:
            if org in province_funding.columns:
                combined_data[f'{org} (%)'] = province_pct[org]
                combined_data[f'{org} ($)'] = province_funding[org]

        # Add total funding as a single column
        combined_data['Total ($)'] = province_funding['Total']

        # Sort by total funding descending
        combined_data = combined_data.sort_values('Total ($)', ascending=False).reset_index()
        combined_data.index += 1
        combined_data.rename(columns={'recipient_province': 'Province/State'}, inplace=True)

        if display_table:
            try:
                display(combined_data.style.format({
                    'Total ($)': '${:,.2f}',
                    'CIHR (%)': '{:,.2f}%',
                    'NSERC (%)': '{:,.2f}%',
                    'SSHRC (%)': '{:,.2f}%',
                    'CIHR ($)': '${:,.2f}',
                    'NSERC ($)': '${:,.2f}',
                    'SSHRC ($)': '${:,.2f}'
                }))
            except ImportError:
                print(combined_data)
        
        return combined_data

    def get_top_recipients(self, df: pd.DataFrame, display_table = False, top = 10) -> pd.DataFrame:
        """Get top n recipients by funding amount"""
        # Ensure agreement_value is numeric for calculations
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        n = self.top if hasattr(self, 'top') else top
        
        # Group by recipient and calculate metrics
        grouped = temp_df.groupby('recipient_legal_name').agg({
            'agreement_value': ['sum', 'count', 'mean'],
            'org': lambda x: ', '.join(sorted(set(x)))
        })
        
        # Flatten multi-index and sort
        grouped.columns = ['Total Funding ($)', 'Number of Agreements', 'Average Funding ($)', 'Organizations']
        data = grouped.sort_values('Total Funding ($)', ascending=False).head(n).reset_index()
        data.index = data.index + 1

        if display_table:
            try:
                display(data.style.format({
                    'Total Funding ($)': '${:,.2f}',
                    'Average Funding ($)': '${:,.2f}',
                    'Number of Agreements': '{:,}'
                }))
            except ImportError:
                print(data)

        return data

    def get_funding_ranges(self, df: pd.DataFrame, display_table = False) -> pd.DataFrame:
        """Analyze distribution of funding amounts"""
        # Ensure agreement_value is numeric for funding range analysis
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        # Create funding ranges
        temp_df['funding_range'] = pd.cut(
            temp_df['agreement_value'],
            bins=[0, 10000, 50000, 100000, 500000, float('inf')],
            labels=['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']
        )
        
        # Count grants in each range by organization - use observed=True to avoid warning
        data = temp_df.groupby(['org', 'funding_range'], observed=True).size().unstack(fill_value=0)
        
        # Ensure all columns exist (in case some ranges have no data)
        for col in ['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']:
            if col not in data.columns:
                data[col] = 0
                
        # Reorder columns
        data = data[['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']]
        
        data.index.name = 'Organization'

        if display_table:
            try:
                display(data.style.format('{:,}'))
            except ImportError:
                print(data)

        return data

    def _print_analysis_results(self, results: Dict) -> None:
        """Print formatted analysis results"""
        print('\nAnalysis Results')
        print('=' * 40)
        
        print(f'\nSummary by Organization:')
        print(results['summary_by_org'])
        
        print(f'\nFunding Distribution by Province (and US States):')
        print(results['provincial_distribution'])
        
        print(f'\nTop {len(results["top_recipients"])} Recipients by Funding:')
        print(results['top_recipients'])
        
        print(f'\nFunding Range Distribution:')
        print(results['funding_ranges'])

    def save_year_range_data(self, df: pd.DataFrame, year_start: int, year_end: int) -> Optional[Path]:
        """
        Save data for a specific year range to a separate file
        
        Args:
            df: DataFrame containing the data
            year_start: Start year for the range
            year_end: End year for the range
            
        Returns:
            Path to the saved file or None if saving failed
        """
        if df.empty:
            print("No data to save")
            return None
            
        # Format the year range for the filename
        year_range = f"{year_start}"
        if year_end != year_start:
            year_range += f"_{year_end}"
            
        # Create the output file path
        output_file = self.production_dir / f"data_{self.timestamp}_{year_range}.csv"
        
        try:
            # Save the data
            print(f"Saving year range data to {output_file}...")
            df.to_csv(output_file, index=False)
            print(f"✅ Saved {len(df):,} records for years {year_start}-{year_end} to {output_file}")
            
            # Ask if user wants to compress
            compress = input("Would you like to compress this file? (y/n): ").lower().strip() == 'y'
            if compress:
                try:
                    # Try 7z first, fallback to gzip
                    compressed_file = self._compress_file(output_file, '7z')
                    if compressed_file != output_file:
                        print(f"✅ Compressed file: {compressed_file.name}")
                        return compressed_file
                except Exception as e:
                    print(f"Compression failed: {e}")
                    
            return output_file
        except Exception as e:
            print(f"Error saving year range data: {e}")
            return None


def main():
    parser = argparse.ArgumentParser(description="Fetch and process tri-agency grant data")
    parser.add_argument('--year-start', type=int, help='Start year (inclusive)')
    parser.add_argument('--year-end', type=int, help='End year (inclusive)')
    parser.add_argument('--all', action='store_true', help='Fetch all available data (ignores year parameters)')
    parser.add_argument('--sample', action='store_true', help='Create a smaller representative sample dataset')
    parser.add_argument('--sample-size', type=int, default=5000, help='Number of records to include in sample (default: 5000)')
    parser.add_argument('--force-refresh', action='store_true', help='Force a fresh data collection')
    parser.add_argument('--show', action='store_true', help='Show analysis results')
    parser.add_argument('--top', type=int, default=10, help='Number of top recipients to display')
    parser.add_argument('--save', action='store_true', help='Save the year range data to a separate file')
    parser.add_argument('--agency', choices=['NSERC', 'SSHRC', 'CIHR'], help='Specific agency to fetch')
    parser.add_argument('--compress', choices=['gzip', '7z'], help='Compress output files using specified method')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose output')
    
    args = parser.parse_args()
    
    # Create fetcher with verbose mode if requested
    fetcher = Fetcher(FetcherConfig(verbose=args.verbose))
    
    # Start time
    start_time = time.time()
    
    # Handle the sampling option
    if args.sample:
        print("🚚 Creating a sample dataset...")
        df = Fetcher.create_sample_dataset(fetcher, sample_size=args.sample_size)
    # If --all is specified, fetch all data without year filtering
    elif args.all:
        print("🚚 Fetching ALL available data without year filtering...")
        # Call _fetch_data_via_api directly to avoid year filtering
        df = fetcher._fetch_data_via_api(force_refresh=args.force_refresh)
        if args.agency and not df.empty:
            # Filter by agency if specified
            print(f"Filtering for agency: {args.agency}")
            df = df[df['org'] == args.agency.upper()]
            print(f"✓ Found {len(df):,} records for {args.agency}")
    # Otherwise use the normal year-based fetch
    elif args.agency and args.year_start:
        print(f"Fetching data for {args.agency} from {args.year_start}-{args.year_end or args.year_start}")
        df = fetcher.fetch_org_year(
            args.agency, 
            str(args.year_start), 
            force_refresh=args.force_refresh
        )
    elif args.year_start:
        # Fetch data for all agencies with year range
        df = fetcher.fetch_all_orgs(
            args.year_start, 
            args.year_end or args.year_start, 
            force_refresh=args.force_refresh
        )
    else:
        # No parameters specified, show help
        parser.print_help()
        print("\nERROR: You must specify either --all, --sample, or --year-start")
        return
    
    # Check if we have data
    if df.empty:
        print("❌ No data found or unable to fetch data.")
        return
    
    # Analyze the data
    print("\n" + "="*40)
    print("Running data analysis...")
    analysis_results = fetcher.analyze_grants(df, top=args.top, show=args.show)
    
    # Save data if specified
    if args.save:
        print("\n" + "="*40)
        if args.sample:
            output_folder = fetcher.sample_dir
            output_label = "sample"
        else:
            output_folder = fetcher.production_dir
            output_label = "" if args.all else f"{args.year_start}-{args.year_end or args.year_start}"
            if args.agency:
                output_label = f"{args.agency}-{output_label}"
        
        # Remove any trailing underscore from output_label
        output_label = output_label.rstrip('_')
        
        print(f"Saving data to CSV...")
        # Ensure the output label isn't empty, and doesn't have unnecessary underscores
        final_label = f"_{output_label}" if output_label else ""
        output_file = output_folder / f"data_{fetcher.timestamp}{final_label}.csv"
        
        try:
            # Save the data
            print(f"Saving to {output_file}...")
            df.to_csv(output_file, index=False)
            print(f"✅ Saved {len(df):,} records to {output_file}")
            
            # Compress if specified
            if args.compress:
                try:
                    compressed_file = fetcher._compress_file(output_file, args.compress)
                    if compressed_file != output_file:
                        print(f"✅ Compressed file: {compressed_file.name}")
                except Exception as e:
                    print(f"Compression failed: {e}")
        except Exception as e:
            print(f"Error saving data: {e}")
    
    # Report execution time
    end_time = time.time()
    duration = end_time - start_time
    minutes = int(duration // 60)
    seconds = int(duration % 60)
    print(f"\n⌛ Total execution time: {minutes} minutes and {seconds} seconds")
    
    print("\nTo access the data in Python, you can use:")
    latest_file = fetcher._get_latest_dataset_file()
    if latest_file:
        print(f"  df = pd.read_csv('{latest_file}')")
    
    print("\nOther useful commands:")
    print(f"  python fetcher.py --all --force-refresh  # Fetch all data with fresh download")
    print(f"  python fetcher.py --sample --save  # Create and save a sample dataset")
    print(f"  python fetcher.py --sample --sample-size 10000  # Create a larger sample")
    print(f"  python fetcher.py --all --agency NSERC  # Fetch all NSERC data")
    print(f"  python fetcher.py --all --save --compress 7z  # Save and compress all data")
    print()

if __name__ == "__main__":
    main()