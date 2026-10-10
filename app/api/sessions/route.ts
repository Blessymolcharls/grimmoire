import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReadingSessionSchema } from "@/lib/validations/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    const sessions = await prisma.readingSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            authors: true,
            pageCount: true,
            currentPage: true,
            spineColor: true,
          },
        },
      },
    });

    const formatted = sessions.map((s) => ({
      ...s,
      book: {
        ...s.book,
        authors: (() => {
          try {
            return JSON.parse(s.book.authors);
          } catch {
            return [s.book.authors];
          }
        })(),
      },
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error("GET /api/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading sessions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = ReadingSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookId, startedAt, durationMinutes, pagesRead, note } = parsed.data;

    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: user.id },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Tome not found in your archives." },
        { status: 404 }
      );
    }

    const session = await prisma.readingSession.create({
      data: {
        userId: user.id,
        bookId,
        startedAt: startedAt ? new Date(startedAt) : new Date(),
        durationMinutes,
        pagesRead,
        note,
      },
      include: {
        book: true,
      },
    });

    // Optionally update book's currentPage if new pages were read
    if (pagesRead && pagesRead > 0) {
      const newPage = Math.min(
        book.pageCount || 9999,
        (book.currentPage || 0) + pagesRead
      );
      await prisma.book.update({
        where: { id: bookId },
        data: {
          currentPage: newPage,
          ...(book.readingStatus === "WANT_TO_READ"
            ? { readingStatus: "CURRENTLY_READING", dateStarted: new Date() }
            : {}),
        },
      });
    }

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sessions error:", error);
    return NextResponse.json(
      { error: "Failed to log reading session" },
      { status: 500 }
    );
  }
}
