import { z } from "zod";

export const ReadingStatusEnum = z.enum([
  "WANT_TO_READ",
  "CURRENTLY_READING",
  "COMPLETED",
  "ON_HOLD",
  "DID_NOT_FINISH",
]);

export type ReadingStatus = z.infer<typeof ReadingStatusEnum>;

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  description: z.string().optional().nullable(),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  publicationYear: z.number().int().min(1000).max(2100).optional().nullable(),
  publisher: z.string().max(200).optional().nullable(),
  isbn10: z.string().max(20).optional().nullable(),
  isbn13: z.string().max(30).optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  externalProvider: z.string().optional().nullable(),
  externalProviderId: z.string().optional().nullable(),
  readingStatus: ReadingStatusEnum.default("WANT_TO_READ"),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isFavorite: z.boolean().default(false),
  dateStarted: z.string().datetime().optional().nullable().or(z.literal("")),
  dateCompleted: z.string().datetime().optional().nullable().or(z.literal("")),
  currentPage: z.number().int().min(0).default(0),
  personalReview: z.string().optional().nullable(),
  favoriteCharacter: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  spineColor: z.string().optional().nullable(),
  departmentIds: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const BookUpdateSchema = BookSchema.partial();

export const QuoteSchema = z.object({
  text: z.string().min(1, "Quote text is required").max(3000),
  pageNumber: z.number().int().positive().optional().nullable(),
  personalNote: z.string().max(1000).optional().nullable(),
});
