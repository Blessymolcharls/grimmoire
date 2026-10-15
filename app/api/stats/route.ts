import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { calculatePagesRead, calculateReadingStreak, calculateGoalProgress } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const currentYear = new Date().getFullYear();

    // 1. Core Book Status Counts
    const [
      totalBooks,
      completedBooks,
      currentlyReading,
      wantToRead,
      onHold,
      dnf,
      favoriteBooks,
    ] = await Promise.all([
      prisma.book.count({ where: { userId: user.id } }),
      prisma.book.count({ where: { userId: user.id, readingStatus: "COMPLETED" } }),
      prisma.book.count({ where: { userId: user.id, readingStatus: "CURRENTLY_READING" } }),
      prisma.book.count({ where: { userId: user.id, readingStatus: "WANT_TO_READ" } }),
      prisma.book.count({ where: { userId: user.id, readingStatus: "ON_HOLD" } }),
      prisma.book.count({ where: { userId: user.id, readingStatus: "DID_NOT_FINISH" } }),
      prisma.book.count({ where: { userId: user.id, isFavorite: true } }),
    ]);

    // 2. Average Personal Rating
    const ratingsAggregate = await prisma.book.aggregate({
      where: {
        userId: user.id,
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });
    const averageRating = ratingsAggregate._avg.rating
      ? Number(ratingsAggregate._avg.rating.toFixed(2))
      : 0;

    // 3. Pages Read Calculation
    const booksWithPages = await prisma.book.findMany({
      where: { userId: user.id },
      select: {
        readingStatus: true,
        pageCount: true,
        currentPage: true,
      },
    });

    const totalPagesRead = calculatePagesRead(booksWithPages);

    // 4. Reading Sessions Stats
    const sessionsAggregate = await prisma.readingSession.aggregate({
      where: { userId: user.id },
      _sum: {
        durationMinutes: true,
        pagesRead: true,
      },
      _count: {
        id: true,
      },
    });

    const totalReadingMinutes = sessionsAggregate._sum.durationMinutes || 0;
    const totalSessionCount = sessionsAggregate._count.id || 0;

    // 5. Monthly Completion Distribution for current year
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const yearCompletedBooks = await prisma.book.findMany({
      where: {
        userId: user.id,
        readingStatus: "COMPLETED",
        dateCompleted: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      select: {
        dateCompleted: true,
      },
    });

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const monthlyCompleted = months.map((monthName, index) => {
      const count = yearCompletedBooks.filter((b) => {
        if (!b.dateCompleted) return false;
        return b.dateCompleted.getMonth() === index;
      }).length;
      return { month: monthName, count };
    });

    // 6. Department Distribution
    const departmentsWithCounts = await prisma.department.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      include: {
        _count: {
          select: {
            books: {
              where: {
                book: {
                  userId: user.id,
                },
              },
            },
          },
        },
      },
    });

    const departmentDistribution = departmentsWithCounts
      .filter((d) => d._count.books > 0)
      .map((d) => ({
        name: d.name,
        slug: d.slug,
        count: d._count.books,
        accentColor: d.accentColor || "#C5A56A",
      }))
      .sort((a, b) => b.count - a.count);

    const favoriteDepartment =
      departmentDistribution.length > 0 ? departmentDistribution[0].name : "Undiscovered";

    // 7. Reading Goal
    const goalRecord = await prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year: currentYear,
        },
      },
    });
    const targetBooks = goalRecord?.targetBooks || 20;
    const completedThisYear = yearCompletedBooks.length;
    const { percentage: goalPercentage } = calculateGoalProgress(completedThisYear, targetBooks);

    // 8. Streak calculation from reading sessions and completed books
    const allActivityDates = await prisma.readingSession.findMany({
      where: { userId: user.id },
      select: { startedAt: true },
    });

    const streak = calculateReadingStreak(
      allActivityDates.map((s) => s.startedAt),
      yearCompletedBooks.map((b) => b.dateCompleted).filter(Boolean) as Date[]
    );

    return NextResponse.json({
      metrics: {
        totalBooks,
        completedBooks,
        currentlyReading,
        wantToRead,
        onHold,
        dnf,
        favoriteBooks,
        totalPagesRead,
        averageRating,
        totalReadingMinutes,
        totalSessionCount,
        streak,
        favoriteDepartment,
        goal: {
          year: currentYear,
          targetBooks,
          completedThisYear,
          percentage: goalPercentage,
        },
      },
      charts: {
        monthlyCompleted,
        departmentDistribution,
      },
    });
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "Failed to compile reading observatory statistics" },
      { status: 500 }
    );
  }
}
