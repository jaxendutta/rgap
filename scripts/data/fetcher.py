import requests
import pandas as pd
import json
from typing import List, Dict, Any
import time
from pathlib import Path

class OpenCanadaGrantsFetcher:
    def __init__(self):
        self.base_url = "https://search.open.canada.ca/grants/api/v1/grants"
        self.agencies = {
            'nserc': 'Natural Sciences and Engineering Research Council of Canada',
            'cihr': 'Canadian Institutes of Health Research',
            'sshrc': 'Social Sciences and Humanities Research Council of Canada'
        }
        
    def fetch_grants(self, organization: str, offset: int = 0, limit: int = 1000) -> Dict[str, Any]:
        """
        Fetch grants data for a specific organization with pagination
        """
        params = {
            'organization': organization,
            'offset': offset,
            'limit': limit
        }
        
        try:
            response = requests.get(self.base_url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"Error fetching data: {e}")
            return None

    def fetch_all_grants_for_agency(self, agency_name: str) -> List[Dict[str, Any]]:
        """
        Fetch all grants for a specific agency using pagination
        """
        all_grants = []
        offset = 0
        limit = 1000  # Max limit per request
        
        while True:
            print(f"Fetching grants for {agency_name}, offset: {offset}")
            data = self.fetch_grants(agency_name, offset, limit)
            
            if not data or not data.get('grants'):
                break
                
            grants = data['grants']
            all_grants.extend(grants)
            
            if len(grants) < limit:
                break
                
            offset += limit
            time.sleep(1)  # Be nice to the API
            
        return all_grants

    def save_grants_to_csv(self, grants: List[Dict[str, Any]], filename: str):
        """
        Save grants data to CSV file
        """
        df = pd.DataFrame(grants)
        df.to_csv(filename, index=False)
        print(f"Saved {len(grants)} grants to {filename}")

    def fetch_all_tri_agency_grants(self):
        """
        Fetch grants for all three agencies and save to separate files
        """
        output_dir = Path('data')
        output_dir.mkdir(exist_ok=True)
        
        for agency_short, agency_full in self.agencies.items():
            print(f"\nFetching data for {agency_short.upper()}...")
            grants = self.fetch_all_grants_for_agency(agency_full)
            
            if grants:
                filename = output_dir / f"{agency_short}_grants.csv"
                self.save_grants_to_csv(grants, filename)

def main():
    fetcher = OpenCanadaGrantsFetcher()
    fetcher.fetch_all_tri_agency_grants()

if __name__ == "__main__":
    main()