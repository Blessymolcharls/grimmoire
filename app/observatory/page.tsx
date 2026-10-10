import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ObservatoryClient } from "./ObservatoryClient";

export const dynamic = "force-dynamic";

export default async function ObservatoryPage() {
  const user = await getCurrentUser();
  const currentYear = new Date().getFullYear();

  // Fetch real records
  const [
    totalBooks,
    completedBooks,
    currentlyReading,
    wantToRead,
    onHold,
    dnf,
    favoriteBooks,
    sessions,
    departments,
    goalRecord,
  ] = await Promise.all([
    prisma.book.count({ where: { userId: user.id } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "COMPLETED" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "CURRENTLY_READING" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "WANT_TO_READ" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "ON_HOLD" } }),
    prisma.book.count({ where: { userId: user.id, readingStatus: "DID_NOT_FINISH" } }),
    prisma.book.count({ where: { userId: user.id, isFavorite: true } }),
    prisma.readingSession.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: "desc" },
    }),
    prisma.department.findMany({
      where: { OR: [{ userId: null }, { userId: user.id }] },
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
    }),
    prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year: currentYear,
        },
      },
    }),
  ]);

  // Average Rating
  const ratings = await prisma.book.findMany({
    where: { userId: user.id, rating: { not: null } },
    select: { rating: true },
  });
  const avgRating =
    ratings.length > 0
      ? Number(
          (
            ratings.reduce((acc, r) => acc + (r.rating || 0), 0) / ratings.length
          ).toFixed(1)
        )
      : null;

  // Pages read
  const allBooksPages = await prisma.book.findMany({
    where: { userId: user.id },
    select: { pageCount: true, currentPage: true, readingStatus: true },
  });
  let totalPages = 0;
  for (const b of allBooksPages) {
    if (b.readingStatus === "COMPLETED" && b.pageCount) {
      totalPages += b.pageCount;
    } else if (b.currentPage) {
      totalPages += b.currentPage;
    }
  }

  // Monthly completed
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
    select: { dateCompleted: true },
  });

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyCompleted = monthNames.map((month, idx) => {
    const count = yearCompletedBooks.filter(
      (b) => b.dateCompleted && b.dateCompleted.getMonth() === idx
    ).length;
    return { month, count };
  });

  // Department distribution
  const departmentDistribution = departments
    .filter((d) => d._count.books > 0)
    .map((d) => ({
      name: d.name,
      slug: d.slug,
      count: d._count.books,
      accentColor: d.accentColor || "#C5A56A",
    }))
    .sort((a, b) => b.count - a.count);

  // Total reading time & sessions
  const totalMinutes = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const totalSessionPages = sessions.reduce((acc, s) => acc + (s.pagesRead || 0), 0);

  // Goal
  const targetGoal = goalRecord?.targetBooks || 20;
  const completedThisYear = yearCompletedBooks.length;

  return (
    <ObservatoryClient
      stats={{
        totalBooks,
        completedBooks,
        currentlyReading,
        wantToRead,
        onHold,
        dnf,
        favoriteBooks,
        avgRating,
        totalPages,
        totalMinutes,
        totalSessionPages,
        sessionCount: sessions.length,
        currentYear,
        targetGoal,
        completedThisYear,
        monthlyCompleted,
        departmentDistribution,
      }}
    />
  );
}
