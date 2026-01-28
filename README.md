# RGAP (Research Grants Analytics Platform)

RGAP is a modern analytics platform designed to explore, visualize, and track research funding data from Canada's three major federal research funding agencies: **NSERC** (Natural Sciences and Engineering), **CIHR** (Health), and **SSHRC** (Social Sciences and Humanities).

This version represents a complete modernization of the platform, leveraging the latest web technologies including Next.js 16, React 19, and PostgreSQL 17 to deliver a high-performance, interactive data experience.

## Key Features

* **Comprehensive Data Access**: Search and analyze a dataset of over 193,000 research grants (as of 2026-01-24).
* **Advanced Analytics**: Visualize funding trends, distribution, and success rates using interactive charts.
* **Entity Discovery**: Deep dive into profiles for individual **Recipients** (Researchers) and **Institutes**.
* **User Accounts**: Secure authentication system allowing users to:
    * Save complex search queries.
    * Bookmark specific grants, recipients, and institutes.
    * Add personal notes to bookmarks.
    * View personalized search history.

## Tech Stack

### Core Framework
* **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
* **UI Components**: React 19, `react-icons`

### Data & State
* **Database**: [PostgreSQL 17](https://www.postgresql.org/)
* **Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
* **Visualization**: [Recharts](https://recharts.org/)

### Infrastructure & Tools
* **Containerization**: Docker & Docker Compose
* **Authentication**: Iron Session (Stateless session management) + Bcryptjs
* **Linting**: ESLint

## Getting Started

### Prerequisites

* [Docker Desktop](https://www.docker.com/products/docker-desktop)
* [Node.js 20+](https://nodejs.org/) (if running locally outside Docker)

### 1. Environment Setup

Clone the repository and create your environment file:

```bash
cp .env.example .env
```

Open `.env` and configure your local variables:

```bash
DATABASE_URL=postgresql://rgap_user:rgap_password@localhost:5432/rgap
SESSION_SECRET=complex_random_string_at_least_32_chars_long
RESEND_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Running with Docker (Recommended)

This will spin up the Next.js application, the PostgreSQL database, and PgAdmin.

```bash
docker-compose up --build
```

* **App**: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
* **PgAdmin**: [http://localhost:5050](https://www.google.com/search?q=http://localhost:5050) (Login: `admin@rgap.local` / `admin`)

> [!NOTE]
> The `docker-compose` setup automatically mounts `database/schema.sql` and `database/seeds/` to initialize the database on the first run.

### 3. Running Locally (Hybrid)

If you prefer to run the app on your host machine while keeping the database in Docker:

1. Start only the database services:
```bash
docker-compose up -d postgres
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

## Database Schema

The PostgreSQL database relies on a relational schema connecting:

* **Organizations**: NSERC, CIHR, SSHRC.
* **Programs**: Specific funding streams.
* **Recipients**: Researchers and organizations receiving funds.
* **Institutes**: Universities and research centers.
* **Grants**: The core record containing amounts, dates, and titles.

*Search is powered by PostgreSQL's Full Text Search (GIN indexes) and Trigram extensions (`pg_trgm`) for fuzzy matching.*

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes.
3. Push to the branch.
4. Open a Pull Request.
