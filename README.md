# Research Grant Analytics Platform (RGAP)
## Subtitle: A Tri-Agency Funding Analytics Platform

## 1. Project Overview
RGAP is a comprehensive web-based analytics platform analyzing research funding data from Canada's three major research funding agencies: NSERC (Natural Sciences and Engineering Research Council), CIHR (Canadian Institutes of Health Research), and SSHRC (Social Sciences and Humanities Research Council). The platform leverages open data from Open Canada (https://search.open.canada.ca/grants), which provides detailed grant information from these agencies:

- NSERC: ~90,378 grant records
- CIHR: ~35,340 grant records
- SSHRC: ~44,398 grant records
Total Dataset: ~170,116 grants

The platform will provide researchers, administrators, and the public with insights into funding patterns, institutional success rates, and research investment trends across Canadian academic institutions.

### Key Focus Areas:
- Integration of tri-agency funding data (~170,000 grants)
- Cross-agency funding pattern analysis
- Geographical distribution of research funding
- Program-specific success metrics
- Institutional funding trajectories

## 2. Technology Stack
### Frontend:
- React 18+
- Tailwind CSS for styling
- Recharts/chart.js for data visualization
- React Query for data fetching

### Backend:
- Node.js + Express
- MySQL 8.0
- RESTful API design

### Development Tools:
- Git & GitHub
- npm for package management
- Docker for development environment
- Postman/Jest for testing

## 3. Project Structure
```
rgap/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── analytics/    # Data visualization components
│       │   ├── search/       # Search interface components
│       │   └── common/       # Shared components
│       ├── pages/
│       ├── services/
│       └── utils/
│
├── server/
│   ├── routes/
│   ├── db/
│   │   ├── migrations/       # Database migration scripts
│   │   └── seeds/            # Seeder scripts for sample data
│   ├── services/
│   └── config/
│
├── data/
│   ├── sample/               # Sample dataset files
│   └── production/           # Production dataset files
│
├── milestone-0/
│   ├── README.md
│   ├── report.pdf
│   ├── schema.sql
│   └── src/
│
├── milestone-1/
├── milestone-2/
├── milestone-3/
└── README.md
```

## 4. Features

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

## 5. Data Management

### Sample Dataset:
- 100 grants per agency
- 20 institutions
- 5 years of historical data
- Complete program coverage

### Production Dataset:
- Full tri-agency data (~170,000 grants)
- All Canadian institutions
- 10+ years of historical data
- Complete program listings

### Data Processing Pipeline:
1. Data extraction from Open Canada portal using their standardized grant data format
2. Agency-specific data parsing (NSERC, CIHR, SSHRC formats)
3. Data cleaning and normalization
3. Agency-specific transformations
4. Database loading and validation

## 6. Performance Optimization

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

## 7. Development Workflow

### Milestone Planning:
1. Milestone 0 (Setup & Planning)
   - Environment setup
   - Sample data processing
   - Basic connectivity testing

2. Milestone 1 (Core Implementation)
   - Database schema implementation
   - Basic search functionality
   - Initial visualizations

3. Milestone 2 (Feature Development)
   - Advanced search features
   - Analytics implementation
   - Performance optimization

4. Milestone 3 (Completion & Polish)
   - Advanced features
   - UI/UX refinement
   - Documentation completion

### Quality Assurance:
- Automated testing
- Performance benchmarking
- Security testing
- Cross-browser compatibility

## 8. Documentation
- Setup instructions
- API documentation
- Database schema documentation
- Feature guides
- Testing procedures