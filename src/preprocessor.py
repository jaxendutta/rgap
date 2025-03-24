"""
Enhanced Grant Data Preprocessor

This module provides a modular, extensible pipeline for preprocessing and standardizing
research grant data from Canadian tri-agencies. It handles data cleaning, standardization,
and transformation to prepare data for analysis and storage.

Features:
- Modular pipeline architecture with configurable stages
- Advanced data validation and quality reporting
- Memory-efficient processing for large datasets
- Vectorized operations for improved performance
- Extensible plugin system for custom processors
- Comprehensive logging and error handling
"""

import pandas as pd
import json
import logging
from pathlib import Path
import time
from typing import List, Dict, Optional, Callable, Union
from tqdm.auto import tqdm
import os
import sys
import gzip
from concurrent.futures import ProcessPoolExecutor, as_completed
import re
from datetime import datetime
import warnings

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Suppress pandas warnings during processing
warnings.filterwarnings("ignore", category=pd.errors.PerformanceWarning)

class DataQualityReport:
    """Class to track data quality issues and fixes during preprocessing."""
    
    def __init__(self):
        """Initialize an empty data quality report."""
        self.issues = {
            "missing_values": {},
            "invalid_formats": {},
            "outliers": {},
            "inconsistencies": {},
        }
        self.fixes = {
            "missing_values_filled": {},
            "formats_corrected": {},
            "outliers_handled": {},
            "inconsistencies_resolved": {}
        }
        self.metrics = {
            "initial_row_count": 0,
            "final_row_count": 0,
            "initial_column_count": 0,
            "final_column_count": 0,
            "processing_time": 0
        }
        self.start_time = time.time()
        
    def record_issue(self, issue_type: str, column: str, count: int) -> None:
        """Record a data quality issue."""
        if issue_type in self.issues:
            self.issues[issue_type][column] = count
        
    def record_fix(self, fix_type: str, column: str, count: int) -> None:
        """Record a data quality fix."""
        if fix_type in self.fixes:
            self.fixes[fix_type][column] = count
    
    def update_metrics(self, initial_df: pd.DataFrame, final_df: pd.DataFrame) -> None:
        """Update metrics based on initial and final DataFrames."""
        self.metrics["initial_row_count"] = len(initial_df)
        self.metrics["final_row_count"] = len(final_df)
        self.metrics["initial_column_count"] = len(initial_df.columns)
        self.metrics["final_column_count"] = len(final_df.columns)
        self.metrics["processing_time"] = time.time() - self.start_time
    
    def get_report(self) -> Dict:
        """Generate a comprehensive data quality report."""
        return {
            "issues": self.issues,
            "fixes": self.fixes,
            "metrics": self.metrics,
            "summary": self._generate_summary()
        }
    
    def _generate_summary(self) -> Dict:
        """Generate a summary of the data quality report."""
        total_issues = (
            sum(count for column_issues in self.issues.values() 
                if isinstance(column_issues, dict)
                for count in column_issues.values())
        )
        
        total_fixes = sum(count for column_fixes in self.fixes.values() 
                        for count in column_fixes.values())
        
        row_reduction = self.metrics["initial_row_count"] - self.metrics["final_row_count"]
        
        return {
            "total_issues_detected": total_issues,
            "total_issues_fixed": total_fixes,
            "row_reduction": row_reduction,
            "row_reduction_percent": (row_reduction / self.metrics["initial_row_count"] * 100) 
                                     if self.metrics["initial_row_count"] > 0 else 0,
            "processing_time_seconds": self.metrics["processing_time"]
        }
    
    def print_report(self, detailed: bool = False) -> None:
        """Print a human-readable data quality report."""
        summary = self._generate_summary()
        
        print("\n" + "="*50)
        print("DATA QUALITY REPORT")
        print("="*50)
        
        print(f"\nProcessing Time: {summary['processing_time_seconds']:.2f} seconds")
        print(f"Initial Row Count: {self.metrics['initial_row_count']:,}")
        print(f"Final Row Count: {self.metrics['final_row_count']:,}")
        print(f"Row Reduction: {summary['row_reduction']:,} ({summary['row_reduction_percent']:.2f}%)")
        
        print(f"\nTotal Issues Detected: {summary['total_issues_detected']:,}")
        print(f"Total Issues Fixed: {summary['total_issues_fixed']:,}")
        
        if detailed:
            print("\n" + "-"*50)
            print("DETAILED ISSUE REPORT")
            print("-"*50)
            
            for issue_type, issues in self.issues.items():
                if isinstance(issues, dict) and issues:
                    print(f"\n{issue_type.replace('_', ' ').title()}:")
                    for column, count in sorted(issues.items(), key=lambda x: x[1], reverse=True):
                        print(f"  - {column}: {count:,}")
            
            print("\n" + "-"*50)
            print("DETAILED FIX REPORT")
            print("-"*50)
            
            for fix_type, fixes in self.fixes.items():
                if fixes:
                    print(f"\n{fix_type.replace('_', ' ').title()}:")
                    for column, count in sorted(fixes.items(), key=lambda x: x[1], reverse=True):
                        print(f"  - {column}: {count:,}")
        
        print("\n" + "="*50)

class ProcessorRegistry:
    """Registry for processor functions to allow for dynamic pipeline creation."""
    
    def __init__(self):
        """Initialize an empty processor registry."""
        self.processors = {}
        
    def register(self, name: str, func: Callable, description: str = "") -> None:
        """Register a processor function."""
        self.processors[name] = {
            "function": func,
            "description": description
        }
        
    def get(self, name: str) -> Callable:
        """Get a processor function by name."""
        if name not in self.processors:
            raise ValueError(f"Processor '{name}' not registered")
        return self.processors[name]["function"]
    
    def list_processors(self) -> Dict:
        """List all registered processors."""
        return {name: info["description"] for name, info in self.processors.items()}

class DataChunk:
    """Class representing a chunk of data being processed through the pipeline."""
    
    def __init__(self, df: pd.DataFrame, metadata: Dict = None):
        """Initialize a data chunk with a DataFrame and optional metadata."""
        self.df = df
        self.metadata = metadata or {}
        self.history = []
        
    def record_operation(self, operation: str, details: Dict = None) -> None:
        """Record an operation performed on this chunk."""
        self.history.append({
            "operation": operation,
            "timestamp": datetime.now().isoformat(),
            "details": details or {}
        })
        
    def get_history(self) -> List[Dict]:
        """Get the processing history for this chunk."""
        return self.history

