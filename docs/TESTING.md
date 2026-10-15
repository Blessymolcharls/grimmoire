# Grimmoire Testing Guide

This document describes the testing strategy, test coverage, and instructions for verifying Grimmoire.

---

## 1. Testing Strategy

Grimmoire employs automated unit and integration tests using **Vitest** to ensure correctness of business logic, data normalization, input validation, and statistical calculations without affecting production or local databases.

```
tests/
└── unit/
    ├── normalize.test.ts    # Title normalization & author sanitization
    ├── stats.test.ts        # Page totals, reading streak, & goal progress calculations
    ├── backup.test.ts       # v1.0.0 Archive serialization, schema compatibility & defaults
    ├── departments.test.ts  # Magical department validation & length constraints
    ├── journal.test.ts      # Reading journal entry schema & book linking
    └── validations.test.ts  # Book creation, quotes, and reading goal validations
```

---

## 2. Running Tests

```bash
# Run all Vitest tests once
npm test

# Run tests in watch mode during development
npx vitest
```

---

## 3. Verification Suite

Before submitting pull requests or preparing deployments, run the four-step verification suite:

```bash
# 1. Run ESLint checks
npm run lint

# 2. Run TypeScript compiler type checking
npx tsc --noEmit

# 3. Run all Vitest tests
npm test

# 4. Verify optimized production build
npm run build
```

---

## 4. Key Areas Tested

1. **Title Normalization & Author Parsing**: Verifies that leading/trailing whitespace, punctuation, and articles are handled uniformly, and authors formatted as strings, arrays, or JSON arrays are sanitized properly.
2. **Reading Statistics**:
   - Page counts for completed vs. in-progress books.
   - Reading streaks: tests today-based, yesterday-based, broken streaks, duplicate session dates, and combined session/completion date calculations.
   - Goal progress calculations and 100% clamping.
3. **Archive Backup & Recovery**:
   - Conforming v1.0.0 backup payloads validate successfully.
   - Incompatible version numbers (e.g. `2.0.0`) or missing critical fields are rejected with helpful error details.
   - Non-destructive restoration dry-run returns accurate counts of new tomes and preserved books.
4. **Validation Schemas**:
   - Ensures invalid IDs, empty titles, out-of-range ratings (1–5), and oversized descriptions are rejected at API boundaries.
