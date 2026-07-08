# [ RGAP ] Research Grants Analytics Platform

[ RGAP ] is a modern analytics platform designed to explore, visualize, and track research funding data from Canada's three major federal research funding agencies: **NSERC** (Natural Sciences and Engineering), **CIHR** (Health), and **SSHRC** (Social Sciences and Humanities).

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

## Database Schema

The PostgreSQL database relies on a relational schema connecting:

* **Organizations**: NSERC, CIHR, SSHRC.
* **Programs**: Specific funding streams.
* **Recipients**: Researchers and organizations receiving funds.
* **Institutes**: Universities and research centers.
* **Grants**: The core record containing amounts, dates, and titles.

*Search is powered by PostgreSQL's Full Text Search (GIN indexes) and Trigram extensions (`pg_trgm`) for fuzzy matching.*

Schema changes are tracked as versioned migrations in [`supabase/migrations/`](supabase/migrations/) using the [Supabase CLI](https://supabase.com/docs/guides/cli), rather than applied ad hoc through the Supabase dashboard's SQL editor. To make a schema change:

```bash
npx supabase migration new some_change_name   # creates supabase/migrations/<timestamp>_some_change_name.sql
# edit the generated file
npx supabase db push --db-url "$DATABASE_URL" # applies it to the linked project
```

(`npx supabase db pull` / `db diff` / local dev via `supabase start` additionally require [Docker](https://docs.docker.com/desktop/).)

Row-Level Security is enabled on every table (see `supabase/migrations/20260708150000_enable_rls.sql`). This app connects directly as the Postgres table owner, which bypasses RLS by default, so this only blocks Supabase's PostgREST/GraphQL Data API -- which this app doesn't use.

The monthly data-refresh pipeline (`pipeline/fetch_and_load.py`) is separate from schema migrations: it re-runs `pipeline/reset_sequences.sql` (idempotent sequence sync) on every execution and loads data via `pipeline/01-load-data.sql`.

## Contributing

Contributions are welcome. This isn't set up as a self-hostable, drop-in-your-own-database product — the app connects to a single shared Supabase project — so to run it locally you'll need dev access to that project. Open an issue or reach out before starting work on anything non-trivial, then:

### Local dev environment

Requires [Node.js 20+](https://nodejs.org/).

```bash
cp .env.example .env
```

Fill in `.env` with the dev database connection string and other secrets (ask a maintainer for access), then:

```bash
npm install
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

### Making a schema change

See [Database Schema](#database-schema) above — write it as a `supabase/migrations/` file, don't apply it through the Supabase dashboard directly.

### Submitting a change

1. Create a feature branch (`git checkout -b feature/amazing-feature`).
2. Commit your changes.
3. Push to the branch.
4. Open a Pull Request.
