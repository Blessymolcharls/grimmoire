import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { JournalEntrySchema } from "@/lib/validations/journal";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Journal chronicle not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      entry: {
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
      },
    });
  } catch (error) {
    console.error("GET /api/journal/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve journal chronicle" },
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

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal chronicle not found or access denied." },
        { status: 404 }
      );
    }

    const parsed = JournalEntrySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.bookIds !== undefined) {
      await prisma.journalEntryBook.deleteMany({
        where: { journalEntryId: id },
      });
      if (data.bookIds.length > 0) {
        await prisma.journalEntryBook.createMany({
          data: data.bookIds.map((bId) => ({
            journalEntryId: id,
            bookId: bId,
          })),
        });
      }
    }

    const updated = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(data.title ? { title: data.title } : {}),
        ...(data.content ? { content: data.content } : {}),
        ...(data.entryDate ? { entryDate: new Date(data.entryDate) } : {}),
      },
      include: {
        books: {
          include: {
            book: true,
          },
        },
      },
    });

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error("PATCH /api/journal/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update journal entry" },
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

    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Journal chronicle not found or access denied." },
        { status: 404 }
      );
    }

    await prisma.journalEntry.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Chronicle excised." });
  } catch (error) {
    console.error("DELETE /api/journal/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
