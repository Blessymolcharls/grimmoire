import { describe, it, expect } from "vitest";
import { BookSchema, QuoteSchema } from "../../lib/validations/book";
import { ReadingSessionSchema, ReadingGoalSchema } from "../../lib/validations/session";

describe("Validation Schemas", () => {
  it("validates valid book creation payload", () => {
    const valid = {
      title: "The Name of the Wind",
      authors: ["Patrick Rothfuss"],
      pageCount: 662,
      readingStatus: "COMPLETED",
      rating: 5,
      isFavorite: true,
      currentPage: 662,
    };

    const result = BookSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails when book title is empty", () => {
    const invalid = {
      title: "",
      authors: ["Unknown Author"],
    };

    const result = BookSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates quotes schema", () => {
    const quote = {
      text: "Every book, every volume you see here, has a soul.",
      pageNumber: 5,
    };
    expect(QuoteSchema.safeParse(quote).success).toBe(true);
    expect(QuoteSchema.safeParse({ text: "" }).success).toBe(false);
  });

  it("validates reading goals schema", () => {
    expect(ReadingGoalSchema.safeParse({ year: 2026, targetBooks: 24 }).success).toBe(true);
    expect(ReadingGoalSchema.safeParse({ year: 1800, targetBooks: 24 }).success).toBe(false);
    expect(ReadingGoalSchema.safeParse({ year: 2026, targetBooks: -5 }).success).toBe(false);
  });
});
