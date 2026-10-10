import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookUpdateSchema } from "@/lib/validations/book";
import { normalizeTitle } from "@/lib/books/normalize";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
        quotes: {
          orderBy: { createdAt: "desc" },
        },
        readingSessions: {
          orderBy: { startedAt: "desc" },
        },
        journalEntries: {
          include: {
            journalEntry: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Tome not found in your archives." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      book: {
        ...book,
        authors: (() => {
          try {
            return JSON.parse(book.authors);
          } catch {
            return [book.authors];
          }
        })(),
        departments: book.departments.map((d) => d.department),
        journalEntries: book.journalEntries.map((j) => j.journalEntry),
      },
    });
  } catch (error) {
    console.error("GET /api/books/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve book" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.book.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tome not found or access denied." },
        { status: 404 }
      );
    }

    const parsed = BookUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Handle department updates if provided
    if (data.departmentIds !== undefined) {
      await prisma.bookDepartment.deleteMany({
        where: { bookId: id },
      });
      if (data.departmentIds.length > 0) {
        await prisma.bookDepartment.createMany({
          data: data.departmentIds.map((deptId) => ({
            bookId: id,
            departmentId: deptId,
          })),
        });
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.title !== undefined) {
      updatePayload.title = data.title;
      updatePayload.normalizedTitle = normalizeTitle(data.title);
    }
    if (data.authors !== undefined) {
      updatePayload.authors = JSON.stringify(data.authors);
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.coverUrl !== undefined) updatePayload.coverUrl = data.coverUrl || null;
    if (data.publicationYear !== undefined) updatePayload.publicationYear = data.publicationYear;
    if (data.publisher !== undefined) updatePayload.publisher = data.publisher;
    if (data.isbn10 !== undefined) updatePayload.isbn10 = data.isbn10;
    if (data.isbn13 !== undefined) updatePayload.isbn13 = data.isbn13;
    if (data.pageCount !== undefined) updatePayload.pageCount = data.pageCount;
    if (data.readingStatus !== undefined) updatePayload.readingStatus = data.readingStatus;
    if (data.rating !== undefined) updatePayload.rating = data.rating;
    if (data.isFavorite !== undefined) updatePayload.isFavorite = data.isFavorite;
    if (data.dateStarted !== undefined) {
      updatePayload.dateStarted = data.dateStarted ? new Date(data.dateStarted) : null;
    }
    if (data.dateCompleted !== undefined) {
      updatePayload.dateCompleted = data.dateCompleted ? new Date(data.dateCompleted) : null;
    }
    if (data.currentPage !== undefined) updatePayload.currentPage = data.currentPage;
    if (data.personalReview !== undefined) updatePayload.personalReview = data.personalReview;
    if (data.favoriteCharacter !== undefined) updatePayload.favoriteCharacter = data.favoriteCharacter;
    if (data.notes !== undefined) updatePayload.notes = data.notes;
    if (data.spineColor !== undefined) updatePayload.spineColor = data.spineColor;

    const updated = await prisma.book.update({
      where: { id },
      data: updatePayload,
      include: {
        departments: {
          include: {
            department: true,
          },
        },
        quotes: true,
        readingSessions: true,
      },
    });

    return NextResponse.json({
      book: {
        ...updated,
        authors: (() => {
          try {
            return JSON.parse(updated.authors);
          } catch {
            return [updated.authors];
          }
        })(),
        departments: updated.departments.map((d) => d.department),
      },
    });
  } catch (error) {
    console.error("PATCH /api/books/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update tome." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const existing = await prisma.book.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Tome not found or access denied." },
        { status: 404 }
      );
    }

    await prisma.book.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Tome removed from archives." });
  } catch (error) {
    console.error("DELETE /api/books/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete tome." },
      { status: 500 }
    );
  }
}
