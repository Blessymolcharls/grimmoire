import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { QuoteSchema } from "@/lib/validations/book";
import { z } from "zod";

const CreateQuoteBodySchema = QuoteSchema.extend({
  bookId: z.string().min(1, "Book ID is required"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = CreateQuoteBodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { bookId, text, pageNumber, personalNote } = parsed.data;

    // Verify book is owned by user
    const book = await prisma.book.findFirst({
      where: { id: bookId, userId: user.id },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Tome not found in your collection." },
        { status: 404 }
      );
    }

    const quote = await prisma.quote.create({
      data: {
        bookId,
        text,
        pageNumber,
        personalNote,
      },
    });

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotes error:", error);
    return NextResponse.json(
      { error: "Failed to record quote" },
      { status: 500 }
    );
  }
}
