import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { BookDetailClient } from "./BookDetailClient";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  const { id } = await params;

  const [book, allDepartments] = await Promise.all([
    prisma.book.findFirst({
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
    }),
    prisma.department.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    }),
  ]);

  if (!book) {
    notFound();
  }

  const formattedBook = {
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
  };

  return (
    <BookDetailClient
      initialBook={formattedBook}
      allDepartments={allDepartments}
    />
  );
}
