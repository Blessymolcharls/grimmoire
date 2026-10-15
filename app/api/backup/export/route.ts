import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const [books, departments, journalEntries, goals] = await Promise.all([
      prisma.book.findMany({
        where: { userId: user.id },
        include: {
          departments: {
            include: { department: true },
          },
          quotes: true,
          readingSessions: true,
        },
      }),
      prisma.department.findMany({
        where: {
          OR: [{ userId: null }, { userId: user.id }],
        },
      }),
      prisma.journalEntry.findMany({
        where: { userId: user.id },
        include: {
          books: {
            include: { book: { select: { title: true } } },
          },
        },
      }),
      prisma.readingGoal.findMany({
        where: { userId: user.id },
      }),
    ]);

    const formattedBooks = books.map((b) => ({
      title: b.title,
      authors: (() => {
        try {
          return JSON.parse(b.authors);
        } catch {
          return [b.authors];
        }
      })(),
      description: b.description,
      coverUrl: b.coverUrl,
      publicationYear: b.publicationYear,
      publisher: b.publisher,
      isbn10: b.isbn10,
      isbn13: b.isbn13,
      pageCount: b.pageCount,
      externalProvider: b.externalProvider,
      externalProviderId: b.externalProviderId,
      readingStatus: b.readingStatus as any,
      rating: b.rating,
      isFavorite: b.isFavorite,
      dateStarted: b.dateStarted ? b.dateStarted.toISOString() : undefined,
      dateCompleted: b.dateCompleted ? b.dateCompleted.toISOString() : undefined,
      currentPage: b.currentPage || 0,
      personalReview: b.personalReview,
      favoriteCharacter: b.favoriteCharacter,
      notes: b.notes,
      spineColor: b.spineColor,
      departmentSlugs: b.departments.map((d) => d.department.slug),
      quotes: b.quotes.map((q) => ({
        text: q.text,
        pageNumber: q.pageNumber,
        personalNote: q.personalNote,
      })),
      readingSessions: b.readingSessions.map((s) => ({
        startedAt: s.startedAt.toISOString(),
        durationMinutes: s.durationMinutes,
        pagesRead: s.pagesRead,
        note: s.note,
      })),
    }));

    const formattedJournal = journalEntries.map((j) => ({
      title: j.title,
      content: j.content,
      entryDate: j.entryDate.toISOString(),
      bookTitles: j.books.map((b) => b.book.title),
    }));

    const backupArchive = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      libraryTitle: "Grimmoire: The Hogwarts Library — Archive Backup",
      scholar: {
        displayName: user.displayName,
        email: user.email,
      },
      departments: departments.map((d) => ({
        name: d.name,
        slug: d.slug,
        description: d.description,
        icon: d.icon,
        accentColor: d.accentColor,
        isSystem: d.isSystem,
      })),
      books: formattedBooks,
      journal: formattedJournal,
      goals: goals.map((g) => ({
        year: g.year,
        targetBooks: g.targetBooks,
      })),
    };

    return NextResponse.json(backupArchive, {
      headers: {
        "Content-Disposition": `attachment; filename="grimmoire-archive-${
          new Date().toISOString().split("T")[0]
        }.json"`,
      },
    });
  } catch (error) {
    console.error("Backup export error:", error);
    return NextResponse.json(
      { error: "Failed to compile complete library archive backup" },
      { status: 500 }
    );
  }
}
