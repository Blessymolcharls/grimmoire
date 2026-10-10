import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { JournalEntrySchema } from "@/lib/validations/journal";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");
    const search = searchParams.get("search")?.trim();

    const where: Prisma.JournalEntryWhereInput = {
      userId: user.id,
    };

    if (bookId) {
      where.books = {
        some: {
          bookId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const entries = await prisma.journalEntry.findMany({
      where,
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
    });

    const formatted = entries.map((entry) => ({
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

    return NextResponse.json({ entries: formatted });
  } catch (error) {
    console.error("GET /api/journal error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve journal entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = JournalEntrySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { title, content, entryDate, bookIds } = parsed.data;

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title,
        content,
        entryDate: entryDate ? new Date(entryDate) : new Date(),
        books: {
          create: (bookIds || []).map((bId) => ({
            bookId: bId,
          })),
        },
      },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error("POST /api/journal error:", error);
    return NextResponse.json(
      { error: "Failed to scribe journal entry" },
      { status: 500 }
    );
  }
}
