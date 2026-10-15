import { describe, it, expect } from "vitest";
import { GrimmoireArchiveBackupSchema } from "../../lib/validations/backup";

describe("Archive Backup & Restore Validation Schema", () => {
  it("validates a complete, authentic Grimmoire v1.0.0 archive payload", () => {
    const validArchive = {
      version: "1.0.0",
      exportedAt: "2026-10-15T20:00:00.000Z",
      libraryTitle: "Grimmoire: The Hogwarts Library — Archive Backup",
      scholar: {
        displayName: "Head Archivist",
        email: "scholar@hogwarts.library",
      },
      departments: [
        {
          name: "Charms",
          slug: "charms",
          description: "Magical adventures",
          accentColor: "#A855F7",
          isSystem: true,
        },
      ],
      books: [
        {
          title: "The Name of the Wind",
          authors: ["Patrick Rothfuss"],
          pageCount: 662,
          readingStatus: "COMPLETED",
          rating: 5,
          isFavorite: true,
          currentPage: 662,
          departmentSlugs: ["charms"],
          quotes: [
            {
              text: "Words can warm you to your bones and words can bring you to the ground.",
              pageNumber: 42,
            },
          ],
          readingSessions: [
            {
              startedAt: "2026-10-15T10:00:00.000Z",
              durationMinutes: 45,
              pagesRead: 30,
            },
          ],
        },
      ],
      journal: [
        {
          title: "First Steps into the University",
          content: "Reflections upon beginning Kvothe's chronicle in the archive.",
          entryDate: "2026-10-15T21:00:00.000Z",
          bookTitles: ["The Name of the Wind"],
        },
      ],
      goals: [
        {
          year: 2026,
          targetBooks: 25,
        },
      ],
    };

    const result = GrimmoireArchiveBackupSchema.safeParse(validArchive);
    expect(result.success).toBe(true);
  });

  it("fails when archive schema version is incompatible (e.g. 2.0.0 or malformed)", () => {
    const invalidVersion = {
      version: "2.0.0",
      exportedAt: "2026-10-15T20:00:00.000Z",
      scholar: { displayName: "Archivist" },
      books: [],
    };
    const result = GrimmoireArchiveBackupSchema.safeParse(invalidVersion);
    expect(result.success).toBe(false);
  });

  it("fails when book record is missing required fields (e.g. authors or title)", () => {
    const invalidBook = {
      version: "1.0.0",
      exportedAt: "2026-10-15T20:00:00.000Z",
      scholar: { displayName: "Archivist" },
      books: [
        {
          title: "Nameless Book",
          authors: [], // Missing author
        },
      ],
    };
    const result = GrimmoireArchiveBackupSchema.safeParse(invalidBook);
    expect(result.success).toBe(false);
  });

  it("provides sensible defaults for missing optional collections", () => {
    const minimalArchive = {
      version: "1.0.0",
      exportedAt: "2026-10-15T20:00:00.000Z",
      scholar: { displayName: "Archivist" },
    };
    const result = GrimmoireArchiveBackupSchema.safeParse(minimalArchive);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.books).toEqual([]);
      expect(result.data.departments).toEqual([]);
      expect(result.data.journal).toEqual([]);
      expect(result.data.goals).toEqual([]);
    }
  });
});
