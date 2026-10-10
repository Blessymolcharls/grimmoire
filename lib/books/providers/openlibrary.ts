import { NormalizedBookMetadata, normalizeTitle } from "../normalize";

interface OpenLibraryDoc {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  publisher?: string[];
  isbn?: string[];
  number_of_pages_median?: number;
  cover_i?: number;
  first_sentence?: string[] | string;
}

interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibraryDoc[];
}

export async function searchOpenLibrary(
  query: string,
  limit = 12
): Promise<NormalizedBookMetadata[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    trimmed
  )}&limit=${limit}&fields=key,title,author_name,first_publish_year,publisher,isbn,number_of_pages_median,cover_i,first_sentence`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "HogwartsLibrary/1.0 (academic personal reading archive)",
      },
    });

    if (!res.ok) {
      throw new Error(`OpenLibrary returned status ${res.status}`);
    }

    const data: OpenLibrarySearchResponse = await res.json();
    if (!data.docs || !Array.isArray(data.docs)) return [];

    return data.docs.map((doc) => {
      // Find ISBN-10 and ISBN-13
      let isbn10: string | undefined;
      let isbn13: string | undefined;

      if (doc.isbn && Array.isArray(doc.isbn)) {
        for (const code of doc.isbn) {
          const clean = code.replace(/[^0-9X]/gi, "");
          if (clean.length === 10 && !isbn10) isbn10 = clean;
          if (clean.length === 13 && !isbn13) isbn13 = clean;
        }
      }

      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : isbn13
        ? `https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`
        : undefined;

      let description: string | undefined;
      if (Array.isArray(doc.first_sentence) && doc.first_sentence.length > 0) {
        description = doc.first_sentence[0];
      } else if (typeof doc.first_sentence === "string") {
        description = doc.first_sentence;
      }

      return {
        title: doc.title || "Untitled Tome",
        normalizedTitle: normalizeTitle(doc.title || "untitled tome"),
        authors: doc.author_name || ["Unknown Author"],
        description,
        coverUrl,
        publicationYear: doc.first_publish_year,
        publisher: doc.publisher?.[0],
        isbn10,
        isbn13,
        pageCount: doc.number_of_pages_median,
        externalProvider: "openlibrary",
        externalProviderId: doc.key,
      };
    });
  } catch (error: unknown) {
    if ((error as Error).name === "AbortError") {
      console.warn("OpenLibrary search request timed out");
    } else {
      console.error("OpenLibrary search error:", error);
    }
    // Return empty array rather than crashing, caller can handle empty or manual fallback
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}
