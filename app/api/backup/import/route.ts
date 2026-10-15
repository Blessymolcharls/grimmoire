import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { GrimmoireArchiveBackupSchema } from "@/lib/validations/backup";
import { normalizeTitle } from "@/lib/books/normalize";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const isDryRun = body.dryRun === true;
    const backupData = body.archive || body;

    // Validate archive payload
    const parsed = GrimmoireArchiveBackupSchema.safeParse(backupData);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid archive format or incompatible schema version.",
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const archive = parsed.data;

    // Fetch existing records for duplicate comparison
    const existingBooks = await prisma.book.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, normalizedTitle: true, isbn13: true },
    });

    const existingDepts = await prisma.department.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
      select: { id: true, slug: true },
    });

    const existingTitles = new Set(existingBooks.map((b) => b.normalizedTitle));
    const existingIsbns = new Set(
      existingBooks.map((b) => b.isbn13).filter(Boolean) as string[]
    );

    let newBooksCount = 0;
    let duplicateBooksCount = 0;

    for (const b of archive.books) {
      const norm = normalizeTitle(b.title);
      if (existingTitles.has(norm) || (b.isbn13 && existingIsbns.has(b.isbn13))) {
        duplicateBooksCount++;
      } else {
        newBooksCount++;
      }
    }

    // If dryRun, return preview statistics
    if (isDryRun) {
      return NextResponse.json({
        preview: true,
        version: archive.version,
        exportedAt: archive.exportedAt,
        scholarName: archive.scholar.displayName,
        totalTomesInBackup: archive.books.length,
        newTomesToInscribe: newBooksCount,
        existingTomesToKeep: duplicateBooksCount,
        departmentsInBackup: archive.departments.length,
        journalEntriesInBackup: archive.journal.length,
        goalsInBackup: archive.goals.length,
      });
    }

    // Perform Safe Restore using transaction
    const departmentMap = new Map<string, string>();
    existingDepts.forEach((d) => departmentMap.set(d.slug, d.id));

    await prisma.$transaction(async (tx) => {
      // 1. Ensure custom departments exist
      for (const d of archive.departments) {
        if (!departmentMap.has(d.slug) && !d.isSystem) {
          const createdDept = await tx.department.create({
            data: {
              userId: user.id,
              name: d.name,
              slug: d.slug,
              description: d.description,
              icon: d.icon || "Sparkles",
              accentColor: d.accentColor || "#A855F7",
              isSystem: false,
            },
          });
          departmentMap.set(d.slug, createdDept.id);
        }
      }

      // 2. Inscribe new books (skip duplicates to preserve current user data)
      const bookTitleToIdMap = new Map<string, string>();
      existingBooks.forEach((b) => bookTitleToIdMap.set(b.title.toLowerCase(), b.id));

      for (const b of archive.books) {
        const norm = normalizeTitle(b.title);
        const isDuplicate =
          existingTitles.has(norm) || (b.isbn13 && existingIsbns.has(b.isbn13));

        if (!isDuplicate) {
          const deptConnectIds = (b.departmentSlugs || [])
            .map((slug) => departmentMap.get(slug))
            .filter(Boolean) as string[];

          const createdBook = await tx.book.create({
            data: {
              userId: user.id,
              title: b.title,
              normalizedTitle: norm,
              authors: JSON.stringify(b.authors),
              description: b.description,
              coverUrl: b.coverUrl,
              publicationYear: b.publicationYear,
              publisher: b.publisher,
              isbn10: b.isbn10,
              isbn13: b.isbn13,
              pageCount: b.pageCount,
              externalProvider: b.externalProvider || "manual",
              externalProviderId: b.externalProviderId,
              readingStatus: b.readingStatus,
              rating: b.rating,
              isFavorite: b.isFavorite,
              dateStarted: b.dateStarted ? new Date(b.dateStarted) : null,
              dateCompleted: b.dateCompleted ? new Date(b.dateCompleted) : null,
              currentPage: b.currentPage || 0,
              personalReview: b.personalReview,
              favoriteCharacter: b.favoriteCharacter,
              notes: b.notes,
              spineColor: b.spineColor,
              departments: {
                create: deptConnectIds.map((departmentId) => ({ departmentId })),
              },
              quotes: {
                create: (b.quotes || []).map((q) => ({
                  text: q.text,
                  pageNumber: q.pageNumber,
                  personalNote: q.personalNote,
                })),
              },
              readingSessions: {
                create: (b.readingSessions || []).map((s) => ({
                  userId: user.id,
                  startedAt: s.startedAt ? new Date(s.startedAt) : new Date(),
                  durationMinutes: s.durationMinutes,
                  pagesRead: s.pagesRead,
                  note: s.note,
                })),
              },
            },
          });

          bookTitleToIdMap.set(b.title.toLowerCase(), createdBook.id);
          existingTitles.add(norm);
          if (b.isbn13) existingIsbns.add(b.isbn13);
        }
      }

      // 3. Restore Journal Entries
      for (const j of archive.journal) {
        const linkedBookIds = (j.bookTitles || [])
          .map((title) => bookTitleToIdMap.get(title.toLowerCase()))
          .filter(Boolean) as string[];

        await tx.journalEntry.create({
          data: {
            userId: user.id,
            title: j.title,
            content: j.content,
            entryDate: j.entryDate ? new Date(j.entryDate) : new Date(),
            books: {
              create: linkedBookIds.map((bookId) => ({ bookId })),
            },
          },
        });
      }

      // 4. Restore Reading Goals (upsert)
      for (const g of archive.goals) {
        await tx.readingGoal.upsert({
          where: {
            userId_year: {
              userId: user.id,
              year: g.year,
            },
          },
          update: { targetBooks: g.targetBooks },
          create: {
            userId: user.id,
            year: g.year,
            targetBooks: g.targetBooks,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: `Successfully inscribed ${newBooksCount} tomes and archive records into your Hogwarts library.`,
      inscribedTomes: newBooksCount,
      skippedDuplicates: duplicateBooksCount,
    });
  } catch (error) {
    console.error("Backup import error:", error);
    return NextResponse.json(
      { error: "Failed to restore archive backup safely." },
      { status: 500 }
    );
  }
}