class ProcessingPipeline:
    """
    A modular pipeline for processing data through a series of transformations.
    """
    
    def __init__(self, registry: ProcessorRegistry = None, chunk_size: int = 100000):
        """Initialize the processing pipeline."""
        self.registry = registry or ProcessorRegistry()
        self.stages = []
        self.chunk_size = chunk_size
        self.quality_report = DataQualityReport()
        self._configure_default_processors()
        
    def add_stage(self, processor_name: str, params: Dict = None) -> 'ProcessingPipeline':
        """Add a processing stage to the pipeline."""
        self.stages.append({
            "processor": processor_name,
            "params": params or {}
        })
        return self
    
    def _configure_default_processors(self) -> None:
        """Register all the default processors."""
        # Column standardization processors
        self.registry.register(
            "clean_column_names",
            self._clean_column_names,
            "Standardize column names to snake_case format"
        )
        
        self.registry.register(
            "map_organization_codes",
            self._map_organization_codes,
            "Map raw organization codes to standardized names"
        )
        
        # Data cleaning processors
                
        self.registry.register(
            "clean_research_organization_names",
            self._clean_research_organization_names,
            "Clean and standardize research organization names"
        )
        
        self.registry.register(
            "standardize_city_names",
            self._standardize_city_names,
            "Standardize city names to consistent format"
        )
        
        self.registry.register(
            "extract_year_from_date",
            self._extract_year_from_date,
            "Extract year from date fields and add as a column"
        )
        
        self.registry.register(
            "fix_research_organizations",
            self._fix_research_organizations,
            "Fix missing research organization names using recipient names"
        )

        self.registry.register(
            "clean_encoded_characters",
            self._clean_encoded_characters,
            "Clean encoded characters like _x000D_ and _x000B_ in text fields"
        )
        
        # Data type processors
        self.registry.register(
            "ensure_numeric_values",
            self._ensure_numeric_values,
            "Ensure specified columns are properly formatted as numeric values"
        )
        
        self.registry.register(
            "normalize_date_fields",
            self._normalize_date_fields,
            "Normalize date fields to consistent format"
        )
        
        # Advanced processors
        self.registry.register(
            "process_amendments",
            self._process_amendments,
            "Process grant amendments to create a consolidated dataset"
        )
    
    def _process_chunk(self, chunk: DataChunk) -> DataChunk:
        """Process a single data chunk through all pipeline stages."""
        for stage in self.stages:
            processor_name = stage["processor"]
            params = stage["params"]
            
            try:
                processor = self.registry.get(processor_name)
                # Pass the chunk DataFrame and any parameters to the processor
                result_df = processor(chunk.df, **params)
                
                # Record the operation in chunk history
                chunk.record_operation(processor_name, {
                    "params": params,
                    "rows_before": len(chunk.df),
                    "rows_after": len(result_df),
                })
                
                # Update the chunk with the processed DataFrame
                chunk.df = result_df
                
            except Exception as e:
                # Log the error but continue processing
                logger.error(f"Error in processor '{processor_name}': {str(e)}")
                chunk.record_operation(processor_name, {
                    "error": str(e),
                    "params": params
                })
        
        return chunk
    
    def process(self, df: pd.DataFrame, max_workers: int = 1) -> pd.DataFrame:
        """
        Process a DataFrame through the entire pipeline.
        
        Args:
            df: Input DataFrame to process
            max_workers: Maximum number of worker processes for parallel processing
        
        Returns:
            Processed DataFrame
        """
        if df.empty:
            logger.warning("Empty DataFrame provided for processing")
            return df
        
        # Reset quality report
        self.quality_report = DataQualityReport()
        
        # Record initial metrics
        initial_df = df.copy()
        
        # For small DataFrames, process as a single chunk
        if len(df) <= self.chunk_size or max_workers <= 1:
            logger.info(f"Processing {len(df):,} rows as a single chunk")
            result = self._process_chunk(DataChunk(df)).df
        else:
            # Split the DataFrame into chunks for parallel processing
            chunk_count = (len(df) + self.chunk_size - 1) // self.chunk_size
            logger.info(f"Processing {len(df):,} rows in {chunk_count} chunks with {max_workers} workers")
            
            # Create chunks
            chunks = []
            for i in range(0, len(df), self.chunk_size):
                chunk_df = df.iloc[i:i+self.chunk_size].copy()
                chunks.append(DataChunk(chunk_df, {"chunk_index": i // self.chunk_size}))
            
            # Process chunks in parallel
            processed_chunks = []
            with ProcessPoolExecutor(max_workers=max_workers) as executor:
                future_to_chunk = {executor.submit(self._process_chunk, chunk): i for i, chunk in enumerate(chunks)}
                
                with tqdm(total=len(chunks), desc="Processing chunks") as pbar:
                    for future in as_completed(future_to_chunk):
                        chunk_idx = future_to_chunk[future]
                        try:
                            processed_chunk = future.result()
                            processed_chunks.append(processed_chunk)
                        except Exception as e:
                            logger.error(f"Error processing chunk {chunk_idx}: {str(e)}")
                        pbar.update(1)
            
            # Sort chunks by their original index to maintain order
            processed_chunks.sort(key=lambda c: c.metadata.get("chunk_index", 0))
            
            # Combine processed chunks
            result = pd.concat([chunk.df for chunk in processed_chunks], ignore_index=True)
        
        # Update quality report with final metrics
        self.quality_report.update_metrics(initial_df, result)
        
        return result
    
    def configure_standard_pipeline(self) -> 'ProcessingPipeline':
        """Configure the pipeline with a standard set of processors."""
        return (self
            .add_stage("clean_column_names")
            .add_stage("map_organization_codes")
            .add_stage("clean_research_organization_names")
            .add_stage("standardize_city_names")
            .add_stage("extract_year_from_date")
            .add_stage("fix_research_organizations")
            .add_stage("clean_encoded_characters")
            .add_stage("ensure_numeric_values")
            .add_stage("normalize_date_fields")
            .add_stage("process_amendments")
        )
    
    def get_quality_report(self) -> Dict:
        """Get the data quality report."""
        return self.quality_report.get_report()
    
    def print_quality_report(self, detailed: bool = False) -> None:
        """Print the data quality report."""
        self.quality_report.print_report(detailed)
    
    #
    # Processor implementations (default processors)
    #
    
    def _clean_column_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names to snake_case format."""
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Convert column names to lowercase and strip whitespace
        result_df.columns = [col.strip().lower() for col in result_df.columns]
        
        # Replace special characters with underscores
        result_df.columns = [re.sub(r'[^a-z0-9_]+', '_', col) for col in result_df.columns]
        
        # Remove consecutive underscores
        result_df.columns = [re.sub(r'_+', '_', col) for col in result_df.columns]
        
        # Remove leading and trailing underscores
        result_df.columns = [col.strip('_') for col in result_df.columns]
        
        return result_df
    
    def _map_organization_codes(self, df: pd.DataFrame) -> pd.DataFrame:
        """Map raw organization codes to standardized names."""
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Create the organization mapping
        org_mapping = {
            'cihr-irsc': 'CIHR',
            'nserc-crsng': 'NSERC',
            'sshrc-crsh': 'SSHRC'
        }
        
        # Apply the mapping if the source column exists
        if 'owner_org' in result_df.columns:
            # Use vectorized operation instead of map()
            result_df['owner_org'] = result_df['owner_org'].replace(org_mapping)

            # Rename the title column if it exists
            result_df.rename(columns={'owner_org': 'org'}, inplace=True)
            
        # Rename the title column if it exists
        if 'owner_org_title' in result_df.columns:
            result_df.rename(columns={'owner_org_title': 'org_title'}, inplace=True)
        
        return result_df
    
    def _clean_research_organization_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Clean and standardize research organization names."""
        # Check if the target column exists
        col = 'research_organization_name'
        if col not in df.columns:
            logger.warning(f"Column '{col}' not found in DataFrame")
            return df
        
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Create mask for non-null values to avoid processing NaNs
        mask = result_df[col].notna()
        
        if mask.sum() == 0:
            logger.warning(f"No non-null values found in '{col}'")
            return result_df
        
        # Count errors before cleaning
        error_count = result_df.loc[mask & result_df[col].str.contains(r'\s*[|/\\]\s*', regex=True), col].shape[0]
        if error_count > 0:
            self.quality_report.record_issue("invalid_formats", col, error_count)
        
        # Use vectorized operations for better performance
        # Replace delimiters with spaces on both sides
        result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(
            r'\s*([|/\\])\s*', r' \1 ', regex=True)
        
        # Clean up double spaces
        result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(
            r'\s{2,}', ' ', regex=True)
        
        # Trim whitespace
        result_df.loc[mask, col] = result_df.loc[mask, col].str.strip()
        
        # Record the fix
        self.quality_report.record_fix("formats_corrected", col, error_count)
        
        return result_df
    
    def _standardize_city_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize city names to consistent format."""
        # Check if the target column exists
        col = 'recipient_city'
        if col not in df.columns:
            logger.warning(f"Column '{col}' not found in DataFrame")
            return df
        
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Create mask for non-null values to avoid processing NaNs
        mask = result_df[col].notna()
        
        if mask.sum() == 0:
            logger.warning(f"No non-null values found in '{col}'")
            return result_df
        
        # Count issues before standardization
        non_standard_count = result_df.loc[mask & ~result_df[col].str.match(r'^[A-Z][a-z]+(?:[\s-][A-Z][a-z]+)*$', na=False), col].shape[0]
        if non_standard_count > 0:
            self.quality_report.record_issue("inconsistencies", col, non_standard_count)
        
        # Apply title case
        result_df.loc[mask, col] = result_df.loc[mask, col].str.title()
        
        # Fix apostrophes (capitalize letter after apostrophe EXCEPT for possessive 's)
        result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(
            r"'(\w)(?!\s|$)", lambda m: "'" + m.group(1).upper(), regex=True)
        
        # Fix possessive 's to ensure it stays lowercase
        result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(r"'S\b", "'s", regex=True)
        
        # Ensure hyphenated parts are all capitalized
        result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(
            r"-(\w)", lambda m: "-" + m.group(1).upper(), regex=True)
        
        # Record the fix
        self.quality_report.record_fix("inconsistencies_resolved", col, non_standard_count)
        
        return result_df
    
    def _extract_year_from_date(self, df: pd.DataFrame) -> pd.DataFrame:
        """Extract year from date fields and add as a column."""
        # Check if the source column exists
        col = 'agreement_start_date'
        if col not in df.columns:
            logger.warning(f"Column '{col}' not found in DataFrame")
            # Still create an empty year column
            result_df = df.copy()
            result_df['year'] = pd.NA
            return result_df
        
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Use vectorized regex extraction
        result_df['year'] = result_df[col].str.extract(r'^(\d{4})')
        
        # Convert to numeric for easier analysis
        result_df['year'] = pd.to_numeric(result_df['year'], errors='coerce')
        
        # Record issues and fixes
        missing_years = result_df['year'].isna().sum()
        if missing_years > 0:
            self.quality_report.record_issue("missing_values", "year", missing_years)
        
        return result_df
    
    def _is_likely_institution(self, name: str) -> bool:
        """Check if a recipient name likely refers to an institution based on keywords."""
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
        return any(keyword in name_lower for keyword in institution_keywords)
    
    def _fix_research_organizations(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fix recipient and research organization names by:
        1. Parsing patterns like "text (text)" to separate recipient and org names
        2. Parsing patterns with | delimiter for English/French versions
        3. Parsing patterns with / delimiter for English/French versions
        4. Parsing patterns with - delimiter for English/French versions
        5. Handling complex nested parentheses situations
        6. Removing trailing parentheses information and unbalanced brackets
        7. Filling in missing research organization names using recipient names
        """
        # Define the column names
        recipient_col = 'recipient_legal_name'
        research_org_col = 'research_organization_name'
        city_col = 'recipient_city'
        
        # Check if the required columns exist
        if recipient_col not in df.columns:
            logger.warning(f"Column '{recipient_col}' not found in DataFrame")
            return df
        
        if research_org_col not in df.columns:
            logger.warning(f"Column '{research_org_col}' not found in DataFrame")
            return df
        
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Track changes for reporting
        pattern_fixes = {
            'recipient_parentheses': 0,
            'recipient_pipe': 0,
            'research_org_pipe': 0,
            'recipient_slash': 0,
            'research_org_slash': 0,
            'research_org_dash': 0,
            'city_pipe': 0,
            'complex_parentheses': 0,
            'trailing_parentheses': 0,
            'unbalanced_parentheses': 0,
            'unneeded_the': 0
        }
        
        # STEP 1: Clean recipient names with complex pattern handling
        # First, handle the complex case like "last_name, first_name (anglicized_name) (research_org)"
        # We want to extract the last parenthesized content as the organization
        complex_pattern = r'^(.*?)\s*(\([^\(\)]*\))\s*(\([^\(\)]*\))$'
        complex_pattern_for_contains = r'^.*?\s*\([^\(\)]*\)\s*\([^\(\)]*\)$'  # Non-capturing version
        
        # Find rows matching the complex pattern
        if recipient_col in result_df.columns:
            mask_complex = result_df[recipient_col].str.contains(complex_pattern_for_contains, regex=True, na=False)
            
            if mask_complex.any():
                # Extract components - base name, middle parentheses, and last parentheses
                extracted = result_df.loc[mask_complex, recipient_col].str.extract(complex_pattern)
                
                # Combine base name and middle parentheses for recipient name
                result_df.loc[mask_complex, 'temp_recipient'] = extracted[0] + ' ' + extracted[1]
                
                # Last parentheses content for research org (remove the parentheses)
                result_df.loc[mask_complex, 'temp_org'] = extracted[2].str.replace(r'^\((.*)\)$', r'\1', regex=True)
                
                # Only update research org if it's missing
                update_mask = mask_complex & result_df[research_org_col].isna()
                if update_mask.any():
                    result_df.loc[update_mask, research_org_col] = result_df.loc[update_mask, 'temp_org']
                
                # Update recipient names
                result_df.loc[mask_complex, recipient_col] = result_df.loc[mask_complex, 'temp_recipient'].str.strip()
                
                pattern_fixes['complex_parentheses'] = mask_complex.sum()
                logger.info(f"Fixed {mask_complex.sum():,} recipient names with complex parentheses pattern")
        
        # STEP 2: Clean standard recipient names with pattern "text (text)" - extract recipient name and research org
        # Use non-capturing groups for contains check
        contains_parentheses_pattern = r'^.*?\s*\(.*?\)\s*$'
        extract_parentheses_pattern = r'^(.*?)\s*\((.*?)\)\s*$'
        
        # Find rows matching the pattern in recipient name
        if recipient_col in result_df.columns:
            mask_parentheses = result_df[recipient_col].str.contains(contains_parentheses_pattern, regex=True, na=False)
            
            if mask_parentheses.any():
                # Extract both parts
                extracted = result_df.loc[mask_parentheses, recipient_col].str.extract(extract_parentheses_pattern)
                
                # Store both parts temporarily
                result_df.loc[mask_parentheses, 'text_before_paren'] = extracted[0].str.strip()
                result_df.loc[mask_parentheses, 'text_inside_paren'] = extracted[1].str.strip()
            
            # Check for name indicators (comma) and organization indicators
            has_comma_before = result_df.loc[mask_parentheses, 'text_before_paren'].str.contains(',', regex=False)
            has_comma_inside = result_df.loc[mask_parentheses, 'text_inside_paren'].str.contains(',', regex=False)
            
            # Keywords that suggest an institution (lowercase for case-insensitive matching)
            org_keywords = ['university', 'université', 'univ', 'college', 'collège', 'institute', 
                    'institut', 'school', 'école', 'center', 'centre', 'hospital', 'hôpital']
            
            # Check for org keywords
            has_org_kw_before = result_df.loc[mask_parentheses, 'text_before_paren'].str.lower().apply(
                lambda x: any(kw in x.lower() for kw in org_keywords))
            has_org_kw_inside = result_df.loc[mask_parentheses, 'text_inside_paren'].str.lower().apply(
                lambda x: any(kw in x.lower() for kw in org_keywords))
            
            # Determine which part is name and which is org
            
            # Case 1: Clear indicators in both parts - one has comma (name), other has org keywords
            name_in_before_mask = has_comma_before & has_org_kw_inside & ~has_comma_inside
            name_in_inside_mask = has_comma_inside & has_org_kw_before & ~has_comma_before
            
            # Case 2: Only one part has comma - assume it's a name
            name_likely_before_mask = has_comma_before & ~has_comma_inside & ~name_in_inside_mask & ~name_in_before_mask
            name_likely_inside_mask = has_comma_inside & ~has_comma_before & ~name_in_inside_mask & ~name_in_before_mask
            
            # Case 3: Only one part has org keywords - assume it's an organization
            org_likely_before_mask = has_org_kw_before & ~has_org_kw_inside & ~name_in_inside_mask & ~name_in_before_mask & ~name_likely_before_mask & ~name_likely_inside_mask
            org_likely_inside_mask = has_org_kw_inside & ~has_org_kw_before & ~name_in_inside_mask & ~name_in_before_mask & ~name_likely_before_mask & ~name_likely_inside_mask
            
            # Default case: Just use before as name and inside as org (original behavior)
            default_mask = ~(name_in_before_mask | name_in_inside_mask | name_likely_before_mask | 
                    name_likely_inside_mask | org_likely_before_mask | org_likely_inside_mask)
            
            # Apply the appropriate assignment based on determined cases
            
            # Case 1 & 2: Name is in the before part, org is inside
            recipient_is_before_mask = name_in_before_mask | name_likely_before_mask | org_likely_inside_mask | default_mask
            if recipient_is_before_mask.any():
                result_df.loc[mask_parentheses & recipient_is_before_mask, 'temp_recipient'] = result_df.loc[mask_parentheses & recipient_is_before_mask, 'text_before_paren']
                result_df.loc[mask_parentheses & recipient_is_before_mask, 'temp_org'] = result_df.loc[mask_parentheses & recipient_is_before_mask, 'text_inside_paren']
            
            # Case 1 & 2 inverted: Name is inside, org is before
            recipient_is_inside_mask = name_in_inside_mask | name_likely_inside_mask | org_likely_before_mask
            if recipient_is_inside_mask.any():
                result_df.loc[mask_parentheses & recipient_is_inside_mask, 'temp_recipient'] = result_df.loc[mask_parentheses & recipient_is_inside_mask, 'text_inside_paren']
                result_df.loc[mask_parentheses & recipient_is_inside_mask, 'temp_org'] = result_df.loc[mask_parentheses & recipient_is_inside_mask, 'text_before_paren']
            
            # Only update research org if it's missing
            update_mask = mask_parentheses & result_df[research_org_col].isna()
            if update_mask.any():
                result_df.loc[update_mask, research_org_col] = result_df.loc[update_mask, 'temp_org']
            
            # Update recipient names
            result_df.loc[mask_parentheses, recipient_col] = result_df.loc[mask_parentheses, 'temp_recipient']
            
            # Drop temporary columns
            result_df = result_df.drop(['text_before_paren', 'text_inside_paren'], axis=1)
            
            pattern_fixes['recipient_parentheses'] = mask_parentheses.sum()
            logger.info(f"Fixed {mask_parentheses.sum():,} recipient names with parentheses pattern")
        
        # STEP 3: Clean recipient names and research org names with pattern "text | text" - extract English version
        contains_pipe_pattern = r'^.*?\s*\|\s*.*?$'
        extract_pipe_pattern = r'^(.*?)\s*\|\s*(.*?)$'
        
        # Find rows matching the pipe pattern in recipient name
        if recipient_col in result_df.columns:
            mask_recipient_pipe = result_df[recipient_col].str.contains(contains_pipe_pattern, regex=True, na=False)
            
            if mask_recipient_pipe.any():
                # Extract the English part (before pipe)
                result_df.loc[mask_recipient_pipe, recipient_col] = result_df.loc[mask_recipient_pipe, recipient_col].str.extract(extract_pipe_pattern)[0].str.strip()
                
                pattern_fixes['recipient_pipe'] = mask_recipient_pipe.sum()
                logger.info(f"Fixed {mask_recipient_pipe.sum():,} recipient names with pipe pattern")
        
        # Find rows matching the pipe pattern in research org name
        if research_org_col in result_df.columns:
            mask_org_pipe = result_df[research_org_col].str.contains(contains_pipe_pattern, regex=True, na=False)
            
            if mask_org_pipe.any():
                # Extract the English part (before pipe)
                result_df.loc[mask_org_pipe, research_org_col] = result_df.loc[mask_org_pipe, research_org_col].str.extract(extract_pipe_pattern)[0].str.strip()
                
                pattern_fixes['research_org_pipe'] = mask_org_pipe.sum()
                logger.info(f"Fixed {mask_org_pipe.sum():,} research organization names with pipe pattern")
        
        # Fix city names with pipe pattern - extract French part
        if city_col in result_df.columns:
            mask_city_pipe = result_df[city_col].str.contains(contains_pipe_pattern, regex=True, na=False)
            
            if mask_city_pipe.any():
                # Extract the French part (after pipe)
                result_df.loc[mask_city_pipe, city_col] = result_df.loc[mask_city_pipe, city_col].str.extract(extract_pipe_pattern)[1].str.strip()
                
                pattern_fixes['city_pipe'] = mask_city_pipe.sum()
                logger.info(f"Fixed {mask_city_pipe.sum():,} city names with pipe pattern")

        # STEP 4: Clean recipient names and research org names with pattern "text / text" - extract English version
        contains_slash_pattern = r'^.*?\s*\/\s*.*?$'
        extract_slash_pattern = r'^(.*?)\s*\/\s*(.*?)$'
        
        # Find rows matching the slash pattern in recipient name
        if recipient_col in result_df.columns:
            mask_recipient_slash = result_df[recipient_col].str.contains(contains_slash_pattern, regex=True, na=False)
            
            if mask_recipient_slash.any():
                # Extract the English part (before slash)
                result_df.loc[mask_recipient_slash, recipient_col] = result_df.loc[mask_recipient_slash, recipient_col].str.extract(extract_slash_pattern)[0].str.strip()
                
                pattern_fixes['recipient_slash'] = mask_recipient_slash.sum()
                logger.info(f"Fixed {mask_recipient_slash.sum():,} recipient names with slash pattern")
        
        # Find rows matching the slash pattern in research org name
        if research_org_col in result_df.columns:
            mask_org_slash = result_df[research_org_col].str.contains(contains_slash_pattern, regex=True, na=False)
            
            if mask_org_slash.any():
                # Extract the English part (before slash)
                result_df.loc[mask_org_slash, research_org_col] = result_df.loc[mask_org_slash, research_org_col].str.extract(extract_slash_pattern)[0].str.strip()
                
                pattern_fixes['research_org_slash'] = mask_org_slash.sum()
                logger.info(f"Fixed {mask_org_slash.sum():,} research organization names with slash pattern")
        
        # STEP 5: Clean research org names with pattern "text - text" - extract English version
        contains_dash_pattern = r'^.*?\s*-\s*.*?$'
        extract_dash_pattern = r'^(.*?)\s*-\s*(.*?)$'
        
        # Find rows matching the dash pattern in research org name
        if research_org_col in result_df.columns:
            mask_org_dash = result_df[research_org_col].str.contains(contains_dash_pattern, regex=True, na=False)
            
            if mask_org_dash.any():
                # Extract the English part (before dash)
                result_df.loc[mask_org_dash, research_org_col] = result_df.loc[mask_org_dash, research_org_col].str.extract(extract_dash_pattern)[0].str.strip()
                
                pattern_fixes['research_org_dash'] = mask_org_dash.sum()
                logger.info(f"Fixed {mask_org_dash.sum():,} research organization names with dash pattern")
        
        # Clean up temporary columns
        if 'temp_recipient' in result_df.columns:
            result_df = result_df.drop(columns=['temp_recipient', 'temp_org'])

        # STEP 6: Fix unbalanced parentheses and remove trailing parentheses
        # Handle unbalanced parentheses (trailing close bracket with no open)
        if recipient_col in result_df.columns:
            # Count open and close parentheses
            open_count = result_df[recipient_col].str.count(r'\(')
            close_count = result_df[recipient_col].str.count(r'\)')
            
            # Identify rows with unbalanced parentheses (more closing than opening)
            mask_unbalanced = (close_count > open_count)
            
            if mask_unbalanced.any():
                # Remove trailing close parenthesis
                result_df.loc[mask_unbalanced, recipient_col] = result_df.loc[mask_unbalanced, recipient_col].str.replace(r'\)([^\(]*?)$', r'\1', regex=True)
                
                pattern_fixes['unbalanced_parentheses'] = mask_unbalanced.sum()
                logger.info(f"Fixed {mask_unbalanced.sum():,} recipient names with unbalanced parentheses")
        
        # Do the same for research organization names
        if research_org_col in result_df.columns:
            # Count open and close parentheses
            open_count = result_df[research_org_col].str.count(r'\(')
            close_count = result_df[research_org_col].str.count(r'\)')
            
            # Identify rows with unbalanced parentheses (more closing than opening)
            mask_unbalanced = (close_count > open_count)
            
            if mask_unbalanced.any():
                # Remove trailing close parenthesis
                result_df.loc[mask_unbalanced, research_org_col] = result_df.loc[mask_unbalanced, research_org_col].str.replace(r'\)([^\(]*?)$', r'\1', regex=True)
                
                pattern_fixes['unbalanced_parentheses'] += mask_unbalanced.sum()
                logger.info(f"Fixed {mask_unbalanced.sum():,} research organization names with unbalanced parentheses")
        
        # STEP 7: Remove any remaining content in brackets from research org names
        # This addresses cases like "University of Toronto (Toronto)" after initial cleaning
        if research_org_col in result_df.columns:
            # Check for remaining parentheses content
            mask_trailing_parentheses = result_df[research_org_col].str.contains(r'\(.*?\)', regex=True, na=False)
            
            if mask_trailing_parentheses.any():
                # Remove the parentheses and content
                result_df.loc[mask_trailing_parentheses, research_org_col] = result_df.loc[mask_trailing_parentheses, research_org_col].str.replace(r'\s*\(.*?\)', '', regex=True)
                
                pattern_fixes['trailing_parentheses'] = mask_trailing_parentheses.sum()
                logger.info(f"Removed {mask_trailing_parentheses.sum():,} trailing parenthesized content from research organizations")
        
        # STEP 8: Remove trailing punctuation from recipient names and research org names
        # Remove trailing punctuation from recipient names
        if recipient_col in result_df.columns:
            result_df[recipient_col] = result_df[recipient_col].str.replace(r'[.,;:()\[\]]*$', '', regex=True).str.strip()

        # Remove trailing punctuation from research org names
        if research_org_col in result_df.columns:
            result_df[research_org_col] = result_df[research_org_col].str.replace(r'[.,;:()\[\]]*$', '', regex=True).str.strip()
        
        # STEP 9: Now handle the case where research organization is still missing
        # Count missing research organization names
        if research_org_col in result_df.columns and recipient_col in result_df.columns:
            missing_before = result_df[research_org_col].isna().sum()
            
            if missing_before > 0:
                self.quality_report.record_issue("missing_values", research_org_col, missing_before)
                
                # Create a Series of boolean values indicating which rows to fix
                mask = (
                    result_df[research_org_col].isna() & 
                    result_df[recipient_col].notna()
                )
                
                # To improve performance, we'll vectorize the is_likely_institution check
                # First, get unique recipient names to check
                unique_recipients = result_df.loc[mask, recipient_col].unique()
                
                # Create a mapping of recipient name to whether it's an institution
                is_institution_map = {
                    name: self._is_likely_institution(name) for name in unique_recipients
                }
                
                # Refine the mask to include only rows where the recipient name is an institution
                mask = mask & result_df[recipient_col].map(
                    lambda x: is_institution_map.get(x, False) if pd.notna(x) else False
                )
                
                # For these rows, set research_organization_name to recipient_legal_name
                if mask.any():
                    result_df.loc[mask, research_org_col] = result_df.loc[mask, recipient_col]
                    
                    # Count fixed entries
                    fixed_count = mask.sum()
                    
                    # Record the fix
                    self.quality_report.record_fix("missing_values_filled", research_org_col, fixed_count)
                    
                    logger.info(f"Fixed {fixed_count:,} missing research organization names")

        # STEP 10: Clean up research organization names if they start with 'The' case-insensitively
        if research_org_col in result_df.columns:
            # Remove 'The' from the start of research organization names
            pattern_fixes['unneeded_the'] = result_df[research_org_col].str.match(r'^The\s+', case=False, na=False).sum()
            result_df[research_org_col] = result_df[research_org_col].str.replace(r'^The\s+', '', case=False, regex=True)
            logger.info(f"Removed 'The' from {pattern_fixes['unneeded_the']:,} research organization names")
            
        # Record pattern fixes in quality report
        for fix_type, count in pattern_fixes.items():
            if count > 0:
                self.quality_report.record_fix(fix_type, f"{recipient_col}/{research_org_col}", count)
        
        return result_df
    
    def _ensure_numeric_values(self, df: pd.DataFrame, numeric_columns: List[str] = None) -> pd.DataFrame:
        """Ensure specified columns are properly formatted as numeric values."""
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Default numeric columns to check if none provided
        if numeric_columns is None:
            numeric_columns = [
                'agreement_value', 
                'foreign_currency_value',
                'amendment_number'
            ]
        
        # Filter to columns that actually exist in the DataFrame
        existing_columns = [col for col in numeric_columns if col in result_df.columns]
        
        for col in existing_columns:
            # Count non-numeric values before conversion
            if result_df[col].dtype == 'object':
                # Use a regex to identify values that aren't numeric
                non_numeric_mask = ~result_df[col].astype(str).str.match(r'^-?\d+(\.\d+)?$', na=False)
                non_numeric_count = non_numeric_mask.sum()
                
                if non_numeric_count > 0:
                    self.quality_report.record_issue("invalid_formats", col, non_numeric_count)
                
                # Clean the column by removing non-numeric characters except decimal points and negative signs
                result_df[col] = result_df[col].astype(str).str.replace(r'[^0-9.-]', '', regex=True)
            
            # Convert to numeric and fill NaN with 0
            result_df[col] = pd.to_numeric(result_df[col], errors='coerce').fillna(0)
            
            # Record the fix
            if 'non_numeric_count' in locals() and non_numeric_count > 0:
                self.quality_report.record_fix("formats_corrected", col, non_numeric_count)
        
        return result_df
    
    def _normalize_date_fields(self, df: pd.DataFrame, date_columns: List[str] = None) -> pd.DataFrame:
        """Normalize date fields to consistent format."""
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # Default date columns if none provided
        if date_columns is None:
            date_columns = [
                'agreement_start_date', 
                'agreement_end_date',
                'amendment_date'
            ]
        
        # Filter to columns that actually exist in the DataFrame
        existing_columns = [col for col in date_columns if col in result_df.columns]
        
        for col in existing_columns:
            # Count invalid dates before normalization
            if result_df[col].dtype == 'object':
                # Use pd.to_datetime with coerce to identify invalid dates
                temp_dates = pd.to_datetime(result_df[col], errors='coerce')
                invalid_count = temp_dates.isna().sum() - result_df[col].isna().sum()
                
                if invalid_count > 0:
                    self.quality_report.record_issue("invalid_formats", col, invalid_count)
            
            # Convert to pandas datetime, handling different formats
            result_df[col] = pd.to_datetime(result_df[col], errors='coerce')
            
            # Convert back to string in ISO format (YYYY-MM-DD)
            result_df[col] = result_df[col].dt.strftime('%Y-%m-%d')
            
            # Record the fix
            if 'invalid_count' in locals() and invalid_count > 0:
                self.quality_report.record_fix("formats_corrected", col, invalid_count)
        
        return result_df

    def _clean_encoded_characters(self, df: pd.DataFrame, columns_to_clean: List[str] = None) -> pd.DataFrame:
        """Clean encoded characters like _x000D_ and _x000B_ in text fields."""
        # Make a copy to avoid modifying the input
        result_df = df.copy()
        
        # If no specific columns are provided, check all object (string) columns
        if columns_to_clean is None:
            columns_to_clean = result_df.select_dtypes(include=['object']).columns.tolist()
        else:
            # Filter to only include columns that actually exist in the DataFrame
            columns_to_clean = [col for col in columns_to_clean if col in result_df.columns]
        
        for col in columns_to_clean:
            # Skip non-object columns
            if result_df[col].dtype != 'object':
                continue
                
            # Create mask for non-null values
            mask = result_df[col].notna()
            
            if mask.sum() == 0:
                continue
                
            # Count occurrences of _x000D_ before cleaning
            encoded_cr_count = result_df.loc[mask & result_df[col].str.contains('_x000D_', regex=False), col].shape[0]
            encoded_cr_count += result_df.loc[mask & result_df[col].str.contains('_x000B_', regex=False), col].shape[0]
            
            if encoded_cr_count > 0:
                self.quality_report.record_issue("invalid_formats", col, encoded_cr_count)
                
                # Replace _x000D_ with a space
                result_df.loc[mask, col] = result_df.loc[mask, col].str.replace('_x000D_', ' ', regex=False)

                # Replace _x000B_ with a space
                result_df.loc[mask, col] = result_df.loc[mask, col].str.replace('_x000B_', ' ', regex=False)
                
                # Clean up any double spaces that might have been created
                result_df.loc[mask, col] = result_df.loc[mask, col].str.replace(r'\s{2,}', ' ', regex=True)
                
                # Record the fix
                self.quality_report.record_fix("formats_corrected", col, encoded_cr_count)
                
                logger.info(f"Cleaned {encoded_cr_count:,} encoded carriage returns in column '{col}'")
        
        return result_df
    
    def _process_amendments(self, df: pd.DataFrame) -> pd.DataFrame:
        """Process grant amendments to create a consolidated dataset with unique identifiers."""
        # Check if we have the necessary columns
        required_columns = ['ref_number', 'amendment_number']
        for col in required_columns:
            if col not in df.columns:
                logger.warning(f"Required column '{col}' not found. Cannot process amendments.")
                return df
        
        try:
            # First ensure amendment_number is numeric for proper sorting
            if df['amendment_number'].dtype not in ['int64', 'float64']:
                logger.info("Converting amendment_number to numeric")
                df['amendment_number'] = pd.to_numeric(df['amendment_number'], errors='coerce').fillna(0)
            
            # Identify which columns to use for creating unique identifiers
            # Check if these key columns exist
            discriminator_columns = []
            potential_discriminators = ['recipient_legal_name', 'org', 'prog_name_en', 'agreement_title_en']
            
            for col in potential_discriminators:
                if col in df.columns:
                    discriminator_columns.append(col)
            
            if not discriminator_columns:
                logger.warning("No discriminator columns found. Using only ref_number for grouping.")
                discriminator_columns = []
            
            # Create a unique identifier combining ref_number with discriminator columns
            logger.info(f"Creating unique identifiers using columns: ref_number and {discriminator_columns}")
            
            # Generate a unique_id by combining ref_number with discriminator values
            df['_unique_id'] = df['ref_number'].astype(str)
            for col in discriminator_columns:
                # Handle null values in the discriminator columns
                df['_unique_id'] = df['_unique_id'] + '|' + df[col].fillna('').astype(str)
            
            # Count unique reference numbers and total rows before processing
            ref_count_before = df['ref_number'].nunique()
            unique_id_count = df['_unique_id'].nunique()
            total_rows_before = len(df)
            
            logger.info(f"Found {ref_count_before:,} unique reference numbers")
            logger.info(f"Found {unique_id_count:,} unique identifier combinations")
            logger.info(f"Processing {unique_id_count:,} unique ref+discriminator combinations across {total_rows_before:,} rows")
            
            # Define the columns to include in the amendment history
            history_columns = [
                'amendment_number', 'amendment_date', 'agreement_value',
                'agreement_start_date', 'agreement_end_date', 'additional_information_en'
            ]
            
            # Keep only columns that actually exist in the dataframe
            history_columns = [col for col in history_columns if col in df.columns]
            
            logger.info("Creating amendment histories...")
            
            # Create an empty list to store the processed records
            processed_records = []
            
            # Process each unique identifier group
            for unique_id, group in df.groupby('_unique_id'):
                # Sort by amendment number in descending order
                sorted_group = group.sort_values('amendment_number', ascending=False)
                
                # Get the row with the highest amendment number (first row after sorting)
                latest_amendment = sorted_group.iloc[0].copy()
                
                # Create the amendment history only with PREVIOUS amendments
                # (excluding the latest one which is already part of the main record)
                amendments = []
                
                # Skip the first row (latest amendment) and process the rest
                for _, row in sorted_group.iloc[1:].iterrows():
                    amendment = {}
                    for col in history_columns:
                        if col in row and pd.notna(row[col]):
                            amendment[col] = row[col]
                    amendments.append(amendment)
                
                # Add the amendment history to the latest amendment record
                if amendments:  # Only add if there are previous amendments
                    latest_amendment['amendments_history'] = json.dumps(amendments)
                else:
                    latest_amendment['amendments_history'] = None
                
                # Remove the temporary _unique_id column from the record
                if '_unique_id' in latest_amendment:
                    latest_amendment = latest_amendment.drop('_unique_id')
                
                # Add to the list of processed records
                processed_records.append(latest_amendment)
            
            # Create a new DataFrame from the processed records
            result_df = pd.DataFrame(processed_records)
            
            # Remove the temporary _unique_id column if it exists
            if '_unique_id' in result_df.columns:
                result_df = result_df.drop('_unique_id', axis=1)
            
            # Rename amendment_number to latest_amendment_number
            if 'amendment_number' in result_df.columns:
                result_df.rename(columns={'amendment_number': 'latest_amendment_number'}, inplace=True)
            
            # Report results
            ref_count_after = len(result_df)
            rows_reduced = total_rows_before - ref_count_after
            
            logger.info(f"Amendment processing complete")
            logger.info(f"Original dataset: {total_rows_before:,} rows, {ref_count_before:,} unique reference numbers")
            logger.info(f"Processed dataset: {ref_count_after:,} rows (one per unique combination)")
            logger.info(f"Rows reduced: {rows_reduced:,} ({rows_reduced / total_rows_before * 100:.1f}%)")
            
            # Record the fix
            self.quality_report.record_fix("inconsistencies_resolved", "amendments", rows_reduced)
            
            return result_df
            
        except Exception as e:
            logger.error(f"Error processing amendments: {str(e)}")
            logger.exception("Amendment processing failed with exception")
            return df  # Return original dataframe if processing fails
        
class DataPreprocessor:
    """
    Main class for preprocessing tri-agency grant data.
    Provides a user-friendly interface to the processing pipeline.
    """
    
    def __init__(self, chunk_size: int = 100000, max_workers: int = 1, quiet: bool = False):
        """
        Initialize the DataPreprocessor with options for performance tuning.
        
        Args:
            chunk_size: Size of data chunks for processing large datasets
            max_workers: Maximum number of worker processes for parallel processing
            quiet: Whether to suppress progress output
        """
        self.chunk_size = chunk_size
        self.max_workers = max_workers
        self.quiet = quiet
        self.timestamp = time.strftime("%Y%m%d_%H%M%S")
        
        # Set up logging
        self._configure_logging()
        
        # Create the processing pipeline
        self.pipeline = ProcessingPipeline(chunk_size=chunk_size)
        self.registry = self.pipeline.registry
        
        # Configure with standard processors by default
        self.pipeline.configure_standard_pipeline()
    
    def _configure_logging(self) -> None:
        """Configure logging based on quiet setting."""
        log_level = logging.WARNING if self.quiet else logging.INFO
        logging.basicConfig(level=log_level, format='%(asctime)s - %(levelname)s - %(message)s')
    
    def _print(self, *args, **kwargs) -> None:
        """Print a message if quiet mode is disabled."""
        if not self.quiet:
            print(*args, **kwargs)
    
    def preprocess_data(self, df: pd.DataFrame, pipeline: ProcessingPipeline = None) -> pd.DataFrame:
        """
        Process raw data with data cleaning, standardization, and transformation.
        
        Args:
            df: Raw DataFrame to process
            pipeline: Optional custom pipeline to use instead of the default
            
        Returns:
            Processed DataFrame
        """
        if df.empty:
            self._print("Warning: Empty DataFrame provided for preprocessing")
            return df
            
        self._print(f"Starting data preprocessing on {len(df):,} rows...")
        
        # Use the provided pipeline or the default
        processing_pipeline = pipeline if pipeline is not None else self.pipeline
        
        # Process the data
        start_time = time.time()
        result_df = processing_pipeline.process(df, max_workers=self.max_workers)
        processing_time = time.time() - start_time
        
        # Print summary and quality report
        self._print(f"Preprocessing complete in {processing_time:.2f} seconds.")
        self._print(f"Output dataset has {len(result_df):,} rows.")
        
        if not self.quiet:
            processing_pipeline.print_quality_report(detailed=True)
        
        return result_df
    
    def save_processed_data(self, df: pd.DataFrame, output_dir: Union[str, Path], 
                            filename: str = None, compress: bool = False) -> Optional[Path]:
        """
        Save the processed dataset to a file with optional compression.
        
        Args:
            df: Processed DataFrame to save
            output_dir: Directory to save the file in
            filename: Filename to use (default: processed_TIMESTAMP.csv)
            compress: Whether to compress the output file
            
        Returns:
            Path to the saved file
        """
        if df.empty:
            self._print("Warning: Empty DataFrame provided for saving")
            return None
        
        # Convert string path to Path object
        if isinstance(output_dir, str):
            output_dir = Path(output_dir)
        
        # Ensure the output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Create the output filename with timestamp
        if filename is None:
            filename = f"data_{self.timestamp}.csv"
        
        output_path = output_dir / filename
        
        # Save the DataFrame
        self._print(f"Saving processed data to {output_path}...")
        df.to_csv(output_path, index=False)
        
        # Report results
        self._print(f"✅ Saved {len(df):,} rows to {output_path}")
        
        # Compress if requested
        if compress:
            compressed_path = self._compress_file(output_path)
            if compressed_path and compressed_path != output_path:
                return compressed_path
        
        return output_path
    
    def _compress_file(self, file_path: Path) -> Optional[Path]:
        """
        Compress a file using 7z first, and fallback to gzip if 7z fails.
        
        Args:
            file_path: Path to the file to compress
            
        Returns:
            Path to the compressed file
        """
        try:
            # Attempt compression using 7z
            compressed_path = file_path.with_suffix('.csv.7z')
            self._print(f"Attempting to compress file to {compressed_path} using 7z...")
            
            # Run 7z command
            result = os.system(f"7z a {compressed_path} {file_path}")
            
            if result == 0 and compressed_path.exists():
                orig_size = file_path.stat().st_size
                comp_size = compressed_path.stat().st_size
                reduction = (1 - comp_size / orig_size) * 100
                
                self._print(f"✅ Compressed file using 7z from {orig_size / 1024 / 1024:.1f}MB to {comp_size / 1024 / 1024:.1f}MB ({reduction:.1f}% reduction)")
                
                # Ask if the original should be removed
                remove_orig = input("Remove original uncompressed file? (y/n): ").lower().strip() == 'y'
                if remove_orig:
                    os.remove(file_path)
                    self._print(f"Removed original uncompressed file: {file_path}")
                
                return compressed_path
            else:
                self._print("7z compression failed. Falling back to gzip...")
        
        except Exception as e:
            self._print(f"Warning: 7z compression failed - {str(e)}")
            self._print("Falling back to gzip...")
        
        # Fallback to gzip compression
        try:
            compressed_path = file_path.with_suffix('.csv.gz')
            self._print(f"Compressing file to {compressed_path} using gzip...")
            
            with open(file_path, 'rb') as f_in:
                with gzip.open(compressed_path, 'wb') as f_out:
                    # Use a buffer for efficient compression
                    buffer_size = 4 * 1024 * 1024  # 4MB buffer
                    while True:
                        buffer = f_in.read(buffer_size)
                        if not buffer:
                            break
                        f_out.write(buffer)
            
            if compressed_path.exists():
                orig_size = file_path.stat().st_size
                comp_size = compressed_path.stat().st_size
                reduction = (1 - comp_size / orig_size) * 100
                
                self._print(f"✅ Compressed file using gzip from {orig_size / 1024 / 1024:.1f}MB to {comp_size / 1024 / 1024:.1f}MB ({reduction:.1f}% reduction)")
                
                # Ask if the original should be removed
                remove_orig = input("Remove original uncompressed file? (y/n): ").lower().strip() == 'y'
                if remove_orig:
                    os.remove(file_path)
                    self._print(f"Removed original uncompressed file: {file_path}")
                
                return compressed_path
            
            return None
        
        except Exception as e:
            self._print(f"Warning: gzip compression failed - {str(e)}")
            self._print("Keeping uncompressed file.")
            return file_path
    
    def register_custom_processor(self, name: str, func: Callable, description: str = "") -> None:
        """
        Register a custom processor function.
        
        Args:
            name: Name to register the processor under
            func: Processor function
            description: Description of what the processor does
        """
        self.registry.register(name, func, description)
        self._print(f"Registered custom processor: {name}")
    
    def configure_custom_pipeline(self, processors: List[Dict]) -> None:
        """
        Configure a custom processing pipeline.
        
        Args:
            processors: List of processor configurations
                Each processor should be a dict with 'name' and optional 'params'
        """
        # Create a new pipeline
        self.pipeline = ProcessingPipeline(self.registry, self.chunk_size)
        
        # Add each processor to the pipeline
        for processor in processors:
            name = processor['name']
            params = processor.get('params', {})
            self.pipeline.add_stage(name, params)
        
        self._print(f"Configured custom pipeline with {len(processors)} processors")
    
    def extract_year_from_date(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract year from date fields and add as a new column.
        This is a convenience wrapper around the pipeline processor.
        
        Args:
            df: DataFrame with date fields
            
        Returns:
            DataFrame with year column added
        """
        return self.pipeline.registry.get('extract_year_from_date')(df)
    
    def clean_research_organization_names(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean research organization names.
        This is a convenience wrapper around the pipeline processor.
        
        Args:
            df: DataFrame with research_organization_name column
            
        Returns:
            DataFrame with cleaned research organization names
        """
        return self.pipeline.registry.get('clean_research_organization_names')(df)
    
    def fix_research_organizations(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Fix missing research organization names.
        This is a convenience wrapper around the pipeline processor.
        
        Args:
            df: DataFrame with recipient_legal_name and research_organization_name columns
            
        Returns:
            DataFrame with fixed research organization names
        """
        return self.pipeline.registry.get('fix_research_organizations')(df)
    
    def process_amendments(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process grant amendments to create a consolidated dataset.
        This is a convenience wrapper around the pipeline processor.
        
        Args:
            df: DataFrame with grant amendments
            
        Returns:
            DataFrame with processed amendments
        """
        return self.pipeline.registry.get('process_amendments')(df)
    
    def get_quality_report(self) -> Dict:
        """Get the data quality report from the last processing run."""
        return self.pipeline.get_quality_report()
    
    def print_quality_report(self, detailed: bool = False) -> None:
        """Print the data quality report from the last processing run."""
        self.pipeline.print_quality_report(detailed)

# ---------------------------------------------------------
# Utility functions for easier usage from external scripts
# ---------------------------------------------------------

def preprocess_dataset(df: pd.DataFrame, output_dir: Optional[Path] = None, 
                       filename: str = None, compress: bool = False,
                       chunk_size: int = 100000, max_workers: int = 1,
                       quiet: bool = False) -> pd.DataFrame:
    """
    Preprocess a dataset with all standard cleaning and processing steps.
    
    Args:
        df: DataFrame with raw grant data
        output_dir: Directory to save processed data (if None, data won't be saved)
        filename: Filename for the output file
        compress: Whether to compress the output file
        chunk_size: Size of data chunks for processing large datasets
        max_workers: Maximum number of worker processes for parallel processing
        quiet: Whether to suppress progress output
        
    Returns:
        Processed DataFrame
    """
    # Create the preprocessor
    preprocessor = DataPreprocessor(chunk_size=chunk_size, max_workers=max_workers, quiet=quiet)
    
    # Apply all preprocessing steps
    processed_df = preprocessor.preprocess_data(df)
    
    # Save the processed data if an output directory was provided
    if output_dir is not None and not processed_df.empty:
        preprocessor.save_processed_data(processed_df, output_dir, filename=filename, compress=compress)
    
    return processed_df

# ---------------------------------------------------------
#                 Command line interface
# ---------------------------------------------------------
if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Process grant data CSV files')
    parser.add_argument('input', nargs='*', help='Input CSV file path(s)')
    parser.add_argument('--year-start', type=int, help='Start year for filtering')
    parser.add_argument('--year-end', type=int, help='End year for filtering')
    parser.add_argument('--output-dir', '-o', help='Output directory for processed files')
    parser.add_argument('--compress', '-c', action='store_true', help='Compress output files')
    parser.add_argument('--quiet', '-q', action='store_true', help='Suppress output')
    parser.add_argument('--workers', '-w', type=int, default=1, help='Number of worker processes')
    parser.add_argument('--chunk-size', '-s', type=int, default=100000, help='Processing chunk size')
    parser.add_argument('--report', '-r', action='store_true', help='Generate detailed quality report')
    
    args = parser.parse_args()
    
    # Handle input files
    input_files = args.input
    if not input_files:
        # Find latest production file
        try:
            files = list(Path('data/raw').glob('data_*.csv'))
            files.sort(key=lambda p: p.stat().st_mtime, reverse=True)
            if files:
                input_files = [str(files[0])]
                if not args.quiet:
                    print(f"Using latest file: {input_files[0]}")
            else:
                if not args.quiet:
                    print("No input files found in data/raw")
                sys.exit(1)
        except (FileNotFoundError, PermissionError) as e:
            print(f"Error accessing data directory: {e}")
            sys.exit(1)
    
    # Set up output directory
    output_dir = args.output_dir
    if output_dir is None:
        output_dir = Path('data/processed')
    else:
        output_dir = Path(output_dir)
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process each input file
    for input_path in input_files:
        input_file = Path(input_path)
        
        try:
            print(f"Processing {input_file}...")
            
            # Create the preprocessor
            preprocessor = DataPreprocessor(
                chunk_size=args.chunk_size,
                max_workers=args.workers,
                quiet=args.quiet
            )
            
            # Read the input file
            print(f"Reading input file...")
            df = pd.read_csv(input_file, low_memory=False)
            print(f"Read {len(df):,} rows")
            
            # Process the data
            processed_df = preprocessor.preprocess_data(df)

            # Generate output filename based on input filename
            output_filename = f"{input_file.stem}.csv"

            # Filter by year if requested
            if args.year_start is not None:
                output_dir = Path('data/filtered')
                if args.year_end is None:
                    print("Filtering data for years starting from", args.year_start)
                    processed_df = processed_df[processed_df['year'] >= args.year_start]
                    output_filename = f"{input_file.stem}_{args.year_start}-.csv"
                else:
                    if args.year_end >= args.year_start:
                        print("Filtering data for years between", args.year_start, "and", args.year_end)
                        processed_df = processed_df[
                            (processed_df['year'] >= args.year_start) & 
                            (processed_df['year'] <= args.year_end)
                        ]
                        output_filename = f"{input_file.stem}_{args.year_start}-{args.year_end}.csv"
                    else:
                        print("Error: --year-end must be greater than or equal to --year-start")
                        sys.exit(1)
            else:
                if args.year_end is not None:
                    output_dir = Path('data/filtered')
                    print("Filtering data for years up to", args.year_end)
                    processed_df = processed_df[processed_df['year'] <= args.year_end]
                    output_filename = f"{input_file.stem}_-{args.year_end}.csv"
            
            # Save the processed data
            preprocessor.save_processed_data(
                processed_df, 
                output_dir, 
                filename=output_filename,
                compress=args.compress
            )
            
            # Print detailed report if requested
            if args.report:
                preprocessor.print_quality_report(detailed=True)
                
        except Exception as e:
            print(f"Error processing {input_file}: {str(e)}")
            if not args.quiet:
                import traceback
                traceback.print_exc()