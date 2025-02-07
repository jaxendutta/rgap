# RGAP Frontend Setup Documentation

## Initial Setup

1. Create the frontend directory and initialize with Vite:
    ```bash
    cd rgap
    npm create vite@latest client -- --template react-ts
    cd client
    npm install
    ```

2. Install Tailwind CSS and its dependencies:
    ```bash
    npm install -D tailwindcss postcss autoprefixer
    npx tailwindcss init -p
    ```

3. Install core dependencies:
   ```bash
   # UI and Components
   npm install @headlessui/react lucide-react
   npm install react-router-dom
   npm install @tanstack/react-query
   npm install axios
   npm install recharts
   npm install clsx
   npm install date-fns

   # Development utilities
   npm install -D @types/node
   ```

## Directory Structure
Created the following directory structure:
```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── common/
│   ├── grants/
│   ├── recipients/
│   ├── search/
│   └── analytics/
├── features/
│   ├── auth/
│   ├── grants/
│   ├── recipients/
│   ├── search/
│   └── analytics/
├── hooks/
├── lib/
├── pages/
├── services/
├── types/
└── utils/
```

## Configuration Files

1. Updated `tailwind.config.js` with:
   - Custom color schemes for agencies (NSERC, SSHRC, CIHR)
   - Basic theme extensions
   - Content paths configuration

2. Updated `vite.config.ts` (using default configuration)

3. Added Tailwind directives to `src/index.css`:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;
    ```

## Current Component Structure

### Layout Components (`src/components/layout/`)

1. `MainLayout.tsx`: 
   - Main wrapper component
   - Combines Header, Sidebar, and main content area

2. `Header.tsx`:
   - Sleek top navigation with:
     - RGAP branding with subtitle
     - Enhanced search bar with:
       - Save search button (BookmarkPlus)
       - Sort button (SortDesc)
       - Filter button with dropdown
     - Profile and notification icons

3. `Sidebar.tsx`:
   - Collapsible navigation sidebar
   - Fixed-position icons with expanding text labels
   - Navigation items:
     - Home
     - Search
     - Grants
     - Institutes
     - Recipients
     - Analytics
     - Bookmarks

### Pages (`src/pages/`)

1. Core Pages:
   - `HomePage.tsx` - Welcome page
   - `SearchPage.tsx` - Advanced search interface
   - `GrantsPage.tsx` - Grant browsing/listing
   - `InstitutesPage.tsx` - Research institutes overview
   - `RecipientsPage.tsx` - Recipients listing
   - `AnalyticsPage.tsx` - Analytics dashboard
   - `BookmarksPage.tsx` - Tabbed bookmarks interface with:
     - Grants tab
     - Research Institutes tab
     - Recipients tab
     - Searches tab

## Key UI Improvements

1. Sidebar Enhancements:
   - Smooth collapse/expand on hover
   - Fixed icon positioning
   - Black background for active page (improved contrast)
   - Clear visual hierarchy

2. Header Refinements:
   - Integrated search actions (save, sort, filter)
   - Clean alignment and spacing
   - Consistent icon usage

3. Bookmarks Interface:
   - Tab-based navigation
   - Icon + text labels for each category
   - Clean transitions between sections

## Component Features

1. Navigation System:
    ```typescript
    const navigation = [
      { name: 'Home', icon: Home, href: '/' },
      { name: 'Search', icon: Search, href: '/search' },
      { name: 'Grants', icon: Database, href: '/grants' },
      { name: 'Institutes', icon: University, href: '/institutes' },
      { name: 'Recipients', icon: GraduationCap, href: '/recipients' },
      { name: 'Analytics', icon: BarChart2, href: '/analytics' },
      { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' }
    ]
    ```

2. Bookmarks Tabs:
    ```typescript
    const tabs = [
      { name: 'Grants', icon: Database },
      { name: 'Research Institutes', icon: University },
      { name: 'Recipients', icon: GraduationCap },
      { name: 'Searches', icon: Search }
    ]
    ```

## Routing Structure

Updated `App.tsx` with routes:
```typescript
<Routes>
<Route path="/" element={<HomePage />} />
<Route path="/search" element={<SearchPage />} />
<Route path="/grants" element={<GrantsPage />} />
<Route path="/institutes" element={<InstitutesPage />} />
<Route path="/recipients" element={<RecipientsPage />} />
<Route path="/analytics" element={<AnalyticsPage />} />
<Route path="/bookmarks" element={<BookmarksPage />} />
</Routes>
```

## Icons & UI Elements

Using `lucide-react` for consistent iconography:
- Navigation icons: Home, Search, Database, University, etc.
- Action icons: Bell, User, Filter, SortDesc, BookmarkPlus
- Tab icons: Database, University, GraduationCap, Search

## Running the Project

1. Development:
   ```bash
   cd rgap/client
   npm i
   npm run dev
   ```

2. Build:
   ```bash
   npm run build
   ```
