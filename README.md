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
* **Database Hosting**: [Supabase](https://supabase.com/) (managed PostgreSQL)
* **Deployment**: [Vercel](https://vercel.com/)
* **Authentication**: Iron Session (Stateless session management) + Bcryptjs
* **Linting**: ESLint

## Getting Started

### Prerequisites

* [Node.js 20+](https://nodejs.org/)
* Access to the project's [Supabase](https://supabase.com/) database (connection string)

### 1. Environment Setup

Clone the repository and create your environment file:

```bash
cp .env.example .env
```

Open `.env` and configure your local variables:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
SESSION_SECRET=complex_random_string_at_least_32_chars_long
RESEND_API_KEY=your_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install & Run

```bash
npm install
npm run dev
```

* **App**: [http://localhost:3000](http://localhost:3000)

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
