import { describe, it, expect } from "vitest";
import {
  calculatePagesRead,
  calculateReadingStreak,
  calculateGoalProgress,
} from "../../lib/stats";

describe("Reading Statistics Utilities", () => {
  describe("calculatePagesRead", () => {
    it("sums pageCount for completed books", () => {
      const books = [
        { readingStatus: "COMPLETED", pageCount: 350, currentPage: 350 },
        { readingStatus: "COMPLETED", pageCount: 420, currentPage: 0 },
      ];
      expect(calculatePagesRead(books)).toBe(770);
    });

    it("uses currentPage for in-progress books and bounds by pageCount if pageCount is known", () => {
      const books = [
        { readingStatus: "CURRENTLY_READING", pageCount: 500, currentPage: 150 },
        { readingStatus: "WANT_TO_READ", pageCount: 300, currentPage: 0 },
        { readingStatus: "ON_HOLD", pageCount: 400, currentPage: 80 },
      ];
      expect(calculatePagesRead(books)).toBe(230);
    });

    it("handles missing or null page counts gracefully", () => {
      const books = [
        { readingStatus: "COMPLETED", pageCount: null, currentPage: 120 },
        { readingStatus: "CURRENTLY_READING", pageCount: undefined, currentPage: 50 },
        { readingStatus: "COMPLETED", pageCount: 0, currentPage: null },
      ];
      expect(calculatePagesRead(books)).toBe(170);
    });

    it("returns 0 for empty book collections", () => {
      expect(calculatePagesRead([])).toBe(0);
    });
  });

  describe("calculateReadingStreak", () => {
    it("returns 0 when there are no activity records", () => {
      expect(calculateReadingStreak([])).toBe(0);
    });

    it("calculates active streak when there is activity today and consecutive past days", () => {
      const today = new Date("2026-10-15T12:00:00.000Z");
      const sessions = [
        new Date("2026-10-15T10:00:00.000Z"),
        new Date("2026-10-14T15:30:00.000Z"),
        new Date("2026-10-13T09:00:00.000Z"),
      ];
      expect(calculateReadingStreak(sessions, [], today)).toBe(3);
    });

    it("maintains streak if today has no activity yet but yesterday had activity", () => {
      const today = new Date("2026-10-15T12:00:00.000Z");
      const sessions = [
        new Date("2026-10-14T20:00:00.000Z"),
        new Date("2026-10-13T19:00:00.000Z"),
      ];
      expect(calculateReadingStreak(sessions, [], today)).toBe(2);
    });

    it("returns 0 if neither today nor yesterday had activity (streak broken)", () => {
      const today = new Date("2026-10-15T12:00:00.000Z");
      const sessions = [
        new Date("2026-10-12T10:00:00.000Z"),
        new Date("2026-10-11T10:00:00.000Z"),
      ];
      expect(calculateReadingStreak(sessions, [], today)).toBe(0);
    });

    it("combines reading session dates and book completion dates without double-counting", () => {
      const today = new Date("2026-10-15T12:00:00.000Z");
      const sessions = [
        new Date("2026-10-15T08:00:00.000Z"),
        new Date("2026-10-15T14:00:00.000Z"), // Same day duplicate
      ];
      const completions = [
        new Date("2026-10-14T18:00:00.000Z"),
      ];
      expect(calculateReadingStreak(sessions, completions, today)).toBe(2);
    });

    it("handles string date inputs and ignores invalid date strings safely", () => {
      const today = new Date("2026-10-15T12:00:00.000Z");
      const dates = ["2026-10-15", "not-a-valid-date", "2026-10-14"];
      expect(calculateReadingStreak(dates, [], today)).toBe(2);
    });
  });

  describe("calculateGoalProgress", () => {
    it("calculates percentage accurately", () => {
      const result = calculateGoalProgress(12, 24);
      expect(result.completed).toBe(12);
      expect(result.target).toBe(24);
      expect(result.percentage).toBe(50);
    });

    it("caps percentage at 100% when goal is surpassed", () => {
      const result = calculateGoalProgress(30, 20);
      expect(result.completed).toBe(30);
      expect(result.percentage).toBe(100);
    });

    it("safely handles 0 or negative targets by defaulting to minimum 1", () => {
      const result = calculateGoalProgress(5, 0);
      expect(result.target).toBe(1);
      expect(result.percentage).toBe(100);
    });
  });
});
