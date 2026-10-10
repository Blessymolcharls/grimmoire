export interface NormalizedBookMetadata {
  title: string;
  normalizedTitle: string;
  authors: string[];
  description?: string;
  coverUrl?: string;
  publicationYear?: number;
  publisher?: string;
  isbn10?: string;
  isbn13?: string;
  pageCount?: number;
  externalProvider: "openlibrary" | "googlebooks" | "manual";
  externalProviderId?: string;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, " ");
}

export function sanitizeAuthors(rawAuthors: unknown): string[] {
  if (Array.isArray(rawAuthors)) {
    return rawAuthors
      .map((a) => (typeof a === "string" ? a.trim() : typeof a === "object" && a?.name ? String(a.name).trim() : ""))
      .filter(Boolean);
  }
  if (typeof rawAuthors === "string") {
    try {
      const parsed = JSON.parse(rawAuthors);
      if (Array.isArray(parsed)) return sanitizeAuthors(parsed);
    } catch {
      return rawAuthors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    }
  }
  return [];
}
