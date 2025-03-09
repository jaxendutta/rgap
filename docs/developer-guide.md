# RGAP Developer Guide

This guide provides technical information for developers who want to extend, modify, or contribute to the Research Grant Analytics Platform (RGAP).

## Project Architecture

RGAP uses a modern full-stack JavaScript architecture:

### Frontend

- **Framework**: React 18 with TypeScript
- **Routing**: React Router 6
- **State Management**: React Query for server state, React Context for UI state
- **Styling**: TailwindCSS with custom components
- **Building**: Vite
- **Key Libraries**: 
  - Recharts for data visualization
  - Framer Motion for animations
  - Lucide React for icons
  - React Hook Form for form handling

### Backend

- **Framework**: Express.js with Node.js
- **Database**: MySQL 8
- **API**: RESTful API with JSON
- **Authentication**: JWT-based authentication
- **Error Handling**: Centralized error middleware
- **Key Libraries**:
  - MySQL2 for database access
  - Bcrypt for password hashing
  - Cors for cross-origin resource sharing

### Data Processing

- **Language**: Python 3
- **Key Libraries**:
  - Pandas for data manipulation
  - Requests for API calls
  - 7zip for compression

## Project Structure

```
rgap/
├── client/             # Frontend React application
├── server/             # Backend Express application
├── config/             # Configuration files
├── data/               # Data files
│   ├── raw/            # Raw data from source
│   ├── processed/      # Processed data ready for import
│   └── sample/         # Sample data for quick setup
├── docs/               # Documentation
├── sql/                # SQL files for database setup
│   ├── init/           # Database initialization
│   ├── schema/         # Schema definition
│   ├── data/           # Data manipulation
│   ├── sp/             # Stored procedures
│   └── indexes/        # Index creation
└── [setup scripts]     # Automation scripts
```

## Setting Up Development Environment

### Prerequisites

Follow the [Installation Guide](installation.md) to set up the base environment.

### Development Mode

For active development, you'll want to run the client and server separately:

#### Server

```bash
cd server
npm install
npm run dev
```

#### Client

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in both client and server directories for development:

#### Server `.env`
```
PORT=4000
DB_HOST=localhost
DB_PORT=5000
DB_USER=rgap_user
DB_PASSWORD=12345
DB_NAME=rgap
NODE_ENV=development
```

#### Client `.env`
```
VITE_API_URL=http://localhost:4000
```

## Key Components

### Client Components

- **Features**: Reusable domain-specific components
  - `grants/`: Grant-related components
  - `recipients/`: Recipient-related components
  - `institutes/`: Institute-related components
  - `search/`: Search-related components
  - `filter/`: Filter-related components
  - `visualizations/`: Chart and graph components

- **Common**: Shared UI components
  - `ui/`: Basic UI elements (buttons, cards, etc.)
  - `layout/`: Page layout components
  - `pages/`: Page templates

### Server Components

- **Routes**: API endpoints
  - `authRoutes.js`: Authentication endpoints
  - `searchRoutes.js`: Search endpoints
  - `grantRoutes.js`: Grant endpoints
  - `recipientRoutes.js`: Recipient endpoints
  - `instituteRoutes.js`: Institute endpoints

- **Controllers**: Business logic
  - `authController.js`: Authentication logic
  - `searchController.js`: Search logic
  - `recipientController.js`: Recipient logic
  - `instituteController.js`: Institute logic

- **Config**: Server configuration
  - `db.js`: Database configuration

## Database Schema

RGAP uses a relational database with the following key tables:

- `User`: User accounts and authentication
- `Institute`: Research institutions
- `Recipient`: Grant recipients
- `ResearchGrant`: Grant details and funding
- `Program`: Research program information
- `Organization`: Funding agency information
- `SearchHistory`: User search history
- `BookmarkedGrants`: User grant bookmarks
- `BookmarkedRecipients`: User recipient bookmarks

See `sql/schema/*.sql` files for detailed schema definitions.

## API Reference

See the [API Reference](api-reference.md) for detailed endpoint documentation.

## Testing

### Client Testing

```bash
cd client
npm run test
```

### Server Testing

```bash
cd server
npm run test
```

## Data Processing

RGAP includes a Python-based data processor (`fetcher.py`) that:

1. Downloads data from the tri-agency APIs
2. Processes and normalizes the data
3. Saves the processed data for import

To add or modify data processing:

1. Update the `fetcher.py` script
2. Run the script to generate new processed data
3. Update the SQL import scripts if schema changes are required

## Contributing Guidelines

1. **Fork the repository**: Create a fork of the main repository
2. **Create a feature branch**: Use a descriptive name (`feature/new-visualization`)
3. **Follow style guides**: 
   - Use ESLint and Prettier for JavaScript/TypeScript
   - Follow PEP 8 for Python code
4. **Write tests**: Add tests for new features
5. **Update documentation**: Add or update documentation
6. **Submit pull request**: Include a clear description of the changes

## Build and Deployment

### Production Build

#### Client
```bash
cd client
npm run build
```

#### Server
```bash
cd server
npm run build
```

### Deployment Options

- **Docker**: Use the provided Dockerfiles for containerized deployment
- **Traditional**: Deploy client as static assets and server as a Node.js application
- **Database**: Set up a production MySQL database

See separate deployment documentation for detailed instructions.

## Performance Considerations

- The database is optimized for search operations with appropriate indexes
- Client-side visualizations are optimized for large datasets
- Consider using pagination for large result sets
- Monitor server memory usage with full datasets

## Resources

- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Express Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)