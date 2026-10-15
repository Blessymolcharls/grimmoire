import { z } from "zod";
import { BookSchema, QuoteSchema } from "./book";
import { JournalEntrySchema } from "./journal";
import { ReadingSessionSchema, ReadingGoalSchema } from "./session";

export const BackupDepartmentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().optional().nullable(),
  accentColor: z.string().optional().nullable(),
  isSystem: z.boolean().optional().default(false),
});

export const BackupQuoteSchema = QuoteSchema.extend({
  id: z.string().optional(),
});

export const BackupSessionSchema = ReadingSessionSchema.omit({ bookId: true }).extend({
  id: z.string().optional(),
});

export const BackupBookSchema = BookSchema.extend({
  id: z.string().optional(),
  departmentSlugs: z.array(z.string()).optional().default([]),
  quotes: z.array(BackupQuoteSchema).optional().default([]),
  readingSessions: z.array(BackupSessionSchema).optional().default([]),
});

export const BackupJournalEntrySchema = JournalEntrySchema.extend({
  id: z.string().optional(),
  bookTitles: z.array(z.string()).optional().default([]),
});

export const GrimmoireArchiveBackupSchema = z.object({
  version: z.string().regex(/^1\.\d+\.\d+$/, "Archive version must be 1.x.x compatible"),
  exportedAt: z.string(),
  libraryTitle: z.string().default("Grimmoire: The Hogwarts Library — Archive Backup"),
  scholar: z.object({
    displayName: z.string().default("Head Archivist"),
    email: z.string().nullable().optional(),
  }),
  departments: z.array(BackupDepartmentSchema).default([]),
  books: z.array(BackupBookSchema).default([]),
  journal: z.array(BackupJournalEntrySchema).default([]),
  goals: z.array(ReadingGoalSchema).default([]),
});

export type GrimmoireArchiveBackup = z.infer<typeof GrimmoireArchiveBackupSchema>;
