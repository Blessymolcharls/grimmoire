import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { JournalClient } from "./JournalClient";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await getCurrentUser();

  const [entries, books] = await Promise.all([
    prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { entryDate: "desc" },
      include: {
        books: {
          include: {
            book: {
              select: {
                id: true,
                title: true,
                coverUrl: true,
                authors: true,
                spineColor: true,
              },
            },
          },
        },
      },
    }),
    prisma.book.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        coverUrl: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  const formattedEntries = entries.map((entry) => ({
    ...entry,
    books: entry.books.map((b) => ({
      ...b.book,
      authors: (() => {
        try {
          return JSON.parse(b.book.authors);
        } catch {
          return [b.book.authors];
        }
      })(),
    })),
  }));

  return (
    <JournalClient
      initialEntries={formattedEntries}
      allBooks={books}
    />
  );
}
