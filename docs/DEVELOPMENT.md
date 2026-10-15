# Grimmoire Development Guide

This guide covers setting up, running, and contributing to **Grimmoire: The Hogwarts Library**.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or higher (tested on Node 20 and Node 22)
- **npm**: `v10.x` or higher
- **Git**

---

## 2. Quick Setup

```bash
# Clone the repository
git clone https://github.com/Blessymolcharls/grimmoire.git
cd grimmoire

# Install dependencies using the lockfile
npm install

# Setup local environment variables
cp .env.example .env
```

Default zero-config `.env`:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXTAUTH_SECRET="hogwarts_library_magical_key_2026"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 3. Database Initialization & Seeding

Grimmoire uses Prisma with local SQLite out of the box:

```bash
# Push schema changes to your local database
npm run db:push

# Populate default magical departments and sample library archive
npm run db:seed
```

---

## 4. Running Locally

```bash
# Start Next.js development server with Turbopack hot-reload
npm run dev

# Open http://localhost:3000 in your browser
```

---

## 5. Available Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server on `http://localhost:3000` |
| `npm run build` | Compiles an optimized production build via Next.js Turbopack |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint 9 checks across all source files |
| `npx tsc --noEmit` | Runs TypeScript compiler checks without emitting files |
| `npm test` | Runs the Vitest test suite |
| `npm run db:push` | Synchronizes the Prisma schema with the local SQLite database |
| `npm run db:seed` | Seeds the database with starter departments and archive records |

---

## 6. Code Style & Conventions

- **Component Boundaries**: Keep Server Components for data fetching and isolate `"use client"` to interactive UI elements.
- **Validation**: Every external request or input must be validated with Zod in `lib/validations/`.
- **Aesthetic Integrity**: Maintain the dark-academia atmosphere. Use predefined design tokens in `app/globals.css` (`#100D18`, `#21162E`, `#39251F`, `#C5A56A`).
- **Accessibility**: Provide `aria-label`s on icon buttons, ensure focus visibility, and respect user reduced-motion preferences with `useReducedMotion()`.
