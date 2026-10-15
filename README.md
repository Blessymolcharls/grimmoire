# Grimmoire — The Hogwarts Library

> *"Every book is a world you have visited, a memory engraved in parchment, and a flame against the dark."*

[![CI](https://github.com/Blessymolcharls/grimmoire/actions/workflows/ci.yml/badge.svg)](https://github.com/Blessymolcharls/grimmoire/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?logo=prisma)
![Vitest](https://img.shields.io/badge/Vitest-5.0.3-6E9F18?logo=vitest)

**Grimmoire: The Hogwarts Library** is an atmospheric, production-grade personal digital library, knowledge archive, and reading chronicle designed as a living castle archive. Rather than presenting a generic CRUD dashboard, Grimmoire immerses scholars in the aesthetic of a gothic castle library—featuring realistic 2D wooden bookshelves, gold-foil book spines, a two-page manuscript reader, Open Library book discovery, an astronomical reading observatory, thematic magical departments, excerpted quotes, a parchment reading journal, and versioned archive backup and restoration.

---

## ✦ Key Features

- **The Entrance (`/`)**: Atmospheric castle landing with real database statistics (tomes shelved, pages absorbed, average rating, reading streak), quick actions, and recently visited worlds.
- **My Shelves (`/library`)**: A tactile 2D wooden bookshelf environment (`Sanctum Bibliotheca`) featuring deterministic spine dimensions and colors, gold foil titles, hover elevation, keyboard navigation, and an open tome modal. Supports department filtering, reading status filtering, instant search, and sorting.
- **Open Tome Manuscript (`/books/[id]`)**: Two-page open manuscript layout with literary metadata on the left and personal reading records, quotes, sessions, and reflections on the right.
- **Discover Tomes (`/discover`)**: Debounced external search with request cancellation against the Open Library Search and Covers API, curated starter recommendations, and manual tome scribing.
- **Magical Departments (`/departments`)**: 9 documented castle departments (*Charms*, *Potions*, *Defense Against the Dark Arts*, *Divination*, *History of Magic*, *Transfiguration*, *Care of Magical Creatures*, *Astronomy Tower*, *Restricted Section*) with many-to-many book assignments and custom department creation.
- **Reading Journal (`/journal`)**: Intimate chronicle for reflections, memories, and reading notes linked to specific library volumes.
- **The Observatory (`/observatory`)**: Celestial analytics dashboard displaying annual reading goals, monthly completion charts, page metrics, and department distributions derived strictly from persisted data.
- **Library Settings & Backups (`/settings`)**: Scholar profile, annual reading goal configurator, storage architecture overview, complete versioned JSON archive export (`v1.0.0`), and safe archive restoration with dry-run preview and duplicate protection.
- **Graceful Error Recovery & 404**: Atmospheric castle-themed error boundary (`app/error.tsx`) and custom 404 screen (`app/not-found.tsx`).

---

## ✦ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server & Client Components)
- **UI & Styling**: React 19, Tailwind CSS v4, Google Fonts (`Cinzel` & `Plus Jakarta Sans`)
- **Animation & FX**: Framer Motion (`useReducedMotion` support), `canvas-confetti`
- **Icons**: Lucide React
- **Validation**: Zod (runtime validation at all API boundaries and backup imports)
- **Database & ORM**: Prisma ORM with dual-engine configuration:
  - **Local Development**: SQLite (`dev.db`) running zero-config out of the box
  - **Hosted Production**: PostgreSQL (`prisma/schema.postgresql.prisma`) for Supabase, Neon, Railway, or AWS RDS
- **Testing & Quality**: Vitest unit test suite (29 tests), ESLint 9, strict TypeScript, GitHub Actions CI

---

## ✦ Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v20.x` or higher
- npm `v10.x` or higher

### 2. Installation
```bash
git clone https://github.com/Blessymolcharls/grimmoire.git
cd grimmoire
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

Default zero-config `.env`:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXTAUTH_SECRET="hogwarts_library_magical_key_2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Initialization & Seed
Synchronize the Prisma schema and populate the default departments, starter books, quotes, sessions, and journal entries:
```bash
# Push schema to local SQLite database
npm run db:push

# Seed default departments and sample archive
npm run db:seed
```

### 5. Start Application
```bash
# Development mode (Hot-reload with Turbopack)
npm run dev

# Or run the optimized production build
npm run build
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to enter the library.

---

## ✦ Verification & Testing

Grimmoire maintains a rigorous automated testing and verification suite:

```bash
# Run the 29-test Vitest suite
npm test

# Run ESLint checks
npm run lint

# Run TypeScript type checks
npx tsc --noEmit

# Verify optimized production build
npm run build
```

---

## ✦ Archive Backup & Recovery (`v1.0.0`)

Grimmoire provides full user data sovereignty through its versioned backup engine:
1. **Export Full Archive**: Downloads a structured JSON payload containing all books, quotes, reading sessions, departments, journal entries, and reading goals (`/api/backup/export`).
2. **Safe Restoration**: Uploads a JSON archive (`/api/backup/import`).
   - **Dry-Run Preview**: Inspects the archive and reports exact counts of new tomes and preserved existing tomes without touching the database.
   - **Duplicate Protection**: Existing books (matched by normalized title or ISBN-13) are kept and never overwritten.
   - **Atomic Transaction**: Applied in a single Prisma transaction to prevent partial state corruption.

---

## ✦ Production Deployment with PostgreSQL

To deploy to Vercel, Railway, Render, or Fly.io with hosted PostgreSQL:

1. **Activate the PostgreSQL Schema**:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

2. **Configure Environment Variables**:
   In your hosting dashboard, set:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   NODE_ENV="production"
   NEXTAUTH_SECRET="your_strong_random_secret_key"
   NEXTAUTH_URL="https://your-domain.com"
   ```

3. **Deploy & Push Schema**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

---

## ✦ Project Structure

```
├── .github/
│   └── workflows/ci.yml       # GitHub Actions CI workflow (lint, tsc, test, build)
├── app/
│   ├── layout.tsx             # Root layout with Cinzel typography & Navigation shell
│   ├── page.tsx               # Feature A: Library Entrance & Vitals
│   ├── not-found.tsx          # Hogwarts-themed 404 page ("The Vanishing Corridor")
│   ├── error.tsx              # Gothic error boundary ("The Enchantment Falters")
│   ├── globals.css            # Hogwarts design tokens, parchment styles, wooden shelves
│   ├── library/page.tsx       # Feature B: 2D Bookshelf & collection
│   ├── discover/page.tsx      # Feature D: External discovery & curated suggestions
│   ├── departments/page.tsx   # Feature E: Magical Departments
│   ├── journal/page.tsx       # Feature F: Reading Journal chronicles
│   ├── observatory/page.tsx   # Feature G: Reading Observatory & statistics
│   ├── settings/page.tsx      # Feature H: Settings, storage status, JSON backup/restore
│   ├── books/[id]/page.tsx    # Feature C: Open Tome detail experience
│   └── api/                   # Typed Next.js Route Handlers
│       ├── backup/            # Versioned JSON export & dry-run import
│       ├── books/             # Collection CRUD & Open Library search
│       ├── departments/       # Department listing & custom wing creation
│       ├── quotes/            # Literary excerpts CRUD
│       ├── sessions/          # Reading sessions logging
│       ├── journal/           # Journal chronicles CRUD
│       ├── goals/             # Annual reading goal API
│       └── stats/             # Real database-derived metrics & analytics
├── components/
│   ├── layout/Navigation.tsx  # Responsive desktop sidebar & mobile navigation
│   ├── library/Bookshelf.tsx  # Interactive 2D wooden bookshelf & filter toolbar
│   ├── books/BookSpine.tsx    # Realistic book spine with ribbon, rating, & reduced-motion
│   ├── books/BookCard.tsx     # Rich manuscript card component with fallback artwork
│   ├── books/BookOpeningModal.tsx # Open tome reading record modal
│   └── forms/AddBookModal.tsx # Multi-step discovery, manual entry, & celebration sparkles
├── docs/
│   ├── ARCHITECTURE.md        # Deep dive into architecture, layers, and data flow
│   ├── DEVELOPMENT.md         # Comprehensive local developer setup & commands
│   └── TESTING.md             # Vitest test suite breakdown and verification steps
├── lib/
│   ├── prisma.ts              # Singleton Prisma client
│   ├── auth.ts                # Server-side user ownership resolution
│   ├── stats.ts               # Pure reading statistics, streak, & goal calculation engine
│   ├── books/normalize.ts     # Metadata normalization
│   ├── books/providers/       # Open Library provider with 6s AbortController timeout
│   └── validations/           # Zod validation schemas (book, journal, session, backup)
├── prisma/
│   ├── schema.prisma          # Prisma schema (SQLite dev)
│   ├── schema.postgresql.prisma # PostgreSQL production schema
│   └── seed.ts                # Rich initial seed script
└── tests/
    └── unit/                  # Vitest unit test suite (29 tests)
```

---

## ✦ Recommended Repository Topics

`personal-library`, `reading-tracker`, `nextjs`, `react`, `typescript`, `prisma`, `dark-academia`, `hogwarts-library`, `open-library`, `vitest`, `tailwind-css`

---

## ✦ License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
