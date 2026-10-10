import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ReadingGoalSchema } from "@/lib/validations/session";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const currentYear = new Date().getFullYear();
    const year = parseInt(searchParams.get("year") || String(currentYear), 10);

    const goal = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year,
        },
      },
    });

    const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);

    const completedBooksCount = await prisma.book.count({
      where: {
        userId: user.id,
        readingStatus: "COMPLETED",
        dateCompleted: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    return NextResponse.json({
      goal: goal || { year, targetBooks: 20 },
      completedCount: completedBooksCount,
    });
  } catch (error) {
    console.error("GET /api/goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading goal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const parsed = ReadingGoalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { year, targetBooks } = parsed.data;

    const goal = await prisma.readingGoal.upsert({
      where: {
        userId_year: {
          userId: user.id,
          year,
        },
      },
      update: { targetBooks },
      create: {
        userId: user.id,
        year,
        targetBooks,
      },
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("PUT /api/goals error:", error);
    return NextResponse.json(
      { error: "Failed to set reading goal" },
      { status: 500 }
    );
  }
}
