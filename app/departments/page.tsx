import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { DepartmentsClient } from "./DepartmentsClient";

export const dynamic = "force-dynamic";

export default async function DepartmentsPage() {
  const user = await getCurrentUser();

  const [departments, books] = await Promise.all([
    prisma.department.findMany({
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
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    }),
    prisma.book.findMany({
      where: { userId: user.id },
      include: {
        departments: {
          include: {
            department: true,
          },
        },
      },
    }),
  ]);

  const formattedDepts = departments.map((d) => ({
    ...d,
    bookCount: d._count.books,
  }));

  const formattedBooks = books.map((b) => ({
    ...b,
    authors: (() => {
      try {
        return JSON.parse(b.authors);
      } catch {
        return [b.authors];
      }
    })(),
    departments: b.departments.map((d) => d.department),
  }));

  return (
    <DepartmentsClient
      initialDepartments={formattedDepts}
      allBooks={formattedBooks}
    />
  );
}
