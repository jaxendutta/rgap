import pandas as pd
import requests
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from pathlib import Path
from tqdm import tqdm
import urllib3
from dataclasses import dataclass
import logging
from tqdm import tqdm
from IPython.display import display

# Configure logging for errors only
logging.basicConfig(level=logging.WARNING,
                   format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class FetcherConfig:
    """Configuration for the Fetcher class"""
    base_url: str = "https://open.canada.ca/data/api/action/datastore_search_sql"
    resource_id: str = "1d15a62f-5656-49ad-8c88-f40ce689d831"
    orgs: Dict[str, str] = None
    verbose: bool = False
    
    def __post_init__(self):
        if self.orgs is None:
            self.orgs = {
                'NSERC': 'nserc-crsng',
                'SSHRC': 'sshrc-crsh',
                'CIHR': 'cihr-irsc'
            }

class GrantRecord:
    """Class to handle individual grant record processing"""
    def __init__(self, record: Dict):
        self.record = record
        self.clean_agreement_value()
    
    def clean_agreement_value(self) -> None:
        """Clean the agreement value to numeric format"""
        try:
            value = str(self.record['agreement_value'])
            self.record['agreement_value'] = float(value.replace(',', ''))
        except (ValueError, KeyError):
            self.record['agreement_value'] = None

class Fetcher:
    """Main class for fetching and processing tri-agency grant data"""
    
    def __init__(self, config: Optional[FetcherConfig] = None):
        """Initialize the Fetcher with optional custom configuration"""
        self.config = config or FetcherConfig()
        self._setup_directories()
        # Suppress SSL warning
        urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    def _print(self, *args, **kwargs) -> None:
        """Print a message if verbose mode is enabled"""
        if self.config.verbose:
            print(*args, **kwargs)
    
    def _setup_directories(self) -> None:
        """Set up necessary directories for data storage"""
        self.project_root = Path(__file__).resolve().parents[2]
        self.data_dir = self.project_root / 'data'
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        
        for dir_path in [self.raw_dir, self.processed_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

    def fetch_org_year(self, 
                      org: str, 
                      year: str, 
                      verify_ssl: bool = False,
                      handle_amendments: str = 'latest') -> pd.DataFrame:
        """
        Fetch data for a specific organization and year.
        
        Args:
            org: Organization code (NSERC, SSHRC, CIHR)
            year: Year
            verify_ssl: Whether to verify SSL certificate
            handle_amendments: How to handle amendments ('all', 'latest', or 'none')
        """
        headers = {
            'accept': '*/*',
            'Content-Type': 'application/json'
        }
        
        sql_query = f"""
        SELECT *
        FROM "{self.config.resource_id}"
        WHERE owner_org = '{self.config.orgs[org]}'
        AND agreement_start_date LIKE '%{year}-%'
        """
        
        try:
            response = requests.post(
                self.config.base_url,
                headers=headers,
                json={'sql': sql_query},
                verify=verify_ssl
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get('success'):
                records = data['result']['records']
                logger.info(f'Found {len(records)} raw records for {org} in {year}')
                
                if records:
                    df = pd.DataFrame([GrantRecord(r).record for r in records])
                    df['org'] = org
                    df['year'] = year
                    
                    # Handle amendments based on parameter
                    if handle_amendments == 'latest':
                        df = self._keep_latest_amendments(df)
                    elif handle_amendments == 'none':
                        df = df[df['amendment_number'] == '0']
                    
                    return df
                    
            return pd.DataFrame()
            
        except Exception as e:
            logger.error(f'Error fetching {org} data: {str(e)}')
            return pd.DataFrame()

    def _keep_latest_amendments(self, df: pd.DataFrame) -> pd.DataFrame:
        """Keep only the latest amendment for each reference number"""
        # Convert amendment_number to numeric, treating non-numeric as 0
        df['amendment_number'] = pd.to_numeric(df['amendment_number'], errors='coerce').fillna(0)
        
        # Sort by amendment number and keep the latest
        latest_amendments = df.sort_values('amendment_number').groupby('ref_number').last()
        return latest_amendments.reset_index()

    def fetch_all_orgs(self, 
                      year: str, 
                      verify_ssl: bool = False,
                      handle_amendments: str = 'latest') -> pd.DataFrame:
        """
        Fetch data for all tri-agencies for a specific year.
        
        Args:
            year: Year to fetch
            verify_ssl: Whether to verify SSL certificate
            handle_amendments: How to handle amendments ('all', 'latest', or 'none')
        """
        self._print(f'🚚 Starting tri-agency data fetch for {year}... ')
        
        all_data = []
        
        # Use tqdm for progress bar
        for org in self.config.orgs:
            self._print(f'  🔍 Fetching {org} data... ', end='', flush=True)
            org_df = self.fetch_org_year(org, year, verify_ssl, handle_amendments)
            if not org_df.empty:
                all_data.append(org_df)
                self._print(f'✓ ({len(org_df):,} records found)')
        
        if not all_data:
            print('  ⚠️ No data retrieved!')
            return pd.DataFrame()
        
        # Combine all data
        self._print('\n🔄️ Combining datasets... ', end='', flush=True) 
        combined_df = pd.concat(all_data, ignore_index=True)
        self._print('✓')
        
        # Save the data
        output_path = self.processed_dir / f'tri_agency_grants_{year}.csv'
        combined_df.to_csv(output_path, index=False)
        self._print(f'💾 Saved dataset to {output_path}')
        
        self._print_dataset_summary(combined_df)
        return combined_df

    def _print_dataset_summary(self, df: pd.DataFrame) -> None:
        """Print summary statistics of the dataset"""
        print('\nDataset Summary')
        print('=' * 40)
        print(f' - Total records: {len(df):,}')
        print(f' - Unique reference numbers: {df['ref_number'].nunique():,}')
        
        print('\nRecords per organization:')
        print(df['org'].value_counts())

    def analyze_grants(self, df: pd.DataFrame) -> Dict:
        """
        Analyze the grants data and return a dictionary of analysis results.
        
        Returns:
            Dictionary containing various analysis results
        """
        if df.empty:
            print('No data to analyze!')
            return {}
            
        self._print('🗃️ Performing grant analysis... ')
        
        analysis_steps = [
            ('summary_by_org', 'Calculating summary by organization', self._get_org_summary),
            ('provincial_distribution', 'Calculating provincial distribution', self._get_provincial_distribution),
            ('top_recipients', 'Identifying top recipients', self._get_top_recipients),
            ('funding_ranges', 'Analyzing funding ranges', self._get_funding_ranges)
        ]

        analysis_results = {}

        for i, (key, message, func) in enumerate(analysis_steps, 1):
            self._print(f'  [{i}/{len(analysis_steps)}] {message}... ', end='', flush=True)
            analysis_results[key] = func(df)
            self._print('✓')
        
        self._print_analysis_results(analysis_results)
        return analysis_results

    def _get_org_summary(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate summary statistics by organization"""
        return df.groupby('org').agg({
            'agreement_value': ['count', 'sum', 'mean', 'median'],
            'recipient_province': 'count'
        }).round(2)

    def _get_provincial_distribution(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate grant distribution by province"""
        return df.groupby(['org', 'recipient_province']).size().unstack(fill_value=0)

    def _get_top_recipients(self, df: pd.DataFrame, n: int = 10) -> pd.DataFrame:
        """Get top n recipients by funding amount"""
        return (
            df.groupby('recipient_legal_name')
            .agg({
                'agreement_value': ['count', 'sum'],
                'org': 'first'
            })
            .sort_values(('agreement_value', 'sum'), ascending=False)
            .head(n)
        )

    def _get_funding_ranges(self, df: pd.DataFrame) -> pd.DataFrame:
        """Analyze distribution of funding amounts"""
        df['funding_range'] = pd.cut(
            df['agreement_value'],
            bins=[0, 10000, 50000, 100000, 500000, float('inf')],
            labels=['0-10K', '10K-50K', '50K-100K', '100K-500K', '500K+']
        )
        return df.groupby(['org', 'funding_range'], observed=False).size().unstack(fill_value=0)

    def _print_analysis_results(self, results: Dict) -> None:
        """Print formatted analysis results"""
        print('\nAnalysis Results')
        print('=' * 40)
        
        print('\nSummary by Organization:')
        display(results['summary_by_org'].style
               .format({
                   ('agreement_value', 'sum'): '${:,.2f}',
                   ('agreement_value', 'mean'): '${:,.2f}',
                   ('agreement_value', 'median'): '${:,.2f}',
                   ('agreement_value', 'count'): '{:,}',
                   ('recipient_province', 'count'): '{:,}'
               }))
        
        print('\nGrants by Province:')
        # Transpose the provincial distribution and format
        display(results['provincial_distribution'].T.style.format('{:,}'))
        
        print('\nTop 10 Recipients by Funding:')
        display(results['top_recipients'].style
               .format({
                   ('agreement_value', 'sum'): '${:,.2f}',
                   ('agreement_value', 'count'): '{:,}'
               }))
        
        print('\nFunding Range Distribution:')
        display(results['funding_ranges'].style.format('{:,}'))