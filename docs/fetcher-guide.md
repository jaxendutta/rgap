# RGAP Data Fetcher Documentation

The `fetcher.py` script is a powerful tool for retrieving, processing, and analyzing research grant data from Canada's tri-agency funding sources (NSERC, CIHR, SSHRC). This document provides a comprehensive guide to using the script and understanding its capabilities.

## Overview

`fetcher.py` is responsible for:

1. Fetching grant data from the Government of Canada's Open Data Portal
2. Processing and normalizing the data
3. Generating analytical reports
4. Saving the data in formats ready for database import

## Prerequisites

Before using the fetcher, ensure you have:

-   Python 3.8 or higher
-   Required Python packages:
    -   pandas
    -   requests
    -   tqdm
    -   numpy
-   7zip (optional, for better data compression)

You can install the required Python packages using:

```bash
pip install pandas requests tqdm numpy
```

## Basic Usage

The simplest way to use the fetcher is:

```bash
python fetcher.py --year-start 2019
```

This fetches all tri-agency grants from 2019 and saves them to the `data/processed/` directory.

To fetch all data:

```bash
python fetcher.py
```

## Command-Line Options

The fetcher supports the following command-line arguments:

| Argument          | Description                                   | Default            | Example             |
| ----------------- | --------------------------------------------- | ------------------ | ------------------- |
| `--year-start`    | Starting year for data fetch (required)       | None               | `--year-start 2019` |
| `--year-end`      | Ending year for data fetch                    | Same as year-start | `--year-end 2023`   |
| `--force-refresh` | Force a fresh data collection                 | False              | `--force-refresh`   |
| `--show`          | Show analysis results                         | False              | `--show`            |
| `--top`           | Number of top recipients to display           | 10                 | `--top 20`          |
| `--save`          | Save the year range data to a separate file   | False              | `--save`            |
| `--agency`        | Specific agency to fetch (NSERC, SSHRC, CIHR) | All agencies       | `--agency NSERC`    |
| `--compress`      | Compress output files using specified method  | None               | `--compress 7z`     |
| `--verbose`       | Enable verbose output                         | False              | `--verbose`         |

## Examples

### Fetch Data for a Specific Year Range

```bash
python fetcher.py --year-start 2018 --year-end 2023 --save
```

This fetches all grant data from 2018 to 2023 and saves it to a separate file.

### Fetch Data for a Specific Agency

```bash
python fetcher.py --year-start 2020 --agency NSERC --save
```

This fetches only NSERC grants from 2020 and saves them to a separate file.

### Refresh Data and Show Analysis

```bash
python fetcher.py --year-start 2019 --force-refresh --show
```

This forces a fresh download of all 2019 grant data and displays analysis results.

### Compress Output with 7zip

```bash
python fetcher.py --year-start 2019 --year-end 2023 --compress 7z
```

This fetches grant data from 2019 to 2023 and compresses it using 7zip for better compression.

## Data Analysis Capabilities

The fetcher includes built-in data analysis features that can be accessed using the `--show` flag. These analyses include:

### 1. Organization Summary

A breakdown of grants by funding agency, including:

-   Total number of grants
-   Total funding amount
-   Average grant value
-   Median grant value
-   Number of unique recipients

### 2. Provincial Distribution

A summary of funding distribution by province/state, including:

-   Total funding by province/state for each agency
-   Percentage distribution across agencies
-   Regional funding patterns

### 3. Top Recipients Analysis

An analysis of top grant recipients, including:

-   Recipient names
-   Total funding received
-   Number of agreements
-   Average grant value
-   Funding agencies

### 4. Funding Range Distribution

A breakdown of grants by funding amount, categorized into ranges:

-   0-10K
-   10K-50K
-   50K-100K
-   100K-500K
-   500K+

## Data Processing Features

The fetcher includes several data processing capabilities:

### Dataset Update Checking

The script checks if the dataset has been updated since your last download and informs you if a fresh download is necessary.

### Parallel Processing

