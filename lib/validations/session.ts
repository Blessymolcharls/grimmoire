import { z } from "zod";

export const ReadingSessionSchema = z.object({
  bookId: z.string().min(1, "Book ID is required"),
  startedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional().nullable(),
  pagesRead: z.number().int().positive().optional().nullable(),
  note: z.string().max(1000).optional().nullable(),
});

export const ReadingGoalSchema = z.object({
  year: z.number().int().min(2000).max(2100),
  targetBooks: z.number().int().min(1).max(500),
});
