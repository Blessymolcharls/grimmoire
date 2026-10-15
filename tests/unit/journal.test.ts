import { describe, it, expect } from "vitest";
import { JournalEntrySchema } from "../../lib/validations/journal";

describe("Journal Entry Schema Validation", () => {
  it("validates valid journal entry payload", () => {
    const valid = {
      title: "Night of the Autumn Equinox",
      content: "Spent hours reading by candlelight in the Astronomy Tower carrel.",
      entryDate: "2026-10-15T21:00:00.000Z",
      bookIds: ["book-123", "book-456"],
    };
    const result = JournalEntrySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails when journal title or content is blank", () => {
    expect(
      JournalEntrySchema.safeParse({
        title: "",
        content: "Valid content",
      }).success
    ).toBe(false);

    expect(
      JournalEntrySchema.safeParse({
        title: "Valid Title",
        content: "",
      }).success
    ).toBe(false);
  });

  it("defaults bookIds to empty array when omitted", () => {
    const result = JournalEntrySchema.safeParse({
      title: "Solo Reflection",
      content: "Thoughts unattached to any specific tome.",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bookIds).toEqual([]);
    }
  });
});