Data is fetched from all three agencies simultaneously using parallel processing for efficiency.

### Automatic Data Cleaning

The script performs several data cleaning operations:

-   Fixing missing research organization names
-   Handling encoding issues in the CSV data
-   Normalizing funding amounts
-   Converting dates to consistent formats

### Smart Institution Detection

The `is_likely_institution` function identifies when a recipient name likely refers to an institution, helping to fill in missing research organization data.

### Data Compression

The script supports data compression to reduce disk usage:

-   Gzip compression (built-in)
-   7zip compression (if installed, provides better compression ratios)

## Advanced Features

### Handling Amendments

Grant amendments (changes to existing grants) can be handled in three ways:

-   `latest`: Keep only the latest amendment for each grant (default)
-   `all`: Keep all amendments
-   `none`: Keep only original grants, no amendments

Example:

```bash
python fetcher.py --year-start 2019 --agency CIHR --handle-amendments all
```

### Customizing Analysis

You can customize the number of top recipients shown in the analysis:

```bash
python fetcher.py --year-start 2019 --show --top 25
```

This shows the top 25 recipients instead of the default 10.

## Output Files

The fetcher creates several types of output files:

### Master Dataset

A complete dataset of all fetched records:

```
data/processed/data_TIMESTAMP.csv
```

### Year-Specific Datasets

Datasets filtered for specific year ranges:

```
data/processed/data_TIMESTAMP_YEAR_RANGE.csv
```

### Metadata

Information about the dataset:

```
data/processed/dataset_metadata.json
```

### Compressed Files

Compressed versions of the datasets (if compression is enabled):

```
data/processed/data_TIMESTAMP.csv.gz
data/processed/data_TIMESTAMP.7z
```

## Integration with RGAP

After fetching data, you can import it into the RGAP database using:

```bash
./setup_db.sh --full
```

This imports the most recent dataset file from the `data/processed/` directory.

## Troubleshooting

### Connection Issues

If you encounter connection problems with the API:

```bash
# Try with --verbose for more details
python fetcher.py --year-start 2019 --verbose
```

### Data Format Issues

If the data format has changed or there are parsing issues:

```bash
# Force a fresh download
python fetcher.py --year-start 2019 --force-refresh
```

### Memory Errors

For large datasets, you might encounter memory issues. Try:

```bash
# Fetch data for a single year at a time
python fetcher.py --year-start 2019 --save
python fetcher.py --year-start 2020 --save
```

## Technical Details

### Data Source

The script fetches data from the Government of Canada's Open Data Portal:

-   Dataset ID: `432527ab-7aac-45b5-81d6-7597107a7013`
-   Resource ID: `1d15a62f-5656-49ad-8c88-f40ce689d831`

### Agency Mapping

The script maps agency codes to their common names:

-   `nserc-crsng` → NSERC
-   `sshrc-crsh` → SSHRC
-   `cihr-irsc` → CIHR

### Data Structure

The fetched data includes numerous fields, including:

-   Reference numbers and amendments
-   Recipient information
-   Agreement details (value, dates, title)
-   Program information
-   Geographic data
-   Funding agency details

## Best Practices

1. **Check for Updates Regularly**: Run the fetcher periodically to get the latest data
2. **Use Year Filtering**: Limit data to the years you need for faster processing
3. **Save Individual Year Data**: Use `--save` to create year-specific files for easier handling
4. **Compress Large Datasets**: Use `--compress 7z` for efficient storage of large datasets
5. **Monitor API Limits**: Be aware of potential rate limiting on the data source API

## Extending the Fetcher

The fetcher is designed to be extensible. Here are some ways you might extend it:

1. Add new analysis methods by creating additional functions in the `Fetcher` class
2. Add support for additional data sources
3. Implement more advanced data cleaning algorithms
4. Add export formats (e.g., Excel, JSON)
5. Create visualization outputs directly from the fetcher

To extend the fetcher, examine the class structure and add your methods following the existing patterns.
