import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const currentYear = new Date().getFullYear();

  const [bookCount, sessionCount, journalCount, goal] = await Promise.all([
    prisma.book.count({ where: { userId: user.id } }),
    prisma.readingSession.count({ where: { userId: user.id } }),
    prisma.journalEntry.count({ where: { userId: user.id } }),
    prisma.readingGoal.findUnique({
      where: {
        userId_year: {
          userId: user.id,
          year: currentYear,
        },
      },
    }),
  ]);

  return (
    <SettingsClient
      user={user}
      bookCount={bookCount}
      sessionCount={sessionCount}
      journalCount={journalCount}
      currentYear={currentYear}
      goalTarget={goal?.targetBooks || 20}
    />
  );
}
