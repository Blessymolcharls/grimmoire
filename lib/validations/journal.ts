import { z } from "zod";

export const JournalEntrySchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  content: z.string().min(1, "Content is required"),
  entryDate: z.string().datetime().optional(),
  bookIds: z.array(z.string()).optional().default([]),
});

export const DepartmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().optional().nullable(),
  accentColor: z.string().optional().nullable(),
});
