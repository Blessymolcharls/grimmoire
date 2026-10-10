# Grimmoire — The Hogwarts Library

> *"Every book is a world you have visited, a memory engraved in parchment, and a flame against the dark."*

**Grimmoire: The Hogwarts Library** is a production-grade, immersive personal digital library and reading chronicle designed as a living castle archive. Every volume represents a journey undertaken, complete with interactive 2D wooden bookshelves, physical textured book spines, Open Library metadata discovery, an astronomical reading observatory, thematic magical departments, excerpted quotes, and a parchment reading journal.

---

## ✦ Key Features

- **The Entrance (`/`)**: Atmospheric high-fantasy landing with real database statistics (tomes shelved, pages absorbed, rating, reading streak), quick actions, and recently visited worlds.
- **My Shelves (`/library`)**: A realistic 2D wooden bookshelf environment (`Sanctum Bibliotheca`) featuring deterministic book spine heights, custom colors, gold foil titles, hover elevation, and an open tome modal. Supports filtering by department, reading status, search, and sorting.
- **Open Tome Experience (`/books/[id]`)**: Two-page open manuscript layout with literary metadata on the left and personal reading records, quotes, sessions, and reflections on the right.
- **Discover Tomes (`/discover`)**: Real-time debounced external search against the Open Library API and Open Library Covers service, curated starter recommendations, and manual tome scribing.
- **Magical Departments (`/departments`)**: 9 castle departments (*Charms*, *Potions*, *Defense Against the Dark Arts*, *Divination*, *History of Magic*, *Transfiguration*, *Care of Magical Creatures*, *Astronomy Tower*, *Restricted Section*) with many-to-many book assignments and custom department creation.
- **Reading Journal (`/journal`)**: Intimate chronicle for reflections, memories, and reading notes linked to specific library volumes.
- **The Observatory (`/observatory`)**: Celestial analytics dashboard displaying annual reading goals, monthly completion charts, page metrics, and department distributions.
- **Library Settings (`/settings`)**: Scholar profile, annual goal configurator, storage architecture overview, and complete JSON archive backup export.

---

## ✦ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, Server & Client Components)
- **UI & Styling**: React 19, Tailwind CSS v4, Google Fonts (`Cinzel` & `Plus Jakarta Sans`)
- **Animation**: Framer Motion (`motion`), `canvas-confetti`
- **Icons**: Lucide React
- **Validation**: Zod
- **Database & ORM**: PostgreSQL-ready schema with Prisma ORM
  - **Local Zero-Config Dev**: SQLite (`dev.db`) running out-of-the-box on any machine
  - **Hosted Production**: PostgreSQL (`prisma/schema.postgresql.prisma`) for Supabase, Neon, Railway, or AWS RDS
- **Testing**: Vitest, Playwright-ready, ESLint

---

## ✦ Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### 2. Installation
```bash
git clone <repo-url>
cd grimmoire
npm install
```

### 3. Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```

Default `.env` for zero-config local development:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXTAUTH_SECRET="hogwarts_library_magical_key_2026"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Initialization & Seed
Synchronize the Prisma schema and populate the default departments, starter books, quotes, sessions, and journal entries:
```bash
# Push schema to local database
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
Open **[http://localhost:3000](http://localhost:3000)** in your browser to enter the library!

---

## ✦ Verification & Testing

Run the Vitest test suite (normalization utilities, validation schemas, and goals):
```bash
npm test
```

Run ESLint checks:
```bash
npm run lint
```

Build verification:
```bash
npm run build
```

---

## ✦ Production Deployment with PostgreSQL

To deploy to Vercel with hosted PostgreSQL (Supabase, Neon, Railway):

1. **Copy the PostgreSQL Schema**:
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   ```

2. **Configure Environment Variables**:
   In your hosting provider dashboard (e.g. Vercel), set:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   NODE_ENV="production"
   NEXTAUTH_SECRET="a_strong_random_secret_key"
   NEXTAUTH_URL="https://your-domain.vercel.app"
   ```

3. **Deploy & Migrate**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

---

## ✦ External Book Metadata Architecture

- **Open Library Search API**: Integrated via `lib/books/providers/openlibrary.ts` with server-side abort controller timeouts (6s) and query sanitization.
- **Open Library Covers**: Resolves high-resolution cover artwork by cover ID or ISBN-13 with automatic fallback cards when artwork is unavailable.
- **Normalized Internal Model**: All external providers map to a unified `NormalizedBookMetadata` model (`lib/books/normalize.ts`), insulating the rest of the application from third-party schema differences.
- **Manual Book Entry**: When an ISBN or obscure volume is unindexed, scholars can manually scribe any tome with custom title, authors, spine colors, and attributes.

---

## ✦ Project Structure

```
├── app/
│   ├── layout.tsx             # Root layout with Cinzel fonts & Navigation shell
│   ├── page.tsx               # Feature A: Library Entrance
│   ├── globals.css            # Hogwarts design tokens, parchment styles, wooden shelves
│   ├── library/page.tsx       # Feature B: 2D Bookshelf & collection
│   ├── discover/page.tsx      # Feature J: External discovery & curated suggestions
│   ├── departments/page.tsx   # Feature C: Magical Departments
│   ├── journal/page.tsx       # Feature G: Reading Journal chronicles
│   ├── observatory/page.tsx   # Feature I: Reading Observatory & statistics
│   ├── settings/page.tsx      # Feature: Settings, storage status, JSON backup
│   ├── books/[id]/page.tsx    # Feature E: Open Tome detail experience
│   └── api/                   # Typed Next.js Route Handlers
│       ├── books/             # Collection CRUD & OpenLibrary search
│       ├── departments/       # Department listing & custom wing creation
│       ├── quotes/            # Literary excerpts CRUD
│       ├── sessions/          # Reading sessions logging
│       ├── journal/           # Journal chronicles CRUD
│       ├── goals/             # Annual reading goal API
│       └── stats/             # Real database-derived metrics & analytics
├── components/
│   ├── layout/Navigation.tsx  # Responsive desktop sidebar & mobile navigation
│   ├── library/Bookshelf.tsx  # Interactive 2D wooden bookshelf & filter toolbar
│   ├── books/BookSpine.tsx    # Realistic book spine with ribbon & rating badge
│   ├── books/BookCard.tsx     # Rich manuscript card component
│   ├── books/BookOpeningModal.tsx # Open tome reading record modal
│   └── forms/AddBookModal.tsx # Multi-step discovery, manual entry, & celebration
├── lib/
│   ├── prisma.ts              # Singleton Prisma client
│   ├── auth.ts                # Server-side user ownership resolution
│   ├── books/normalize.ts     # Metadata normalization
│   ├── books/providers/       # OpenLibrary provider
│   └── validations/           # Zod validation schemas
├── prisma/
│   ├── schema.prisma          # Prisma schema (SQLite dev)
│   ├── schema.postgresql.prisma # PostgreSQL production schema
│   └── seed.ts                # Rich initial seed script
└── tests/
    └── unit/                  # Vitest unit test suite
```

---

## ✦ Security & Ownership Principles

1. **Server-Side Enforcement**: `userId` is never trusted from client-submitted payloads. All database queries and mutations call `getCurrentUser()` on the server and scope operations strictly to the user's records.
2. **Data Privacy**: Personal reading notes, quotes, and reflections are strictly private and never transmitted to external services.
3. **Graceful Degeneration**: External metadata API interruptions or missing covers fail gracefully with local fallbacks rather than crashing application flows.
