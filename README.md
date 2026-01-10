Perfect! You've got the official Next.js starter. Now let's merge in the RGAP-specific files I created. Here's exactly what to do:

## 🎯 Step-by-Step Integration Guide

### 1️⃣ First, Install Additional Dependencies

Your Next.js has the basics, but we need a few more packages:

```bash
cd rgap-v2

npm install @tanstack/react-query pg bcryptjs iron-session zod clsx tailwind-merge lucide-react recharts date-fns

npm install -D @types/bcryptjs @types/pg
```

### 2️⃣ Replace/Update Configuration Files

**Replace these files** with mine (from the download):

```bash
# Configuration files - Replace
✅ tailwind.config.js      # Replace (mine has custom colors)
✅ .gitignore              # Replace (mine has more entries)
✅ .env.example            # Add new (yours doesn't have this)
✅ .env.local              # Add new (for local development)

# Keep yours, don't replace:
❌ package.json            # Keep yours (you already installed deps)
❌ next.config.ts          # Keep yours (theirs is fine)
❌ tsconfig.json           # Keep yours (theirs is fine)
❌ eslint.config.mjs       # Keep yours (theirs is fine)
❌ postcss.config.mjs      # Keep yours (theirs is fine)
```

### 3️⃣ Set Up Directory Structure

Create the RGAP-specific folders:

```bash
# From your rgap-v2 directory:

mkdir -p database/seeds
mkdir -p scripts
mkdir -p src/components/{ui,features,layout}
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/hooks
mkdir -p src/app/api/{auth,grants,recipients,institutes,bookmarks}
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(dashboard\)/{search,institutes,recipients,bookmarks}
```

### 4️⃣ Move Next.js Default Files

Next.js created files in `app/`, but we want them in `src/app/`:

```bash
# Create src directory
mkdir -p src

# Move the app directory into src
mv app src/

# Your structure should now be:
# ├── src/
# │   └── app/
# │       ├── favicon.ico
# │       ├── globals.css
# │       ├── layout.tsx
# │       └── page.tsx
```

### 5️⃣ Copy My Files Into Your Project

From the **rgap-v2** folder I gave you, copy these into your fresh Next.js project:

```bash
# Database
📁 database/schema.sql           → Copy to your project's database/

# Core Libraries
📁 src/lib/db.ts                 → Copy to src/lib/
📁 src/lib/session.ts            → Copy to src/lib/
📁 src/lib/utils.ts              → Copy to src/lib/

# TypeScript Types
📁 src/types/database.ts         → Copy to src/types/

# UI Components
📁 src/components/ui/Button.tsx  → Copy to src/components/ui/
📁 src/components/ui/Card.tsx    → Copy to src/components/ui/

# API Routes
📁 src/app/api/health/route.ts          → Copy to src/app/api/health/
📁 src/app/api/grants/search/route.ts   → Copy to src/app/api/grants/search/

# Scripts
📁 scripts/setup.js              → Copy to scripts/

# Docker
📁 docker-compose.yml            → Copy to root

# Documentation
📁 README.md                     → Replace your default README
📁 QUICKSTART.md                 → Copy to root
📁 MIGRATION.md                  → Copy to root
📁 PROJECT_SUMMARY.md            → Copy to root
```

### 6️⃣ Update Your Files

**A. Update `src/app/layout.tsx`** - Replace with this:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RGAP - Research Grant Analytics Platform',
  description: 'Comprehensive analytics platform for Canadian research grants from NSERC, CIHR, and SSHRC',
  keywords: ['research grants', 'NSERC', 'CIHR', 'SSHRC', 'Canada', 'funding', 'analytics'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**B. Create `src/app/providers.tsx`** - New file:

```tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**C. Update `src/app/globals.css`** - Replace with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
  min-height: 100vh;
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**D. Update `src/app/page.tsx`** - Replace with:

```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-24">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Research Grant Analytics Platform
        </h1>
        
        <p className="text-xl text-gray-600">
          Comprehensive analytics for Canadian research grants from NSERC, CIHR, and SSHRC
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/dashboard"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          
          <Link
            href="/auth/login"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Comprehensive Data</h3>
            <p className="text-gray-600">
              Access to 230,000+ grant records from Canada's three major funding agencies
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">
              Powerful search, filtering, and visualization tools for funding insights
            </p>
          </div>
          
          <div className="p-6 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Track & Compare</h3>
            <p className="text-gray-600">
              Bookmark grants and compare funding across institutions and programs
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
```

**E. Update `tailwind.config.js`** - Replace the whole file:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
```

**F. Update `tsconfig.json`** - Just add the paths mapping:

In your existing `tsconfig.json`, find `"compilerOptions"` and add this inside it:

```json
{
  "compilerOptions": {
    // ... existing options ...
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 7️⃣ Create Environment Files

Create `.env.local` in your project root:

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://rgap_user:rgap_password@localhost:5432/rgap

# Session Secret
SESSION_SECRET=development-secret-key-change-in-production

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Create `.env.example` (same content, for Git):

```bash
# Database (PostgreSQL)
DATABASE_URL=postgresql://rgap_user:rgap_password@localhost:5432/rgap

# Session Secret (generate a random string for production)
SESSION_SECRET=your-super-secret-key-change-this-in-production

# Application
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 8️⃣ Test It!

```bash
# Start database
docker compose up -d

# Wait 10 seconds for DB to initialize, then:
npm run dev
```

Visit:
- **http://localhost:3000** - Should see your homepage ✅
- **http://localhost:3000/api/health** - Should see health check ✅
- **http://localhost:3000/api/grants/search** - Should see empty results ✅

## 📋 Quick Checklist

After following above:

- [ ] Dependencies installed
- [ ] `src/` directory created
- [ ] `app/` moved to `src/app/`
- [ ] All my files copied to correct locations
- [ ] Updated layout.tsx, page.tsx, globals.css
- [ ] Created providers.tsx
- [ ] Updated tailwind.config
- [ ] Added paths to tsconfig.json
- [ ] Created .env.local and .env.example
- [ ] docker-compose.yml in root
- [ ] Database starts (`docker compose up -d`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Homepage loads
- [ ] API health check works

## 🎯 Your Final Structure Should Look Like:

```
rgap-v2/
├── database/
│   └── schema.sql
├── public/
├── scripts/
│   └── setup.js
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/route.ts
│   │   │   └── grants/search/route.ts
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── session.ts
│   │   └── utils.ts
│   └── types/
│       └── database.ts
├── .env.local
├── .env.example
├── docker-compose.yml
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.js
└── README.md
```

## ✅ Done!

Once you've done all this, you'll have a clean, working Next.js + PostgreSQL app ready for your RGAP components!

**What's your next question - which files to copy first from your old project?** 🚀