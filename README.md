# Research Grant Analytics Platform (RGAP)
<img src="client/public/rgap.svg" alt="RGAP Logo" width="200" height="200">

## Table of Contents
- [Research Grant Analytics Platform (RGAP)](#research-grant-analytics-platform-rgap)
  - [Table of Contents](#table-of-contents)
  - [Project Overview](#project-overview)
    - [Key Focus Areas](#key-focus-areas)
  - [Documentation](#documentation)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Development Tools](#development-tools)
  - [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Data Fetch and App Setup](#data-fetch-and-app-setup)
  - [Features](#features)
    - [Basic Features:](#basic-features)
    - [Advanced Features:](#advanced-features)
  - [Data Management](#data-management)
    - [Sample Dataset:](#sample-dataset)
    - [Production Dataset:](#production-dataset)
    - [Data Processing Pipeline:](#data-processing-pipeline)
  - [Performance Optimization](#performance-optimization)
    - [Database Level:](#database-level)
    - [Application Level:](#application-level)

## Project Overview
RGAP is a comprehensive web-based analytics platform analyzing research funding data from Canada's three major research funding agencies: NSERC (Natural Sciences and Engineering Research Council), CIHR (Canadian Institutes of Health Research), and SSHRC (Social Sciences and Humanities Research Council). The platform leverages open data from Open Canada (https://search.open.canada.ca/grants), which provides detailed grant information from these agencies:

- NSERC: 136,034+ grant records
- CIHR: 39,768+ grant records
- SSHRC: 55,808+ grant records
Total Dataset: 231,610+ grants

The platform will provide researchers, administrators, and the public with insights into
funding patterns, institutional success rates, and research investment trends across Canadian academic institutions.

### Key Focus Areas
- Integration of tri-agency funding data
- Cross-agency funding pattern analysis
- Geographical distribution of research funding
- Program-specific success metrics
- Institutional funding trajectories

## Documentation

- [Installation Guide](docs/installation.md)
- [User Guide](docs/user-guide.md)
- [Developer Guide](docs/developer-guide.md)
- [API Reference](docs/api-reference.md)
- [Data Documentation](docs/data-guide.md)
- [Data Fetcher Guide](docs/fetcher-guide.md)
- [MySQL for RGAP Guide](docs/mysql-rgap-guide.md)
- [Troubleshooting](docs/troubleshooting.md)

## Technology Stack
### Frontend
- React 18.2.0+
- Tailwind CSS for styling
- Recharts/chart.js for data visualization
- React Query for data fetching

### Backend
- Node.js + Express
- MySQL 8.0.36
- RESTful API design

### Development Tools
- Git & GitHub
- npm for package management
- Docker for development environment

## Quick Start

### Prerequisites

- Node.js 22.14.0+
- MySQL 8.0.36+
- Python 3.12.7+ (for data fetching)
- 7zip (optional, for better data compression)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/jaxendutta/rgap.git
   cd rgap
   ```

2. Set up environment variables and packages
   ```bash
   source setup_env.sh
   ```

3. Run the MySQL setup script
   ```bash
   ./setup_mysql.sh
   ```
4. Start the application
   ```bash
   ./setup_app.sh
   ```

This will:
- Set up a local MySQL instance
- Install dependencies for server and client
- Create database schema and import sample data
- Start the server and client applications

The setup will display URLs for accessing the application, typically:
- Client: http://localhost:3000
- Server: http://localhost:4000

## Data Fetch and App Setup

RGAP comes with sample data, but you can import the full dataset:

```bash
# Fetch data from the tri-agency sources
python fetcher.py --year-start 2019 --year-end 2023 --save

# Import the downloaded data
./setup_app.sh --full
```

## Features

### Basic Features:

1. Comprehensive Grant Search
   - Multi-agency search capability
   - Filter by program, date range, amount
   - Advanced filtering options (institution, location)

2. Institution Analytics
   - Funding history visualization
   - Success rate analysis
   - Program participation metrics

3. Program Analysis
   - Success rates by program
   - Funding distribution analysis
   - Year-over-year comparisons

4. Geographic Distribution
   - Provincial funding distribution
   - Institution concentration analysis
   - Regional success rates

5. Temporal Analysis
   - Funding trends over time
   - Seasonal pattern analysis
   - Multi-year grant tracking

### Advanced Features:

1. Cross-Agency Analytics
   - Comparative funding analysis
   - Inter-agency program relationships
   - Combined success metrics

2. Machine Learning Insights
   - Funding success prediction
   - Pattern recognition
   - Anomaly detection

3. Custom Report Generation
   - Configurable metrics
   - Multiple export formats
   - Scheduled reports

4. Research Network Analysis
   - Institution collaboration patterns
   - Research field clustering
   - Geographic collaboration mapping

5. Program Impact Metrics
   - Outcome tracking
   - ROI analysis
   - Success indicator monitoring

## Data Management

### Sample Dataset:
- 100 grants per agency
- 20 institutions
- 5 years of historical data
- Complete program coverage

### Production Dataset:
- Full tri-agency data (231K+ grants)
- All Canadian institutions
- 25+ years of historical data
- Complete program listings

### Data Processing Pipeline:
1. Data extraction from Open Canada portal using their standardized grant data format
2. Agency-specific data parsing (NSERC, CIHR, SSHRC formats)
3. Data cleaning and normalization
3. Agency-specific transformations
4. Database loading and validation

## Performance Optimization

### Database Level:
- Indexed queries for common searches
- Materialized views for analytics
- Partitioning for historical data
- Query optimization for large datasets

### Application Level:
- Client-side caching
- Server-side response caching
- Pagination for large result sets
- Lazy loading of components
