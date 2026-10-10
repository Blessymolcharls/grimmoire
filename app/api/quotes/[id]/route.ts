import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { QuoteSchema } from "@/lib/validations/book";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;
    const body = await request.json();

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!quote || quote.book.userId !== user.id) {
      return NextResponse.json(
        { error: "Quote not found or access denied." },
        { status: 404 }
      );
    }

    const parsed = QuoteSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const updated = await prisma.quote.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ quote: updated });
  } catch (error) {
    console.error("PATCH /api/quotes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update quote" },
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

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!quote || quote.book.userId !== user.id) {
      return NextResponse.json(
        { error: "Quote not found or access denied." },
        { status: 404 }
      );
    }

    await prisma.quote.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Quote vanished." });
  } catch (error) {
    console.error("DELETE /api/quotes/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    );
  }
}
