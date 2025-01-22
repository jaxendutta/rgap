# Guide to Using the Tri-Agency Data Fetcher

This notebook demonstrates how to use the Tri-Agency Data Fetcher to access and analyze grant data from NSERC, SSHRC, and CIHR.

## Basic Setup

```python
# Initialize fetcher with default settings (minimal output)
fetcher = Fetcher()

# Or initialize with verbose output to see progress
fetcher_verbose = Fetcher(FetcherConfig(verbose=True))
```

## Fetching Data

### Basic Usage (Default Settings)
```python
# Keeps only latest amendment version
grants_df = fetcher.fetch_all_orgs(
    year="2019",
    verify_ssl=False  # Use if getting SSL verification errors
)
```

### Alternative Amendment Handling
```python
# Keep all amendments
grants_all = fetcher.fetch_all_orgs(
    year="2019",
    verify_ssl=False,
    handle_amendments='all'
)

# Keep only original grants (no amendments)
grants_original = fetcher.fetch_all_orgs(
    year="2019",
    verify_ssl=False,
    handle_amendments='none'
)
```

## Analyzing Data

### Built-in Analysis
```python
if not grants_df.empty:
    analysis_results = fetcher.analyze_grants(grants_df)
```

This will show:
- Summary by agency (counts, totals, averages)
- Provincial distribution
- Top 10 recipients
- Funding range distribution

### Custom Analysis Examples

1. Total funding by organization:
```python
org_totals = grants_df.groupby('org')['agreement_value'].agg(['sum', 'count'])
display(org_totals)
```

2. Average grant value by province:
```python
province_avg = grants_df.groupby('recipient_province')['agreement_value'].mean()
display(province_avg)
```

3. Temporal distribution:
```python
grants_df['month'] = pd.to_datetime(grants_df['agreement_start_date']).dt.month
monthly_dist = grants_df.groupby(['org', 'month'])['agreement_value'].count()
display(monthly_dist)
```

## Common Issues & Solutions

1. SSL Verification Errors
   - Use `verify_ssl=False` when calling `fetch_all_orgs()`

2. Progress Monitoring
   - Initialize fetcher with `verbose=True` to see progress
   - Example: `fetcher = Fetcher(FetcherConfig(verbose=True))`

3. Amendment Handling
   - `'latest'`: Only most recent version of each grant (default)
   - `'all'`: All versions including amendments
   - `'none'`: Only original grants, no amendments

## Available Fields

The returned DataFrame includes these main fields:
- `ref_number`: Unique reference number for each grant
- `agreement_start_date`: Start date of the grant
- `agreement_end_date`: End date of the grant
- `agreement_value`: Dollar value of the grant
- `amendment_number`: Amendment version (if any)
- `recipient_legal_name`: Name of recipient
- `recipient_province`: Province of recipient
- `org`: Funding organization (NSERC, SSHRC, CIHR)
- `year`: Fiscal year of the grant