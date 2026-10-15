/**
 * Pure calculation utilities for reading metrics, streaks, and progress.
 * Derives all statistics strictly from persisted database records.
 */

export interface BookReadingRecord {
  readingStatus: string;
  pageCount?: number | null;
  currentPage?: number | null;
}

/**
 * Calculates total pages absorbed across completed and in-progress tomes.
 * For completed books with a recorded pageCount, the full pageCount is counted.
 * For books currently in-progress or with currentPage recorded, currentPage is counted.
 */
export function calculatePagesRead(books: BookReadingRecord[]): number {
  let total = 0;
  for (const b of books) {
    if (b.readingStatus === "COMPLETED" && b.pageCount && b.pageCount > 0) {
      total += b.pageCount;
    } else if (b.currentPage && b.currentPage > 0) {
      // Bound currentPage by pageCount if pageCount is known
      const pages = b.pageCount ? Math.min(b.currentPage, b.pageCount) : b.currentPage;
      total += pages;
    }
  }
  return total;
}

/**
 * Calculates consecutive active reading days (streak) up to today or yesterday.
 * Considers both reading session dates and book completion dates.
 * Returns 0 if no reading activity occurred today or yesterday.
 */
export function calculateReadingStreak(
  sessionDates: (Date | string)[],
  completionDates: (Date | string)[] = [],
  referenceDate: Date = new Date()
): number {
  const dateSet = new Set<string>();

  const toDateKey = (d: Date | string) => {
    try {
      const dateObj = typeof d === "string" ? new Date(d) : d;
      if (isNaN(dateObj.getTime())) return null;
      return dateObj.toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  sessionDates.forEach((d) => {
    const key = toDateKey(d);
    if (key) dateSet.add(key);
  });

  completionDates.forEach((d) => {
    const key = toDateKey(d);
    if (key) dateSet.add(key);
  });

  if (dateSet.size === 0) return 0;

  const checkDate = new Date(referenceDate);
  const todayKey = checkDate.toISOString().split("T")[0];

  // If today had no recorded activity, check if yesterday was active
  if (!dateSet.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  let streak = 0;
  while (dateSet.has(checkDate.toISOString().split("T")[0])) {
    streak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

/**
 * Calculates percentage toward annual reading goal.
 */
export function calculateGoalProgress(
  completedCount: number,
  targetGoal: number
): { completed: number; target: number; percentage: number } {
  const validTarget = Math.max(1, targetGoal);
  const percentage = Math.min(100, Math.round((completedCount / validTarget) * 100));
  return {
    completed: completedCount,
    target: validTarget,
    percentage,
  };
}
