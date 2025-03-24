import pandas as pd
import numpy as np
import requests
from typing import Dict, Optional, List, Tuple, Any
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

# Import the preprocessor module
from preprocessor import DataPreprocessor

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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
    dataset_id = "432527ab-7aac-45b5-81d6-7597107a7013"
    resource_id = "1d15a62f-5656-49ad-8c88-f40ce689d831"
    base_url = "https://open.canada.ca/data/api/action"
    tri_agencies = ["cihr-irsc", "nserc-crsng", "sshrc-crsh"]

    def __init__(self, quiet=False):
        self.quiet = quiet
        self.orgs = {
            'nserc-crsng': 'NSERC',
            'sshrc-crsh': 'SSHRC',
            'cihr-irsc': 'CIHR'
        }
        self.ROOT = self.find_project_root()

    def find_project_root(self):
        """Find the root directory of the project"""
        current_path = Path(__file__).resolve()
        for parent in current_path.parents:
            if parent.name == 'rgap':
                return parent
        return current_path.parents[1]

class Fetcher:
    """Class for fetching and processing tri-agency grant data"""
    
    def __init__(self, config: Optional[FetcherConfig] = None):
        self.config = config or FetcherConfig()
        self._setup_directories()
        self.timestamp = time.strftime("%Y%m%d_%H%M%S")
        self.metadata_file = self.production_dir / "dataset_metadata.json"
        self._setup_signal_handlers()
        self.interrupted = False
        self.preprocessor = DataPreprocessor(quiet=self.config.quiet)
        
    def _setup_signal_handlers(self):
        """Set up handlers for interruption signals"""
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
    def _signal_handler(self, sig, frame):
        """Handle interruption signals gracefully"""
        print("\n\n📢 Received termination signal. Cleaning up...")
        self.interrupted = True
        print("✓ You can safely re-run the command later to resume where you left off.")
        sys.exit(0)
        
    def _print(self, *args, **kwargs) -> None:
        """Print only if not in quiet mode"""
        if not self.config.quiet:
            print(*args, **kwargs)
    
    def _setup_directories(self) -> None:
        """Create necessary directories for data storage"""
        self.data_dir = self.config.ROOT / 'data'
        self.raw_dir = self.data_dir / "raw"
        self.production_dir = self.data_dir / "production"
        self.processed_dir = self.data_dir / "processed"
        self.sample_dir = self.data_dir / "sample"
        self.filtered_dir = self.data_dir / "filtered"
        
        for dir_path in [self.data_dir, self.raw_dir, self.production_dir, 
                        self.processed_dir, self.sample_dir, self.filtered_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)
            
    def _save_metadata(self, metadata: Dict) -> None:
        """Save metadata about the dataset"""
        with open(self.metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
    def _load_metadata(self) -> Dict:
        """Load metadata about previously fetched datasets"""
        if not self.metadata_file.exists():
            return {}
        try:
            with open(self.metadata_file, 'r') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
        except Exception as e:
            self._print(f"Error loading metadata: {e}")
            return {}
    
    def _check_dataset_update(self, verify_ssl: bool = False) -> Dict:
        """Check if there are updates to the dataset"""
        try:
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
    
    def _get_latest_dataset_file(self, directory: Optional[Path] = None, type: str = "raw") -> Optional[Path]:
        """Get the path to the latest dataset file"""
        if directory is None:
            if type == "processed":
                directory = self.processed_dir
            else:
                directory = self.production_dir
                
        # Define patterns based on type
        if type == "processed":
            pattern = str(directory / "processed_*.csv")
        else:
            pattern = str(directory / "data_*.csv")
            
        # Check for uncompressed files first
        files = glob.glob(pattern)
        if not files:
            # If no uncompressed files, check for compressed ones
            pattern_gz = pattern + ".gz"
            pattern_7z = pattern.replace('.csv', '.7z')
            files = glob.glob(pattern_gz) + glob.glob(pattern_7z)
            if not files:
                return None
                
        # Get the most recently created file
        latest_file = max(files, key=os.path.getctime)
        return Path(latest_file)
        
    def _compress_file(self, file_path: Path, method: str = '7z') -> Path:
        """Compress a file using either 7z or gzip"""
        if not file_path.exists():
            self._print(f"Error: File {file_path} does not exist.")
            return file_path
            
        if method == '7z':
            try:
                compressed_path = file_path.with_suffix('.7z')
                self._print(f"Compressing file with 7z: {file_path.name} -> {compressed_path.name}")
                self._print("This may take a while but will result in better compression...")
                
                # Check if 7z is available
                try:
                    subprocess.run(['7z', '--help'], stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
                except FileNotFoundError:
                    self._print("7z command not found. Falling back to gzip...")
                    return self._compress_file(file_path, 'gzip')
                    
                # Run 7z compression
                process = subprocess.Popen(
                    ['7z', 'a', '-mx=9', str(compressed_path), str(file_path)],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=True
                )
                
                # Show progress
                self._print("Compressing: ", end="")
                while process.poll() is None:
                    self._print(".", end="", flush=True)
                    time.sleep(1)
                self._print(" Done!")
                
                # Check result
                if process.returncode == 0:
                    orig_size = file_path.stat().st_size
                    comp_size = compressed_path.stat().st_size
                    reduction = (1 - comp_size/orig_size) * 100
                    self._print(f"✓ Compressed {file_path.name} from {orig_size/1024/1024:.1f}MB to {comp_size/1024/1024:.1f}MB ({reduction:.1f}% reduction)")
                    
                    # Ask if original should be removed
                    remove_orig = input("Remove original uncompressed file? (y/n): ").lower().strip() == 'y'
                    if remove_orig:
                        os.remove(file_path)
                        self._print(f"✓ Removed original file: {file_path.name}")
                        
                    return compressed_path
                else:
                    self._print("7z compression failed. Falling back to gzip...")
                    return self._compress_file(file_path, 'gzip')
                    
            except Exception as e:
                self._print(f"Error with 7z compression: {e}")
                return self._compress_file(file_path, 'gzip')
        else:
            # Gzip compression
            try:
                compressed_path = file_path.with_suffix('.csv.gz')
                self._print(f"==> Compressing file with gzip: {file_path.name} -> {compressed_path.name}")
                
                with open(file_path, 'rb') as f_in:
                    with gzip.open(compressed_path, 'wb') as f_out:
                        with ThousandsSeparatorTqdm(
                            total=os.path.getsize(file_path), 
                            unit='B', 
                            unit_scale=True, 
                            desc="Compressing", 
                            bar_format='{desc}: {percentage:3.0f}%|{bar}| {n_fmt}/{total_fmt} [{elapsed}<{remaining}]',
                            disable=self.config.quiet
                        ) as pbar:
                            while chunk := f_in.read(1024*1024):  # Read 1MB at a time
                                f_out.write(chunk)
                                pbar.update(len(chunk))
                                
                # Check result
                if compressed_path.exists():
                    orig_size = file_path.stat().st_size
                    comp_size = compressed_path.stat().st_size
                    reduction = (1 - comp_size/orig_size) * 100
                    self._print(f"✅ Compressed {file_path.name} from {orig_size/1024/1024:.1f}MB to {comp_size/1024/1024:.1f}MB ({reduction:.1f}% reduction)")
                    
                    # Ask if original should be removed
                    remove_orig = input("Remove original uncompressed file? (y/n): ").lower().strip() == 'y'
                    if remove_orig:
                        os.remove(file_path)
                        self._print(f"✓ Removed original file: {file_path.name}")
                        
                    return compressed_path
                    
            except Exception as e:
                self._print(f"Warning: Compression failed - {str(e)}")
                self._print("Keeping uncompressed file.")
                
            return file_path

    def _fetch_data_via_api(self, force_refresh: bool = False, verify_ssl: bool = False, 
                           auto_preprocess: bool = True) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Fetch data from the API and optionally preprocess it
        
        Args:
            force_refresh: Force a fresh download even if local files exist
            verify_ssl: Whether to verify SSL certificates
            auto_preprocess: Whether to automatically preprocess data after fetching
            
        Returns:
            Tuple containing (raw DataFrame, processed DataFrame)
            If auto_preprocess is False, the second item will be empty
        """
        raw_df = pd.DataFrame()
        processed_df = pd.DataFrame()
        
        # Check for existing files unless force_refresh is True
        if not force_refresh:
            # First check for a processed file
            latest_processed = self._get_latest_dataset_file(type="processed")
            if latest_processed and latest_processed.exists():
                self._print(f"==> Using existing preprocessed dataset: {latest_processed}")
                try:
                    # Load the processed dataset
                    if latest_processed.suffix == '.gz':
                        self._print("    --> Reading compressed CSV file...")
                        processed_df = pd.read_csv(latest_processed, compression='gzip', low_memory=False)
                        return pd.DataFrame(), processed_df  # Return empty raw_df
                    elif latest_processed.suffix == '.7z':
                        self._print("    --> Reading 7z compressed file...")
                        with tempfile.TemporaryDirectory() as tmpdirname:
                            subprocess.run(['7z', 'e', str(latest_processed), f'-o{tmpdirname}', '-y'], 
                                          stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                            csv_files = glob.glob(f"{tmpdirname}/*.csv")
                            if csv_files:
                                processed_df = pd.read_csv(csv_files[0], low_memory=False)
                                return pd.DataFrame(), processed_df  # Return empty raw_df
                            else:
                                self._print("⚠️ No CSV file found in 7z archive")
                    else:
                        processed_df = pd.read_csv(latest_processed, low_memory=False)
                        return pd.DataFrame(), processed_df  # Return empty raw_df
                except Exception as e:
                    self._print(f"⚠️ Error reading existing processed file: {str(e)}")
                    self._print(f"--> Will try raw file instead...")
                    processed_df = pd.DataFrame()
            
            # If no processed file or error, check for raw file
            if processed_df.empty:
                latest_raw = self._get_latest_dataset_file(type="raw")
                if latest_raw and latest_raw.exists():
                    self._print(f"==> Using existing raw dataset file: {latest_raw}")
                    try:
                        if latest_raw.suffix == '.gz':
                            self._print("    --> Reading compressed CSV file...")
                            raw_df = pd.read_csv(latest_raw, compression='gzip', low_memory=False)
                        elif latest_raw.suffix == '.7z':
                            self._print("    --> Reading 7z compressed file...")
                            with tempfile.TemporaryDirectory() as tmpdirname:
                                subprocess.run(['7z', 'e', str(latest_raw), f'-o{tmpdirname}', '-y'], 
                                             stdout=subprocess.PIPE, stderr=subprocess.PIPE)
                                csv_files = glob.glob(f"{tmpdirname}/*.csv")
                                if csv_files:
                                    raw_df = pd.read_csv(csv_files[0], low_memory=False)
                                else:
                                    self._print("⚠️ No CSV file found in 7z archive")
                                    self._print("--> Attempting to fetch fresh data instead...")
                        else:
                            raw_df = pd.read_csv(latest_raw, low_memory=False)
                    except Exception as e:
                        self._print(f"⚠️ Error reading existing raw file: {str(e)}")
                        self._print(f"--> Attempting to fetch fresh data instead...")
                        raw_df = pd.DataFrame()
        
        # If no valid local data or force_refresh, fetch from API
        if raw_df.empty:
            self._print("==> Fetching complete tri-agency dataset via API...")
            dataset_info = self._check_dataset_update(verify_ssl)
            current_metadata = self._load_metadata()
            
            dataset_updated = True
            if current_metadata.get('metadata_modified') == dataset_info.get('metadata_modified'):
                self._print("📢 DATASET STATUS: Not modified since last download!")
                dataset_updated = False
                if not force_refresh:
                    self._print("Use --force-refresh to download anyway")
                    if current_metadata.get('file_path'):
                        file_path = Path(current_metadata.get('file_path'))
                        if file_path.exists():
                            raw_df = pd.read_csv(file_path, low_memory=False)
                            self._print(f"Using cached dataset from: {file_path}")
            else:
                self._print("📢 DATASET STATUS: Dataset has been updated since last download!")
            
            # Only proceed with API fetch if no valid data yet
            if raw_df.empty:
                api_url = f"{self.config.base_url}/datastore_search"
                agencies = self.config.tri_agencies
                
                completed_pbars = {}
                all_agency_data = {}
                
                def fetch_agency_data(agency):
                    """Fetch data for a specific agency"""
                    if self.interrupted:
                        return []
                    position = agencies.index(agency)
                    offset = 0
                    limit = 1000
                    total_records = None
                    agency_records = []
                    pbar = ThousandsSeparatorTqdm(
                        desc=f"Fetching {self.config.orgs[agency]} grants", 
                        unit="records", 
                        position=position,
                        leave=True,
                        dynamic_ncols=True,
                        bar_format='{desc}: {n:,}/{total_fmt} {bar} [{elapsed}<{remaining}, {rate_fmt}]',
                        disable=self.config.quiet)
                    completed_pbars[agency] = pbar

                    retry_count = 0
                    max_retries = 3
                    
                    while True:
                        if self.interrupted:
                            pbar.close()
                            return []
                        params = {
                            "resource_id": self.config.resource_id,
                            "filters": json.dumps({"owner_org": agency}),
                            "limit": limit,
                            "offset": offset
                        }
                        try:
                            response = requests.get(api_url, params=params, verify=verify_ssl, timeout=60)
                            response.raise_for_status()
                            data = response.json()
                            if not data.get('success'):
                                all_agency_data[agency] = {'error': data.get('error', {}).get('message', 'Unknown error')}
                                break
                            records = data['result']['records']
                            if not records:
                                break
                            if total_records is None and 'total' in data['result']:
                                total_records = data['result']['total']
                                pbar.total = total_records
                                pbar.refresh()
                            pbar.update(len(records))
                            agency_records.extend(records)
                            offset += len(records)
                            retry_count = 0
                            if len(records) < limit:
                                break
                        except (requests.exceptions.Timeout, requests.exceptions.RequestException) as e:
                            retry_count += 1
                            if retry_count <= max_retries:
                                time.sleep(2)
                                continue
                            else:
                                all_agency_data[agency] = {'error': f"Max retries exceeded: {str(e)}"}
                                break
                    
                    if pbar.total is not None and pbar.n < pbar.total:
                        pbar.update(pbar.total - pbar.n)
                    return agency_records
                
                all_records = []
                self._print(f"\n==> Fetching data for {len(agencies)} agencies in parallel...")
                
                with concurrent.futures.ThreadPoolExecutor(max_workers=len(agencies)) as executor:
                    future_to_agency = {executor.submit(fetch_agency_data, agency): agency for agency in agencies}
                    for future in concurrent.futures.as_completed(future_to_agency):
                        agency = future_to_agency[future]
                        try:
                            agency_records = future.result()
                            all_records.extend(agency_records)
                            all_agency_data[agency] = {'records': agency_records}
                        except Exception as exc:
                            all_agency_data[agency] = {'error': str(exc)}
                
                time.sleep(5)
                self._print("\n\n")
                for agency in agencies:
                    data = all_agency_data.get(agency, {})
                    if 'error' in data:
                        self._print(f"❌ Error fetching {self.config.orgs[agency]}: {data['error']}")
                    elif 'records' in data:
                        records = data['records']
                        self._print(f"✓ Retrieved {len(records):,} records for {self.config.orgs[agency]}")
                    else:
                        self._print(f"⚠️ No data received for {self.config.orgs[agency]}")
                
                for pbar in completed_pbars.values():
                    pbar.close()
                    
                if all_records:
                    total_count = len(all_records)
                    self._print(f"\n==> Processing {total_count:,} records across all agencies...")
                    
                    # Create raw DataFrame
                    raw_df = pd.DataFrame(all_records)

                    # Save the raw data
                    raw_file = self.raw_dir / f"data_{self.timestamp}.csv"
                    self._print(f"  ==> Saving raw dataset to {raw_file}...")
                    raw_df.to_csv(raw_file, index=False)
                    self._print(f"      ✓ Saved raw data: {raw_file}")

                    # Compress the raw file if it's large enough to warrant compression
                    if raw_file.stat().st_size > 50 * 1024 * 1024:  # If more than 50MB
                        try:
                            compressed_raw = self._compress_file(raw_file, '7z')
                            if compressed_raw != raw_file:
                                self._print(f"  ✓ Compressed raw dataset: {compressed_raw.name}")
                        except Exception as e:
                            self._print(f"  ⚠️ Raw file compression failed: {e}")
                    
                    # Update metadata
                    metadata = {
                        'timestamp': self.timestamp,
                        'record_count': len(raw_df),
                        'metadata_modified': dataset_info.get('metadata_modified', ''),
                        'dataset_id': self.config.dataset_id,
                        'resource_id': self.config.resource_id,
                        'file_path': str(raw_file),
                        'last_updated': datetime.now().isoformat()
                    }
                    self._save_metadata(metadata)
                else:
                    self._print("⚠️ No records found from API")
        
        # Preprocess data if requested and raw_df is not empty
        if auto_preprocess and not raw_df.empty and processed_df.empty:
            self._print("\n==> Automatically preprocessing data...")
            processed_df = self.preprocess_data(raw_df)
        
        return raw_df, processed_df

    def preprocess_data(self, df: pd.DataFrame, save: bool = True) -> pd.DataFrame:
        """
        Process raw data using the preprocessor
        
        Args:
            df: Raw DataFrame to process
            save: Whether to save the processed data
            
        Returns:
            Processed DataFrame
        """
        if df.empty:
            self._print("Warning: Empty DataFrame provided for preprocessing")
            return df
            
        # Start the preprocessing
        processed_df = self.preprocessor.preprocess_data(df)
        
        # Save if requested
        if save and not processed_df.empty:
            processed_file = self.processed_dir / f"processed_{self.timestamp}.csv"
            self._print(f"==> Saving processed dataset to {processed_file}...")
            processed_df.to_csv(processed_file, index=False)
            self._print(f"    ✓ Saved processed data: {processed_file}")
            
            # Compress if it's large enough
            if processed_file.stat().st_size > 50 * 1024 * 1024:  # If more than 50MB
                try:
                    compressed_file = self._compress_file(processed_file, '7z')
                    if compressed_file != processed_file:
                        self._print(f"  ✓ Compressed processed dataset: {compressed_file.name}")
                except Exception as e:
                    self._print(f"  ⚠️ Processed file compression failed: {e}")
        
        return processed_df

    def create_sample_dataset(self, sample_size=5000, auto_preprocess=True):
        """Create a representative sample dataset"""
        self._print("📊 Creating a representative sample dataset...")
        
        # Get the data - first try to use existing processed data
        raw_df, processed_df = self._fetch_data_via_api(force_refresh=False, auto_preprocess=auto_preprocess)
        
        # Use either processed or raw data, depending on what's available
        if not processed_df.empty:
            full_df = processed_df
            self._print("→ Using preprocessed dataset as source")
        elif not raw_df.empty:
            full_df = raw_df
            self._print("→ Using raw dataset as source")
        else:
            self._print("❌ Failed to retrieve any data for sampling")
            return pd.DataFrame()
            
        self._print(f"→ Source dataset has {len(full_df):,} total records")
        
        # Make sure we have a year column
        if 'year' not in full_df.columns:
            full_df = self.preprocessor.extract_year_from_date(full_df)
            
        # Set random seed for reproducibility
        np.random.seed(42)
        
        # Perform stratified sampling by year if possible
        if 'year' in full_df.columns and not full_df['year'].isna().all():
            self._print("→ Using stratified sampling to ensure representation across years")
            years = full_df['year'].dropna().astype(str).unique()
            valid_years = [y for y in years if y.isdigit()]
            
            if len(valid_years) > 0:
                self._print(f"→ Dataset contains {len(valid_years)} different years")
                samples_per_year = sample_size // len(valid_years)
                extra_samples = sample_size % len(valid_years)
                samples = []
                
                for year in valid_years:
                    year_data = full_df[full_df['year'] == year]
                    year_sample_size = min(samples_per_year, len(year_data))
                    if extra_samples > 0:
                        year_sample_size += 1
                        extra_samples -= 1
                    if year_sample_size <= 0 or len(year_data) == 0:
                        continue
                    year_sample = year_data.sample(n=year_sample_size, random_state=np.random.randint(10000))
                    samples.append(year_sample)
                    self._print(f"  ✓ Added {len(year_sample):,} records from year {year}")
                    
                if samples:
                    sampled_df = pd.concat(samples, ignore_index=True)
                    self._print(f"\n✅ Created stratified sample with {len(sampled_df):,} records across {len(valid_years)} years")
                else:
                    self._print("⚠️ Falling back to random sampling")
                    sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
            else:
                self._print("⚠️ Using random sampling - no valid years found")
                sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
        else:
            self._print("→ Using random sampling - no year data available")
            sampled_df = full_df.sample(n=min(sample_size, len(full_df)), random_state=42)
        
        # Shuffle the sample to ensure random ordering
        sampled_df = sampled_df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        # Save the raw sample
        sample_file = self.sample_dir / f"sample_{sample_size}_{self.timestamp}.csv"
        self._print(f"==> Saving raw sample to {sample_file}...")
        sampled_df.to_csv(sample_file, index=False)
        self._print(f"    ✓ Saved raw sample: {sample_file}")
        
        # Process the sample if requested and we're working with raw data
        processed_sample = None
        if auto_preprocess:
            if not processed_df.empty:
                # If we used processed data, we don't need to process again
                processed_sample = sampled_df
                self._print("→ Sample already contains processed data")
            else:
                # Process the sample
                self._print("→ Processing the sample dataset...")
                processed_sample = self.preprocessor.preprocess_data(sampled_df)
                
                # Save the processed sample
                processed_sample_file = self.sample_dir / f"processed_sample_{sample_size}_{self.timestamp}.csv"
                processed_sample.to_csv(processed_sample_file, index=False)
                self._print(f"    ✓ Saved processed sample: {processed_sample_file}")
        else:
            # If no preprocessing requested, return the raw sample
            processed_sample = sampled_df
        
        # Print sample dataset summary
        self._print(f"\n📊 Sample Dataset Summary:")
        self._print(f"  • Total records: {len(processed_sample):,}")
        if 'org' in processed_sample.columns:
            org_counts = processed_sample['org'].value_counts()
            self._print("\n  Agency distribution:")
            for agency, count in org_counts.items():
                self._print(f"    • {agency}: {count:,} ({count/len(processed_sample)*100:.1f}%)")
        if 'year' in processed_sample.columns:
            year_counts = processed_sample['year'].value_counts().sort_index()
            self._print("\n  Year distribution (top years):")
            for year, count in year_counts.head(10).items():
                if pd.notna(year):
                    self._print(f"    • {year}: {count:,} ({count/len(processed_sample)*100:.1f}%)")
            if len(year_counts) > 10:
                self._print(f"    • ... and {len(year_counts) - 10} more years")
                
        return processed_sample

    def fetch_all_orgs(self, year_start: int, year_end: int, force_refresh: bool = False) -> pd.DataFrame:
        """
        Fetch data for all organizations for a specific year range
        
        Args:
            year_start: Starting year (inclusive)
            year_end: Ending year (inclusive)
            force_refresh: Whether to force a fresh data fetch
            
        Returns:
            DataFrame containing the data for the specified year range
        """
        self._print(f"🚚 Fetching data for years {year_start}-{year_end}...")
        
        # Get the full dataset
        raw_df, processed_df = self._fetch_data_via_api(force_refresh=force_refresh)
        
        # Use either processed or raw data, depending on what's available
        if not processed_df.empty:
            df = processed_df
            self._print("→ Using preprocessed dataset")
        elif not raw_df.empty:
            df = raw_df
            self._print("→ Using raw dataset")
        else:
            self._print("❌ Failed to retrieve any data")
            return pd.DataFrame()
        
        # Make sure we have a year column
        if 'year' not in df.columns:
            df = self.preprocessor.extract_year_from_date(df)
            
        # Filter by year range
        df['year'] = pd.to_numeric(df['year'], errors='coerce')
        year_filter = (df['year'] >= year_start) & (df['year'] <= year_end)
        filtered_df = df[year_filter].copy()
        
        # Report results
        total_records = len(df)
        filtered_records = len(filtered_df)
        self._print(f"✓ Filtered {filtered_records:,} records ({filtered_records/total_records*100:.1f}%) from {total_records:,} total records")
        
        # Save filtered dataset
        if not filtered_df.empty:
            year_str = f"{year_start}_{year_end}" if year_start != year_end else f"{year_start}"
            filtered_file = self.filtered_dir / f"data_{year_str}_{self.timestamp}.csv"
            self._print(f"==> Saving filtered dataset to {filtered_file}...")
            filtered_df.to_csv(filtered_file, index=False)
            self._print(f"    ✓ Saved filtered data: {filtered_file}")
            
        return filtered_df

    def _print_dataset_summary(self, df: pd.DataFrame) -> None:
        """Print a summary of the dataset"""
        print('\nDataset Summary')
        print('=' * 40)
        print(f' - Total records: {len(df):,}')
        if 'ref_number' in df.columns:
            print(f' - Unique reference numbers: {df["ref_number"].nunique():,}')
        if 'org' in df.columns and not df['org'].isna().all():
            print('\nRecords per organization:')
            org_counts = df['org'].value_counts()
            for org, count in org_counts.items():
                print(f'  {org}: {count:,}')
        if 'year' in df.columns and not df['year'].isna().all():
            print('\nRecords per year:')
            year_counts = df['year'].value_counts().sort_index()
            for year, count in year_counts.items():
                if pd.notna(year):
                    print(f'  {year}: {count:,}')

    def analyze_grants(self, df: pd.DataFrame, top: int = 10, show: bool = False) -> Dict:
        """
        Analyze grant data to produce summary statistics
        
        Args:
            df: DataFrame containing grant data
            top: Number of top recipients to include
            show: Whether to display the analysis results
            
        Returns:
            Dictionary containing analysis results
        """
        if df.empty:
            self._print('No data to analyze!')
            return {}
            
        self.top = top
        self._print('==> Performing grant analysis... ')
        
        # Define analysis steps
        analysis_steps = [
            ('summary_by_org', 'Calculating summary by organization', self.get_org_summary),
            ('provincial_distribution', 'Calculating provincial distribution', self.get_provincial_distribution),
            ('top_recipients', 'Identifying top recipients', self.get_top_recipients),
            ('funding_ranges', 'Analyzing funding ranges', self.get_funding_ranges)
        ]
        
        # Execute each analysis step
        analysis_results = {}
        for i, (key, message, func) in enumerate(analysis_steps, 1):
            self._print(f'  [{i}/{len(analysis_steps)}] {message}... ', end='', flush=True)
            analysis_results[key] = func(df)
            self._print('✓')
            
        # Display results if requested
        if show:
            self._print_analysis_results(analysis_results)
            
        return analysis_results

    def get_org_summary(self, df: pd.DataFrame, display_table=False) -> pd.DataFrame:
        """
        Generate summary statistics grouped by organization
        
        Args:
            df: DataFrame containing grant data
            display_table: Whether to display the summary table
            
        Returns:
            DataFrame with organization summary statistics
        """
        # Make a copy to avoid modifying the original
        temp_df = df.copy()
        
        # Ensure agreement_value is numeric
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        # Group by organization and calculate statistics
        data = temp_df.groupby('org').agg({
            'agreement_value': ['count', 'sum', 'mean', 'median'],
            'recipient_legal_name': 'nunique'
        }).round(2)
        
        # Rename columns
        data.columns = ['# of Grants', 'Total Funding ($)', 'Average Funding ($)', 'Median Funding ($)', '# of Recipients']
        data.index.name = 'Organization'
        data.reset_index(inplace=True)
        
        # Display a formatted table if requested
        if display_table:
            try:
                from IPython.display import display
                display(data.style.format({
                    '# of Grants': '{:,}',
                    'Total Funding ($)': '${:,.2f}',
                    'Average Funding ($)': '${:,.2f}',
                    'Median Funding ($)': '${:,.2f}',
                    '# of Recipients': '{:,}'
                }))
            except ImportError:
                self._print(data)
                
        return data

    def get_provincial_distribution(self, df: pd.DataFrame, display_table=False) -> pd.DataFrame:
        """
        Analyze funding distribution by province/state
        
        Args:
            df: DataFrame containing grant data
            display_table: Whether to display the distribution table
            
        Returns:
            DataFrame with provincial distribution statistics
        """
        # Make a copy and ensure proper data types
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        temp_df['recipient_province'] = temp_df['recipient_province'].fillna('Unknown')
        
        # Create pivot table for funding by province and organization
        province_funding = temp_df.pivot_table(
            index='recipient_province',
            columns='org',
            values='agreement_value',
            aggfunc='sum'
        ).fillna(0)
        
        # Add total column
        province_funding['Total'] = province_funding.sum(axis=1)
        
        # Calculate percentages
        province_pct = province_funding.div(province_funding.sum(axis=1), axis=0) * 100
        
        # Combine funding and percentage data
        combined_data = pd.DataFrame(index=province_funding.index)
        orgs = ['CIHR', 'NSERC', 'SSHRC']
        for org in orgs:
            if org in province_funding.columns:
                combined_data[f'{org} (%)'] = province_pct[org]
                combined_data[f'{org} ($)'] = province_funding[org]
        
        combined_data['Total ($)'] = province_funding['Total']
        combined_data = combined_data.sort_values('Total ($)', ascending=False).reset_index()
        combined_data.index += 1  # Start index at 1
        combined_data.rename(columns={'recipient_province': 'Province/State'}, inplace=True)
        
        # Display table if requested
        if display_table:
            try:
                from IPython.display import display
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
                self._print(combined_data)
                
        return combined_data

    def get_top_recipients(self, df: pd.DataFrame, display_table=False, top=10) -> pd.DataFrame:
        """
        Identify top recipients by total funding
        
        Args:
            df: DataFrame containing grant data
            display_table: Whether to display the recipients table
            top: Number of top recipients to include
            
        Returns:
            DataFrame with top recipients
        """
        # Make a copy and ensure proper data types
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        # Use the top value from the instance or the provided parameter
        n = self.top if hasattr(self, 'top') else top
        
        # Group by recipient and calculate statistics
        grouped = temp_df.groupby('recipient_legal_name').agg({
            'agreement_value': ['sum', 'count', 'mean'],
            'org': lambda x: ', '.join(sorted(set(x)))
        })
        
        grouped.columns = ['Total Funding ($)', 'Number of Agreements', 'Average Funding ($)', 'Organizations']
        data = grouped.sort_values('Total Funding ($)', ascending=False).head(n).reset_index()
        data.index = data.index + 1  # Start index at 1
        
        # Display table if requested
        if display_table:
            try:
                from IPython.display import display
                display(data.style.format({
                    'Total Funding ($)': '${:,.2f}',
                    'Average Funding ($)': '${:,.2f}',
                    'Number of Agreements': '{:,}'
                }))
            except ImportError:
                self._print(data)
                
        return data

    def get_funding_ranges(self, df: pd.DataFrame, display_table=False) -> pd.DataFrame:
        """
        Analyze the distribution of grants by funding range
        
        Args:
            df: DataFrame containing grant data
            display_table: Whether to display the funding ranges table
            
        Returns:
            DataFrame with funding range distribution
        """
        # Make a copy and ensure proper data types
        temp_df = df.copy()
        temp_df['agreement_value'] = pd.to_numeric(temp_df['agreement_value'], errors='coerce')
        
        # Create funding range categories
        temp_df['funding_range'] = pd.cut(
            temp_df['agreement_value'],
            bins=[0, 10000, 50000, 100000, 500000, float('inf')],
            labels=['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']
        )
        
        # Count grants by organization and funding range
        data = temp_df.groupby(['org', 'funding_range'], observed=True).size().unstack(fill_value=0)
        
        # Ensure all columns exist
        for col in ['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']:
            if col not in data.columns:
                data[col] = 0
                
        # Reorder columns
        data = data[['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']]
        data.index.name = 'Organization'
        
        # Display table if requested
        if display_table:
            try:
                from IPython.display import display
                display(data.style.format('{:,}'))
            except ImportError:
                self._print(data)
                
        return data

    def _print_analysis_results(self, results: Dict) -> None:
        """Print the analysis results in a readable format"""
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
        Save data for a specific year range
        
        Args:
            df: DataFrame with grant data
            year_start: Starting year (inclusive)
            year_end: Ending year (inclusive)
            
        Returns:
            Path to the saved file
        """
        if df.empty:
            self._print("No data to save")
            return None
            
        # Create a year range string
        year_range = f"{year_start}"
        if year_end != year_start:
            year_range += f"_{year_end}"
            
        # Define output file path
        output_file = self.processed_dir / f"processed_{self.timestamp}_{year_range}.csv"
        
        try:
            self._print(f"Saving year range data to {output_file}...")
            df.to_csv(output_file, index=False)
            self._print(f"✅ Saved {len(df):,} records for years {year_start}-{year_end} to {output_file}")
            
            # Ask if compression is desired
            compress = input("Would you like to compress this file? (y/n): ").lower().strip() == 'y'
            if compress:
                try:
                    compressed_file = self._compress_file(output_file, '7z')
                    if compressed_file != output_file:
                        self._print(f"✅ Compressed file: {compressed_file.name}")
                        return compressed_file
                except Exception as e:
                    self._print(f"Compression failed: {e}")
                    
            return output_file
            
        except Exception as e:
            self._print(f"Error saving year range data: {e}")
            return None

def main():
    """Main function for command-line operation"""
    parser = argparse.ArgumentParser(description="Fetch and process tri-agency grant data")
    parser.add_argument('--year-start', type=int, help='Start year (inclusive)')
    parser.add_argument('--year-end', type=int, help='End year (inclusive)')
    parser.add_argument('--all', action='store_true', help='Fetch all available data')
    parser.add_argument('--sample', action='store_true', help='Create sample dataset')
    parser.add_argument('--sample-size', type=int, default=5000, help='Sample size (default: 5000)')
    parser.add_argument('--force-refresh', action='store_true', help='Force fresh data collection')
    parser.add_argument('--show', action='store_true', help='Show analysis results')
    parser.add_argument('--top', type=int, default=10, help='Number of top recipients')
    parser.add_argument('--save', action='store_true', help='Save year range data')
    parser.add_argument('--compress', choices=['gzip', '7z'], help='Compression method')
    parser.add_argument('--quiet', action='store_true', help='Suppress output')
    parser.add_argument('--no-preprocess', action='store_true', help='Skip automatic preprocessing')
    
    args = parser.parse_args()
    fetcher = Fetcher(FetcherConfig(quiet=args.quiet))
    start_time = time.time()
    
    # Determine whether to preprocess data automatically
    auto_preprocess = not args.no_preprocess
    
    # Handle different operation modes
    if args.sample:
        print("🚚 Creating sample dataset...")
        df = fetcher.create_sample_dataset(args.sample_size, auto_preprocess=auto_preprocess)
    elif args.all:
        print("🚚 Fetching ALL data...")
        raw_df, df = fetcher._fetch_data_via_api(force_refresh=args.force_refresh, auto_preprocess=auto_preprocess)
        # Use the processed data if available, otherwise use raw
        df = df if not df.empty else raw_df
    elif args.year_start:
        df = fetcher.fetch_all_orgs(
            args.year_start, 
            args.year_end or args.year_start, 
            force_refresh=args.force_refresh
        )
    else:
        parser.print_help()
        print("\nERROR: Specify --all, --sample, or --year-start")
        return
    
    if df.empty:
        print("❌ No data found")
        return
    
    print("\n" + "="*40)
    print("Running data analysis...")
    analysis_results = fetcher.analyze_grants(df, top=args.top, show=args.show)
    
    if args.save:
        print("\n" + "="*40)
        output_folder = fetcher.sample_dir if args.sample else fetcher.processed_dir
        output_label = "sample" if args.sample else f"{args.year_start}-{args.year_end or args.year_start}"
        output_label = output_label.rstrip('_')
        final_label = f"_{output_label}" if output_label else ""
        output_file = output_folder / f"data_{fetcher.timestamp}{final_label}.csv"
        try:
            print(f"Saving to {output_file}...")
            df.to_csv(output_file, index=False)
            print(f"✅ Saved {len(df):,} records")
            if args.compress:
                try:
                    compressed_file = fetcher._compress_file(output_file, args.compress)
                    if compressed_file != output_file:
                        print(f"✅ Compressed file: {compressed_file.name}")
                except Exception as e:
                    print(f"Compression failed: {e}")
        except Exception as e:
            print(f"Error saving data: {e}")
    
    end_time = time.time()
    duration = end_time - start_time
    print(f"\n⌛ Total execution time: {int(duration//60)}m {int(duration%60)}s")
    latest_file = fetcher._get_latest_dataset_file(type="processed")
    if latest_file:
        print(f"\nTo access the processed data in Python:\n  df = pd.read_csv('{latest_file}')")
    print("\nOther useful commands:")
    print("  python fetcher.py --all                              # Download and auto-preprocess")
    print("  python fetcher.py --all --force-refresh              # Fresh download with preprocessing")
    print("  python fetcher.py --all --no-preprocess              # Skip preprocessing")
    print("  python fetcher.py --sample --save                    # Create sample")
    print("  python fetcher.py --all --save --compress 7z         # Save compressed")
    print("  python fetcher.py --year-start 2020 --year-end 2022  # Get data for specific years")

if __name__ == "__main__":
    main()