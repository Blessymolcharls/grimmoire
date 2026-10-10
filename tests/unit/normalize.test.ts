import { describe, it, expect } from "vitest";
import { normalizeTitle, sanitizeAuthors } from "../../lib/books/normalize";

describe("Book Normalization Utilities", () => {
  it("normalizes titles by trimming, lowercasing, and removing special characters", () => {
    expect(normalizeTitle("  The Name of the Wind!  ")).toBe("the name of the wind");
    expect(normalizeTitle("Frankenstein; or, The Modern Prometheus")).toBe(
      "frankenstein or the modern prometheus"
    );
    expect(normalizeTitle("Harry Potter & The Sorcerer's Stone")).toBe(
      "harry potter the sorcerers stone"
    );
  });

  it("sanitizes authors from strings, arrays, or JSON arrays", () => {
    expect(sanitizeAuthors(["Patrick Rothfuss", "Mary Shelley"])).toEqual([
      "Patrick Rothfuss",
      "Mary Shelley",
    ]);

    expect(sanitizeAuthors('["Patrick Rothfuss", "Neil Gaiman"]')).toEqual([
      "Patrick Rothfuss",
      "Neil Gaiman",
    ]);

    expect(sanitizeAuthors("Patrick Rothfuss, Carlos Ruiz Zafón")).toEqual([
      "Patrick Rothfuss",
      "Carlos Ruiz Zafón",
    ]);

    expect(sanitizeAuthors(null)).toEqual([]);
    expect(sanitizeAuthors(undefined)).toEqual([]);
  });
});
